import http from 'http';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { connectToDB } from './db/db';
import authRouter from './routes/auth';
import docsRouter from './routes/docs';
import { errorHandler } from './middlewares/error-handler';
import { doubleCsrfProtection } from './csrf';
import { globalLimiter } from './middlewares/rate-limit';
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

// Behind a TLS-terminating reverse proxy (duckdns/HTTPS -> Express over HTTP).
// Trust the first proxy hop so req.ip / req.protocol reflect the real client.
app.set('trust proxy', 1);

const corsOptions = {
  origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200,
};

app.disable('x-powered-by');
app.use(cors(corsOptions));
app.use(globalLimiter); // broad anti-flood cap across the whole API
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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
