import { Request, Response } from 'express';
import { hash, compare } from 'bcrypt-ts';
import jwt, { JwtPayload } from 'jsonwebtoken';
import {
  signAccessToken,
  signRefreshToken,
  hashToken,
  sanitizeUsername,
} from '../utils/helper';
import { User } from '../models/User';
import { Session } from '../models/Session';

const isProd = process.env.NODE_ENV === 'production';

const ACCESS_COOKIE = {
  httpOnly: true,
  secure: isProd,
  sameSite: 'lax' as const,
  maxAge: 15 * 60 * 1000,
};

const REFRESH_COOKIE = {
  httpOnly: true,
  secure: isProd,
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/api/v1/auth/refresh',
};

const issueTokens = async (userId: string, req: Request, res: Response) => {
  const accessToken = signAccessToken(userId);
  const rawRefresh = signRefreshToken(userId);
  const tokenHash = hashToken(rawRefresh);

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await Session.create({
    userId,
    tokenHash,
    expiresAt,
    userAgent: req.headers['user-agent'] ?? '',
    ipAddress: req.ip ?? '',
  });

  res.cookie('accessToken', accessToken, ACCESS_COOKIE);
  res.cookie('refreshToken', rawRefresh, REFRESH_COOKIE);
};

export const registerController = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    const isUserExists = await User.findOne({ email: email.toLowerCase() });
    if (isUserExists) {
      return res
        .status(409)
        .json({ message: 'User with this email already exists' });
    }

    const hashedPassword = await hash(password, 10);
    const newUser = await User.create({
      username: sanitizeUsername(username),
      email: email.toLowerCase(),
      password: hashedPassword,
      provider: 'local',
    });

    await issueTokens(String(newUser._id), req, res);

    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        avatar: newUser.avatar,
      },
    });
  } catch (err) {
    console.error('Error registering user:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const loginController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid Credentials' });
    }

    if (user.provider === 'google') {
      return res.status(409).json({ message: 'Please sign in with Google' });
    }

    const isPasswordCorrect = await compare(password, user.password!);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Invalid Credentials' });
    }

    await issueTokens(String(user._id), req, res);

    return res.status(200).json({
      message: 'User logged in successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error('Error while logging:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const googleSignInController = async (req: Request, res: Response) => {
  try {
    const { accessToken } = req.body;

    const userInfoRes = await fetch(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    if (!userInfoRes.ok) {
      return res.status(401).json({ message: 'Invalid Google token' });
    }

    const { email, name, picture } = (await userInfoRes.json()) as {
      email?: string;
      name?: string;
      picture?: string;
    };

    if (!email) {
      return res
        .status(401)
        .json({ message: 'Unable to retrieve email from Google' });
    }

    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      if (user.provider !== 'google') {
        return res.status(409).json({
          message:
            'An account with this email already exists. Please sign in with your password.',
        });
      }
    } else {
      user = await User.create({
        username: sanitizeUsername(name ?? email.split('@')[0]),
        email: email.toLowerCase(),
        provider: 'google',
        avatar: picture ?? '',
      });
    }

    await issueTokens(String(user._id), req, res);

    return res.status(200).json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error('Error with Google sign-in:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const logoutController = async (req: Request, res: Response) => {
  try {
    const raw = req.cookies?.refreshToken;
    if (raw) {
      await Session.deleteOne({ tokenHash: hashToken(raw) });
    }
    res.clearCookie('accessToken', ACCESS_COOKIE);
    res.clearCookie('refreshToken', REFRESH_COOKIE);
    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('Error during logout:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const meController = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user!.id).select(
      '_id username email avatar',
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error('meController error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const refreshController = async (req: Request, res: Response) => {
  try {
    const raw = req.cookies?.refreshToken;
    if (!raw) {
      return res.status(401).json({ message: 'No refresh token' });
    }

    let payload: JwtPayload;
    try {
      payload = jwt.verify(
        raw,
        process.env.REFRESH_TOKEN_SECRET!,
      ) as JwtPayload;
    } catch {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const tokenHash = hashToken(raw);
    const session = await Session.findOne({ tokenHash });

    if (!session) {
      // Reuse detected — nuke all sessions for this user
      await Session.deleteMany({ userId: payload.id });
      return res.status(401).json({ message: 'Session revoked' });
    }

    await Session.deleteOne({ _id: session._id });
    await issueTokens(String(payload.id), req, res);

    return res.status(200).json({ message: 'Tokens refreshed' });
  } catch (err) {
    console.error('Error refreshing tokens:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
