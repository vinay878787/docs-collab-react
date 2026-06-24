import { Router } from 'express';
import crypto from 'crypto';
import {
  registerController,
  loginController,
  googleSignInController,
  logoutController,
  refreshController,
  meController,
} from '../controllers/auth';
import { verifyToken } from '../middlewares/verify-token';
import { validate } from '../middlewares/validate';
import { authLimiter } from '../middlewares/rate-limit';
import {
  loginSchema,
  registerSchema,
  googleSignInSchema,
} from '@docs-collab/shared';
import { generateCsrfToken } from '../csrf';

const router = Router();

const SID_COOKIE = {
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};

router.get('/csrf-token', (req, res) => {
  // Ensure a stable session ID exists so getSessionIdentifier can tie the token
  if (!req.cookies?.sid) {
    const sid = crypto.randomUUID();
    res.cookie('sid', sid, SID_COOKIE);
    req.cookies.sid = sid; // make it visible to getSessionIdentifier in this request
  }
  res.json({ csrfToken: generateCsrfToken(req, res) });
});

router.get('/me', verifyToken, meController);
router.post(
  '/register',
  authLimiter,
  validate(registerSchema),
  registerController,
);
router.post('/login', authLimiter, validate(loginSchema), loginController);
router.post(
  '/google',
  authLimiter,
  validate(googleSignInSchema),
  googleSignInController,
);
router.post('/logout', logoutController);
router.post('/refresh', refreshController);

export default router;
