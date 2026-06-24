import http from 'http';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import { connectToDB } from './db/db';
import authRouter from './routes/auth';
import docsRouter from './routes/docs';
import { errorHandler } from './middlewares/error-handler';
import { globalLimiter } from './middlewares/rate-limit';
import { doubleCsrfProtection } from './csrf';
import { initSocket } from './socket';

if (!process.env.ACCESS_TOKEN_SECRET) {
  throw new Error('ACCESS_TOKEN_SECRET environment variable is not set');
}
if (!process.env.REFRESH_TOKEN_SECRET) {
  throw new Error('REFRESH_TOKEN_SECRET environment variable is not set');
}
if (!process.env.CSRF_SECRET) {
  throw new Error('CSRF_SECRET environment variable is not set');
}

const app = express();

// Trust the first proxy hop (e.g. the platform load balancer) so req.ip and
// the rate limiter see the real client IP rather than the proxy's.
app.set('trust proxy', 1);

const corsOptions = {
  origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200,
};

app.disable('x-powered-by');
// Security headers. CSP is intentionally left to the frontend's static host —
// this server only emits JSON — and CORP is relaxed so the separate frontend
// origin can read responses (CORS still governs access).
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);
app.use(cors(corsOptions));
app.use(cookieParser());
// Cap request bodies — these endpoints only carry small JSON (titles, emails,
// tokens); large document state travels over the socket, not here.
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));
app.use(globalLimiter);
app.use(doubleCsrfProtection);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/docs', docsRouter);

app.get('/health', (_req, res) => {
  res.status(200).json({ message: 'Server is healthy' });
});

app.use(errorHandler);

const PORT = process.env.PORT;

const startServer = async () => {
  // Wrap Express in a raw Node http.Server so Socket.io can attach to it.
  // Socket.io intercepts the WebSocket upgrade before Express ever sees it.
  const httpServer = http.createServer(app);
  initSocket(httpServer);

  httpServer.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
  });

  try {
    await connectToDB();
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
};

startServer();
