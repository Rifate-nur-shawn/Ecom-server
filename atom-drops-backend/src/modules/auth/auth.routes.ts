import { Router } from 'express';
import * as authController from './auth.controller';
// We will add Zod middleware here later to validation

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);

export default router;