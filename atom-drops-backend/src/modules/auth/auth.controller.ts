import { Request, Response } from 'express';
import * as authService from './auth.service';
import { StatusCodes } from 'http-status-codes';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await authService.registerUser(email, password);

    // Set token in HTTP-only cookie (Security Best Practice)
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(StatusCodes.CREATED).json({
      message: 'User registered successfully',
      data: { user: result.user, token: result.token },
    });
  } catch (error: any) {
    res
      .status(error.statusCode || StatusCodes.BAD_REQUEST)
      .json({ error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);

    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(StatusCodes.OK).json({
      message: 'Login successful',
      data: { user: result.user, token: result.token },
    });
  } catch (error: any) {
    res
      .status(error.statusCode || StatusCodes.UNAUTHORIZED)
      .json({ error: error.message });
  }
};

export const logout = async (_req: Request, res: Response) => {
  res.clearCookie('token');
  res.status(StatusCodes.OK).json({ message: 'Logged out successfully' });
};

export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const result = await authService.requestPasswordReset(email);
    res.status(StatusCodes.OK).json(result);
  } catch (error: any) {
    res
      .status(error.statusCode || StatusCodes.BAD_REQUEST)
      .json({ error: error.message });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;
    const result = await authService.resetPassword(token, password);
    res.status(StatusCodes.OK).json(result);
  } catch (error: any) {
    res
      .status(error.statusCode || StatusCodes.BAD_REQUEST)
      .json({ error: error.message });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const user = await authService.getProfile(userId);
    res.status(StatusCodes.OK).json({ data: user });
  } catch (error: any) {
    res
      .status(error.statusCode || StatusCodes.NOT_FOUND)
      .json({ error: error.message });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const user = await authService.updateProfile(userId, req.body);
    res.status(StatusCodes.OK).json({
      message: 'Profile updated successfully',
      data: user,
    });
  } catch (error: any) {
    res
      .status(error.statusCode || StatusCodes.BAD_REQUEST)
      .json({ error: error.message });
  }
};