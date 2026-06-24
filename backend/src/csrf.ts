import { doubleCsrf } from 'csrf-csrf';

export const { doubleCsrfProtection, generateCsrfToken } = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET!,
  // sid cookie is set by the /csrf-token route before this is called
  getSessionIdentifier: (req) => req.cookies?.sid ?? req.ip ?? '',
  cookieName:
    process.env.NODE_ENV === 'production' ? '__Host-csrf' : 'csrf-secret',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  },
  getCsrfTokenFromRequest: (req) => req.headers['x-csrf-token'] as string,
});
