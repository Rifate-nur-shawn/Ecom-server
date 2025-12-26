import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as reviewService from './review.service';

export const createReview = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { product_id, rating, comment } = req.body;

    const review = await reviewService.createReview(
      userId,
      product_id,
      rating,
      comment
    );

    res.status(StatusCodes.CREATED).json({
      message: 'Review created successfully',
      data: review,
    });
  } catch (error: any) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
  }
};

export const getProductReviews = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const rating = req.query.rating
      ? parseInt(req.query.rating as string)
      : undefined;

    const result = await reviewService.getProductReviews(
      productId,
      page,
      limit,
      rating
    );

    res.status(StatusCodes.OK).json({ data: result });
  } catch (error: any) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
  }
};

export const getReview = async (req: Request, res: Response) => {
  try {
    const review = await reviewService.getReviewById(req.params.id);

    res.status(StatusCodes.OK).json({ data: review });
  } catch (error: any) {
    res.status(StatusCodes.NOT_FOUND).json({ error: error.message });
  }
};

export const getUserReviews = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const reviews = await reviewService.getUserReviews(userId);

    res.status(StatusCodes.OK).json({ data: reviews });
  } catch (error: any) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
  }
};

export const updateReview = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const review = await reviewService.updateReview(
      userId,
      req.params.id,
      req.body
    );

    res.status(StatusCodes.OK).json({
      message: 'Review updated successfully',
      data: review,
    });
  } catch (error: any) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
  }
};

export const deleteReview = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const result = await reviewService.deleteReview(userId, req.params.id);

    res.status(StatusCodes.OK).json(result);
  } catch (error: any) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
  }
};
