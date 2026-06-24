import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { connectToDB } from './db/db';
import authRouter from './routes/auth';
import { errorHandler } from './middlewares/error-handler';
import { doubleCsrfProtection } from './csrf';

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

const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200,
};

app.disable('x-powered-by');
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(doubleCsrfProtection);
app.use('/api/v1/auth', authRouter);

const PORT = process.env.PORT;

app.get('/health', (_req, res) => {
  res.status(200).json({ message: 'Server is healthy' });
});

app.use(errorHandler);

const startServer = async () => {
  app.listen(PORT, () => {
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
