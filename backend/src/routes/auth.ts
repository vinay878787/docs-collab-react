import { Router } from 'express';
import {
  registerController,
  loginController,
  googleSignInController,
  logoutController,
} from '../controllers/auth';
import { validate } from '../middlewares/validate';
import {
  loginSchema,
  registerSchema,
  googleSignInSchema,
} from '@docs-collab/shared';

const router = Router();

router.post('/register', validate(registerSchema), registerController);
router.post('/login', validate(loginSchema), loginController);
router.post('/google', validate(googleSignInSchema), googleSignInController);
router.post('/logout', logoutController);

export default router;
