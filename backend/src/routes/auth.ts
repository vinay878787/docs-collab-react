import { Router } from 'express';
import {
  registerController,
  loginController,
  googleSignInController,
} from '../controllers/auth';

const router = Router();

router.post('/register', registerController);
router.post('/login', loginController);
router.post('/google', googleSignInController);

export default router;
