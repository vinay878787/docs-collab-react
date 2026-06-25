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

const isDev = process.env.NODE_ENV === 'development';

const SID_COOKIE = {
  // Read only server-side (CSRF session binding), so it can be httpOnly too.
  httpOnly: true,
  sameSite: isDev ? ('lax' as const) : ('none' as const),
  secure: !isDev,
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
// authLimiter throttles credential endpoints to blunt brute-force / stuffing.
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
router.post('/refresh', authLimiter, refreshController);

export default router;
