import { Request, Response, NextFunction } from 'express';
import * as AuthService from '../services/auth.service';
import { Prisma } from '@prisma/client'; // Import Prisma for specific error handling

export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // TODO: Add validation for request body (name, email, password)
    const { email, password, name } = req.body;
    if (!email || !password) {
       return res.status(400).json({ message: 'Email and password are required' });
    }
    // Minimal password validation example
    if (password.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    const newUser = await AuthService.register({ email, name, password });
    // Exclude password hash from response
    res.status(201).json({ message: 'User registered successfully', user: newUser });

  } catch (error) {
     // Handle specific errors, e.g., unique constraint violation
     if (error instanceof Error && error.message.includes('already exists')) {
        return res.status(409).json({ message: error.message }); // Conflict
     }
    // Pass other errors to the global error handler
    next(error);
  }
};

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // TODO: Add validation for request body (email, password)
     const { email, password } = req.body;
     if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
     }

    const result = await AuthService.login({ email, password });

    if (!result) {
      return res.status(401).json({ message: 'Invalid email or password' }); // Unauthorized
    }

    // TODO: Consider setting refresh token in HttpOnly cookie for web clients
    // res.cookie('refreshToken', result.refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: ... });

    res.status(200).json({
      message: 'Login successful',
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken, // Send refresh token in body for mobile clients
    });

  } catch (error) {
    next(error);
  }
};

// Add controllers for logout, refreshToken, forgotPassword, resetPassword later 