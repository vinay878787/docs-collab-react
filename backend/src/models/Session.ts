import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  tokenHash: { type: String, required: true, unique: true },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 },
  },
  userAgent: { type: String, default: '' },
  ipAddress: { type: String, default: '' },
});

export const Session = mongoose.model('Session', sessionSchema);
