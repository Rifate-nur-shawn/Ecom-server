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
    });

    res.status(StatusCodes.CREATED).json({
      message: 'User registered successfully',
      user: { id: result.user.id, email: result.user.email },
    });
  } catch (error: any) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);

    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });

    res.status(StatusCodes.OK).json({
      message: 'Login successful',
      user: { id: result.user.id, email: result.user.email, role: result.user.role },
    });
  } catch (error: any) {
    res.status(StatusCodes.UNAUTHORIZED).json({ error: error.message });
  }
};