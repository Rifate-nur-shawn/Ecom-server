import { prisma } from '../../config/prisma.client';
import { generateUniqueSlug } from '../../shared/utils/slug.util';
import { NotFoundError, BadRequestError } from '../../shared/errors/app-error';

// Create product with slug and images
export const createProduct = async (data: any) => {
  // Generate unique slug
  const slug = await generateUniqueSlug(data.name, 'product');

  // Validate category if provided
  if (data.category_id) {
    const category = await prisma.category.findUnique({
      where: { id: data.category_id },
    });
    if (!category) throw new NotFoundError('Category not found');
  }

  const product = await prisma.product.create({
    data: {
      ...data,
      slug,
    },
    include: {
      category: true,
      images: true,
    },
  });

  return product;
};

// Get all products with advanced filtering and search
export const getAllProducts = async (filters?: {
  search?: string;
  category_id?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'name';
  page?: number;
  limit?: number;
}) => {
  const page = filters?.page || 1;
  const limit = filters?.limit || 20;
  const skip = (page - 1) * limit;

  const where: any = {};

  // Search functionality
  if (filters?.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  // Category filter
  if (filters?.category_id) {
    where.category_id = filters.category_id;
  }

  // Price range filter
  if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
    where.price = {};
    if (filters.minPrice !== undefined) where.price.gte = filters.minPrice;
    if (filters.maxPrice !== undefined) where.price.lte = filters.maxPrice;
  }

  // Stock filter
  if (filters?.inStock) {
    where.stock = { gt: 0 };
  }

  // Sorting
  let orderBy: any = { created_at: 'desc' };
  if (filters?.sortBy === 'price_asc') orderBy = { price: 'asc' };
  if (filters?.sortBy === 'price_desc') orderBy = { price: 'desc' };
  if (filters?.sortBy === 'name') orderBy = { name: 'asc' };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        category: true,
        images: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: { reviews: true },
        },
      },
    }),
    prisma.product.count({ where }),
  ]);

  // Calculate average rating for each product
  const productsWithRatings = await Promise.all(
    products.map(async (product) => {
      const ratingStats = await prisma.review.aggregate({
        where: { product_id: product.id },
        _avg: { rating: true },
      });

      return {
        ...product,
        averageRating: ratingStats._avg.rating
          ? Math.round(ratingStats._avg.rating * 10) / 10
          : null,
        reviewCount: product._count.reviews,
      };
    })
  );

  return {
    products: productsWithRatings,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Get product by ID with full details
export const getProductById = async (id: string) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      images: {
        orderBy: { order: 'asc' },
      },
      _count: {
        select: { reviews: true },
      },
    },
  });

  if (!product) throw new NotFoundError('Product not found');

  // Get average rating
  const ratingStats = await prisma.review.aggregate({
    where: { product_id: id },
    _avg: { rating: true },
  });

  return {
    ...product,
    averageRating: ratingStats._avg.rating
      ? Math.round(ratingStats._avg.rating * 10) / 10
      : null,
    reviewCount: product._count.reviews,
  };
};

// Get product by slug
export const getProductBySlug = async (slug: string) => {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      images: {
        orderBy: { order: 'asc' },
      },
      _count: {
        select: { reviews: true },
      },
    },
  });

  if (!product) throw new NotFoundError('Product not found');

  // Get average rating
  const ratingStats = await prisma.review.aggregate({
    where: { product_id: product.id },
    _avg: { rating: true },
  });

  return {
    ...product,
    averageRating: ratingStats._avg.rating
      ? Math.round(ratingStats._avg.rating * 10) / 10
      : null,
    reviewCount: product._count.reviews,
  };
};

// Update product
export const updateProduct = async (id: string, data: any) => {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new NotFoundError('Product not found');

  // Generate new slug if name is updated
  if (data.name && data.name !== product.name) {
    data.slug = await generateUniqueSlug(data.name, 'product');
  }

  // Validate category if provided
  if (data.category_id) {
    const category = await prisma.category.findUnique({
      where: { id: data.category_id },
    });
    if (!category) throw new NotFoundError('Category not found');
  }

  return await prisma.product.update({
    where: { id },
    data,
    include: {
      category: true,
      images: true,
    },
  });
};

// Delete product
export const deleteProduct = async (id: string) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          orderItems: true,
          cartItems: true,
        },
      },
    },
  });

  if (!product) throw new NotFoundError('Product not found');

  if (product._count.orderItems > 0) {
    throw new BadRequestError(
      'Cannot delete product that has been ordered. Consider marking it as out of stock instead.'
    );
  }

  // Remove from carts before deleting
  if (product._count.cartItems > 0) {
    await prisma.cartItem.deleteMany({
      where: { product_id: id },
    });
  }

  await prisma.product.delete({ where: { id } });

  return { message: 'Product deleted successfully' };
};

// Product image management
export const addProductImage = async (
  productId: string,
  imageData: {
    url: string;
    alt_text?: string;
    is_primary?: boolean;
    order?: number;
  }
) => {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new NotFoundError('Product not found');

  // If this is set as primary, unset other primary images
  if (imageData.is_primary) {
    await prisma.productImage.updateMany({
      where: { product_id: productId },
      data: { is_primary: false },
    });
  }

  return await prisma.productImage.create({
    data: {
      product_id: productId,
      ...imageData,
    },
  });
};

export const deleteProductImage = async (imageId: string) => {
  const image = await prisma.productImage.findUnique({ where: { id: imageId } });
  if (!image) throw new NotFoundError('Image not found');

  await prisma.productImage.delete({ where: { id: imageId } });

  return { message: 'Image deleted successfully' };
};

export const setPrimaryImage = async (imageId: string) => {
  const image = await prisma.productImage.findUnique({ where: { id: imageId } });
  if (!image) throw new NotFoundError('Image not found');

  // Unset all primary images for this product
  await prisma.productImage.updateMany({
    where: { product_id: image.product_id },
    data: { is_primary: false },
  });

  // Set this image as primary
  return await prisma.productImage.update({
    where: { id: imageId },
    data: { is_primary: true },
  });
};