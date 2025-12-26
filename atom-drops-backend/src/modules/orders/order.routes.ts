import { Router } from 'express';
import * as orderController from './order.controller';
import { authenticate } from '../../shared/middlewares/auth.middleware';
import { validate } from '../../shared/middlewares/validate.middleware';
import { createOrderSchema } from './order.schema';

const router = Router();

// Protect all routes below this line
router.use(authenticate);

router.post('/', validate(createOrderSchema), orderController.createOrder);
router.post('/from-cart', orderController.createOrderFromCart);
router.get('/my', orderController.getMyOrders);
router.get('/:id', orderController.getOrder);
router.patch('/:id/cancel', orderController.cancelOrder);

export default router;
