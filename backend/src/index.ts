import express from 'express';
import { connectToDB } from './db/db';
import authRouter from './routes/auth';

const app = express();
app.disable('x-powered-by');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/v1/auth', authRouter);

const PORT = process.env.PORT;

app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Server is healthy' });
});

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
