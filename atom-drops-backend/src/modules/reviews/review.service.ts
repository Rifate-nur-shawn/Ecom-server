import { prisma } from '../../config/prisma.client';
import {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
} from '../../shared/errors/app-error';

export const createReview = async (
  userId: string,
  productId: string,
  rating: number,
  comment?: string
) => {
  // Check if product exists
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) throw new NotFoundError('Product not found');

  // Check if user has already reviewed this product
  const existingReview = await prisma.review.findUnique({
    where: {
      product_id_user_id: {
        product_id: productId,
        user_id: userId,
      },
    },
  });

  if (existingReview) {
    throw new BadRequestError('You have already reviewed this product');
  }

  // Optional: Check if user has purchased this product
  const hasPurchased = await prisma.orderItem.findFirst({
    where: {
      product_id: productId,
      order: {
        user_id: userId,
        status: 'DELIVERED',
      },
    },
  });

  if (!hasPurchased) {
    throw new BadRequestError(
      'You can only review products you have purchased'
    );
  }

  const review = await prisma.review.create({
    data: {
      user_id: userId,
      product_id: productId,
      rating,
      comment,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return review;
};

export const getProductReviews = async (
  productId: string,
  page = 1,
  limit = 10,
  ratingFilter?: number
) => {
  const skip = (page - 1) * limit;

  const where: any = { product_id: productId };
  if (ratingFilter) {
    where.rating = ratingFilter;
  }

  const [reviews, total, stats] = await Promise.all([
    prisma.review.findMany({
      where,
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
    prisma.review.count({ where }),
    prisma.review.groupBy({
      by: ['rating'],
      where: { product_id: productId },
      _count: true,
    }),
  ]);

  // Calculate average rating
  const totalReviews = stats.reduce((sum, s) => sum + s._count, 0);
  const averageRating =
    totalReviews > 0
      ? stats.reduce((sum, s) => sum + s.rating * s._count, 0) / totalReviews
      : 0;

  // Rating distribution
  const ratingDistribution = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  };
  stats.forEach((s) => {
    ratingDistribution[s.rating as keyof typeof ratingDistribution] = s._count;
  });

  return {
    reviews,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    stats: {
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10,
      ratingDistribution,
    },
  };
};

export const getReviewById = async (reviewId: string) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  if (!review) throw new NotFoundError('Review not found');
  return review;
};

export const getUserReviews = async (userId: string) => {
  return await prisma.review.findMany({
    where: { user_id: userId },
    orderBy: { created_at: 'desc' },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          images: {
            where: { is_primary: true },
            take: 1,
          },
        },
      },
    },
  });
};

export const updateReview = async (
  userId: string,
  reviewId: string,
  data: any
) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) throw new NotFoundError('Review not found');

  if (review.user_id !== userId) {
    throw new ForbiddenError('You can only update your own reviews');
  }

  return await prisma.review.update({
    where: { id: reviewId },
    data,
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};

export const deleteReview = async (userId: string, reviewId: string) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) throw new NotFoundError('Review not found');

  if (review.user_id !== userId) {
    throw new ForbiddenError('You can only delete your own reviews');
  }

  await prisma.review.delete({
    where: { id: reviewId },
  });

  return { message: 'Review deleted successfully' };
};
