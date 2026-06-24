import crypto from 'crypto';
import jwt from 'jsonwebtoken';

export const signAccessToken = (userId: string) =>
  jwt.sign({ id: userId }, process.env.ACCESS_TOKEN_SECRET!, {
    expiresIn: '15m',
  });

export const signRefreshToken = (userId: string) =>
  jwt.sign({ id: userId }, process.env.REFRESH_TOKEN_SECRET!, {
    expiresIn: '7d',
  });

export const hashToken = (token: string) =>
  crypto.createHash('sha256').update(token).digest('hex');

export const sanitizeUsername = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 30)
    .padEnd(3, '_');
