import jwt from 'jsonwebtoken';

export const signToken = (userId: string) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET!, { expiresIn: '7d' });
};

export const sanitizeUsername = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 30)
    .padEnd(3, '_');
