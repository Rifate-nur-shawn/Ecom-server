import { Router } from 'express';
import { authenticate } from '../../shared/middlewares/auth.middleware';
import { validate } from '../../shared/middlewares/validate.middleware';
import * as reviewController from './review.controller';
import {
  createReviewSchema,
  updateReviewSchema,
  getProductReviewsSchema,
} from './review.schema';

const router = Router();

// Public routes
router.get(
  '/products/:productId',
  validate(getProductReviewsSchema),
  reviewController.getProductReviews
);
router.get('/:id', reviewController.getReview);

// Protected routes
router.use(authenticate);
router.post('/', validate(createReviewSchema), reviewController.createReview);
router.get('/user/me', reviewController.getUserReviews);
router.patch(
  '/:id',
  validate(updateReviewSchema),
  reviewController.updateReview
);
router.delete('/:id', reviewController.deleteReview);

export default router;
