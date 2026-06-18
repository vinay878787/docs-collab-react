import mongoose from 'mongoose';
import { IUser } from '@docs-collab/shared';

const userSchema = new mongoose.Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      match: [
        /^[a-zA-Z0-9_]+$/,
        'Username can only contain letters, numbers, and underscores',
      ],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address',
      ],
    },

    password: {
      type: String,
      required: function (this: IUser) {
        return this.provider === 'local';
      },
      minlength: [8, 'Password must be at least 8 characters'],
    },

    provider: {
      type: String,
      enum: {
        values: ['local', 'google'],
        message: 'Provider must be local or google',
      },
      default: 'local',
    },

    avatar: {
      type: String,
      default: '',
      validate: {
        validator: function (value: string) {
          if (!value) return true;
          return /^https?:\/\/.+/.test(value);
        },
        message: 'Avatar must be a valid URL',
      },
    },
  },
  {
    timestamps: true,
  },
);

export const User = mongoose.model<IUser>('User', userSchema);
