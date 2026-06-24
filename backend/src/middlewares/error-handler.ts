import { NextFunction, Request, Response } from 'express';

export const errorHandler = (
  err: Error & { status?: number; statusCode?: number; code?: string },
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  // Full detail stays in server logs only.
  console.error(err);

  if (res.headersSent) return;

  const status = err.status ?? err.statusCode ?? 500;
  // Never echo raw internal error text (stack traces, driver messages, etc.)
  // back to clients on a 5xx — only deliberate 4xx messages are safe to expose.
  const message =
    status < 500 ? (err.message ?? 'Request failed') : 'Internal server error';

  res.status(status).json({ message });
};
