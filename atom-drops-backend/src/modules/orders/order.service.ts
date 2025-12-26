import { prisma } from "../../config/prisma.client";
import {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} from "../../shared/errors/app-error";
import { sendOrderConfirmationEmail } from "../../shared/utils/email.util";

// Create order with inventory management
export const createOrder = async (
  userId: string,
  items: { product_id: string; quantity: number }[],
  shippingAddressId?: string
) => {
  // 1. Validate shipping address
  if (shippingAddressId) {
    const address = await prisma.address.findFirst({
      where: { id: shippingAddressId, user_id: userId },
    });
    if (!address) throw new NotFoundError("Invalid shipping address");
  }

  // 2. Fetch all products and validate stock
  const productIds = items.map((i) => i.product_id);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
  });

  if (products.length !== items.length) {
    throw new NotFoundError("Some products not found");
  }

  let totalAmount = 0;
  const orderItemsData = items.map((item) => {
    const product = products.find((p) => p.id === item.product_id);
    if (!product)
      throw new NotFoundError(`Product ${item.product_id} not found`);

    // ✅ Stock validation
    if (product.stock < item.quantity) {
      throw new BadRequestError(
        `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
      );
    }

    const itemTotal = product.price * item.quantity;
    totalAmount += itemTotal;

    return {
      product_id: product.id,
      quantity: item.quantity,
      price: product.price,
    };
  });

  // 3. Create order and reduce stock atomically
  const order = await prisma.$transaction(async (tx) => {
    // Create the order
    const newOrder = await tx.order.create({
      data: {
        user_id: userId,
        total_amount: totalAmount,
        status: "PENDING",
        shipping_address_id: shippingAddressId,
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: {
          include: { product: true },
        },
        shipping_address: true,
        user: true,
      },
    });

    // ✅ Reduce stock for each product
    for (const item of items) {
      await tx.product.update({
        where: { id: item.product_id },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    return newOrder;
  });

  // Send order confirmation email
  await sendOrderConfirmationEmail(order.user.email, order);

  return order;
};

// ✅ Create order from cart
export const createOrderFromCart = async (
  userId: string,
  shippingAddressId?: string
) => {
  const cart = await prisma.cart.findUnique({
    where: { user_id: userId },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    throw new BadRequestError("Cart is empty");
  }

  const orderItems = cart.items.map((item) => ({
    product_id: item.product_id,
    quantity: item.quantity,
  }));

  const order = await createOrder(userId, orderItems, shippingAddressId);

  // Clear cart after successful order
  await prisma.cartItem.deleteMany({
    where: { cart_id: cart.id },
  });

  return order;
};

// Get user's orders
export const getMyOrders = async (userId: string) => {
  return await prisma.order.findMany({
    where: { user_id: userId },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              price: true,
              images: {
                where: { is_primary: true },
                take: 1,
              },
            },
          },
        },
      },
      shipping_address: true,
      payment: true,
    },
    orderBy: { created_at: "desc" },
  });
};

// Get single order
export const getOrderById = async (userId: string, orderId: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
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
      shipping_address: true,
      payment: true,
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
        },
      },
    },
  });

  if (!order) throw new NotFoundError("Order not found");
  if (order.user_id !== userId) throw new UnauthorizedError("Unauthorized");

  return order;
};

// ✅ Cancel order and restore stock
export const cancelOrder = async (userId: string, orderId: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, payment: true },
  });

  if (!order) throw new NotFoundError("Order not found");
  if (order.user_id !== userId) throw new UnauthorizedError("Unauthorized");

  // Check if order can be cancelled
  if (
    order.status === "PAID" ||
    order.status === "PROCESSING" ||
    order.status === "SHIPPED" ||
    order.status === "DELIVERED"
  ) {
    throw new BadRequestError(
      "Cannot cancel orders that are paid, processing, shipped, or delivered"
    );
  }

  if (order.status === "CANCELLED") {
    throw new BadRequestError("Order is already cancelled");
  }

  // Cancel order and restore stock
  await prisma.$transaction(async (tx) => {
    // Update order status
    await tx.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED" },
    });

    // Restore stock
    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.product_id },
        data: {
          stock: {
            increment: item.quantity,
          },
        },
      });
    }

    // Cancel payment if exists
    if (order.payment) {
      await tx.payment.update({
        where: { id: order.payment.id },
        data: { status: "FAILED" },
      });
    }
  });

  return { message: "Order cancelled successfully" };
};

// Update order status (Admin use)
export const updateOrderStatus = async (
  orderId: string,
  status: string,
  trackingNumber?: string
) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) throw new NotFoundError("Order not found");

  const updateData: any = { status };
  if (trackingNumber) updateData.tracking_number = trackingNumber;

  if (status === "SHIPPED" && !order.estimated_delivery) {
    // Set estimated delivery to 7 days from now
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 7);
    updateData.estimated_delivery = estimatedDelivery;
  }

  return await prisma.order.update({
    where: { id: orderId },
    data: updateData,
    include: {
      items: {
        include: { product: true },
      },
      shipping_address: true,
      user: true,
    },
  });
};
