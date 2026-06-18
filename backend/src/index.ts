import express from 'express';
import { connectToDB } from './db/db';

const app = express();
app.use(express.json());
app.disable('x-powered-by');

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
