import { Router } from 'express';
import { authenticate } from '../../shared/middlewares/auth.middleware';
import { validate } from '../../shared/middlewares/validate.middleware';
import * as addressController from './address.controller';
import { createAddressSchema, updateAddressSchema } from './address.schema';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  validate(createAddressSchema),
  addressController.createAddress
);
router.get('/', addressController.getAddresses);
router.get('/:id', addressController.getAddress);
router.patch(
  '/:id',
  validate(updateAddressSchema),
  addressController.updateAddress
);
router.delete('/:id', addressController.deleteAddress);

export default router;
