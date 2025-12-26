import { Router } from 'express';
import * as productController from './product.controller';
import { authenticate } from '../../shared/middlewares/auth.middleware';
import { validate } from '../../shared/middlewares/validate.middleware';
import { createProductSchema } from './product.schema';

const router = Router();

// Public routes
router.get('/', productController.getProducts);
router.get('/slug/:slug', productController.getProductBySlug);
router.get('/:id', productController.getProduct);

// Protected routes (Admin only)
router.post(
  '/',
  authenticate,
  validate(createProductSchema),
  productController.createProduct
);
router.patch('/:id', authenticate, productController.updateProduct);
router.delete('/:id', authenticate, productController.deleteProduct);

// Image management routes
router.post('/:id/images', authenticate, productController.addProductImage);
router.delete(
  '/:id/images/:imageId',
  authenticate,
  productController.deleteProductImage
);
router.patch(
  '/:id/images/:imageId/primary',
  authenticate,
  productController.setPrimaryImage
);

export default router;
