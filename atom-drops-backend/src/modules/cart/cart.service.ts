import { prisma } from '../../config/prisma.client';
import { NotFoundError, BadRequestError } from '../../shared/errors/app-error';

// Get or create cart for user
export const getOrCreateCart = async (userId: string) => {
  let cart = await prisma.cart.findUnique({
    where: { user_id: userId },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: {
                where: { is_primary: true },
                take: 1,
              },
            },
          },
        },
      },
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { user_id: userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  where: { is_primary: true },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });
  }

  // Calculate total
  const total = cart.items.reduce((sum, item) => {
    return sum + item.product.price * item.quantity;
  }, 0);

  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return { ...cart, total, itemCount };
};

// Add item to cart
export const addToCart = async (
  userId: string,
  productId: string,
  quantity: number
) => {
  // Check if product exists and has stock
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) throw new NotFoundError('Product not found');
  if (product.stock < quantity)
    throw new BadRequestError('Insufficient stock available');

  // Get or create cart
  let cart = await prisma.cart.findUnique({
    where: { user_id: userId },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { user_id: userId },
    });
  }

  // Check if item already exists
  const existingItem = await prisma.cartItem.findUnique({
    where: {
      cart_id_product_id: {
        cart_id: cart.id,
        product_id: productId,
      },
    },
  });

  let cartItem;
  if (existingItem) {
    // Update quantity
    const newQuantity = existingItem.quantity + quantity;
    if (newQuantity > product.stock) {
      throw new BadRequestError(
        `Cannot add ${quantity} more. Only ${product.stock - existingItem.quantity} available`
      );
    }

    cartItem = await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: newQuantity },
      include: { product: true },
    });
  } else {
    // Create new item
    cartItem = await prisma.cartItem.create({
      data: {
        cart_id: cart.id,
        product_id: productId,
        quantity,
      },
      include: { product: true },
    });
  }

  return cartItem;
};

// Update cart item quantity
export const updateCartItem = async (
  userId: string,
  itemId: string,
  quantity: number
) => {
  const item = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: {
      cart: true,
      product: true,
    },
  });

  if (!item || item.cart.user_id !== userId) {
    throw new NotFoundError('Cart item not found');
  }

  if (quantity === 0) {
    // Remove item if quantity is 0
    await prisma.cartItem.delete({ where: { id: itemId } });
    return { message: 'Item removed from cart' };
  }

  if (quantity > item.product.stock) {
    throw new BadRequestError(
      `Only ${item.product.stock} units available in stock`
    );
  }

  const updated = await prisma.cartItem.update({
    where: { id: itemId },
    data: { quantity },
    include: { product: true },
  });

  return updated;
};

// Remove item from cart
export const removeFromCart = async (userId: string, itemId: string) => {
  const item = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: { cart: true },
  });

  if (!item || item.cart.user_id !== userId) {
    throw new NotFoundError('Cart item not found');
  }

  await prisma.cartItem.delete({ where: { id: itemId } });
  return { message: 'Item removed from cart' };
};

// Clear entire cart
export const clearCart = async (userId: string) => {
  const cart = await prisma.cart.findUnique({
    where: { user_id: userId },
  });

  if (!cart) throw new NotFoundError('Cart not found');

  await prisma.cartItem.deleteMany({
    where: { cart_id: cart.id },
  });

  return { message: 'Cart cleared successfully' };
};
