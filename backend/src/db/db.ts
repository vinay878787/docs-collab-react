import mongoose from 'mongoose';

const mongodbUrl = process.env.MONGODB_URL;

export const connectToDB = async () => {
  try {
    if (!mongodbUrl) {
      throw new Error('MONGODB_URL is not defined');
    }

    await mongoose.connect(mongodbUrl);

    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);

    throw error;
  }
};
