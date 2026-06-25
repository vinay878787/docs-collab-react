import { doubleCsrf } from 'csrf-csrf';

// Development is opt-in. If NODE_ENV isn't "development", assume the backend is
// serving a production deployment (HTTPS, possibly cross-site).
const isDev = process.env.NODE_ENV === 'development';

export const { doubleCsrfProtection, generateCsrfToken } = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET!,

  // sid cookie is set by the /csrf-token route before validation occurs.
  getSessionIdentifier: (req) => req.cookies?.sid ?? req.ip ?? '',

  cookieName: isDev ? 'csrf-secret' : '__Host-csrf',

  cookieOptions: {
    httpOnly: true,
    secure: !isDev,
    // Cross-site frontend → backend in production requires SameSite=None.
    // Local HTTP development works with SameSite=Lax.
    sameSite: isDev ? ('lax' as const) : ('none' as const),
    path: '/',
  },

  getCsrfTokenFromRequest: (req) => req.headers['x-csrf-token'] as string,
});
