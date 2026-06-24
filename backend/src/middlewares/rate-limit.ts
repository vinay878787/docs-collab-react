import rateLimit from 'express-rate-limit';

// Broad safety net for the whole API. Generous enough that a normal SPA session
// (frequent /me, doc fetches, csrf-token) never trips it, but it caps abusive
// floods from a single IP.
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});

// Tight limit on credential endpoints to blunt brute-force / credential-stuffing.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  // Only failed attempts count, so a legitimate user logging in repeatedly
  // (or hitting register once) isn't punished for successful requests.
  skipSuccessfulRequests: true,
  message: { message: 'Too many attempts, please try again later.' },
});
