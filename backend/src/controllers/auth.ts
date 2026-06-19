import { Request, Response } from 'express';
import { hash, compare } from 'bcrypt-ts';
import { signToken, sanitizeUsername } from '../utils/helper';
import { User } from '../models/User';

export const registerController = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

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

    const userResponseObject = {
      id: newUser?._id,
      username: newUser?.username,
      email: newUser?.email,
      avatar: newUser?.avatar,
    };

    const token = signToken(String(newUser._id));

    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: userResponseObject,
    });
  } catch (err) {
    console.error('Error registering user:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const loginController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(401).json({
        message: 'Invalid Credentials',
      });
    }

    if (user.provider === 'google') {
      return res.status(409).json({
        message: 'Please sign in with Google',
      });
    }

    const isPasswordCorrect = await compare(password, user.password!);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: 'Invalid Credentials',
      });
    }

    const token = signToken(String(user._id));

    return res.status(200).json({
      message: 'User logged in successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error('Error while logging:', err);

    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};

export const googleSignInController = async (req: Request, res: Response) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res
        .status(400)
        .json({ message: 'Google access token is required' });
    }

    const userInfoRes = await fetch(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
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
      const username = sanitizeUsername(name ?? email.split('@')[0]);

      user = await User.create({
        username,
        email: email.toLowerCase(),
        provider: 'google',
        avatar: picture ?? '',
      });
    }

    const token = signToken(String(user._id));

    res.status(200).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error('Error with Google sign-in:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
