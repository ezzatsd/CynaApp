import { Request, Response, NextFunction } from 'express';
import * as AuthService from '../services/auth.service';
import { Prisma } from '@prisma/client'; // Import Prisma for specific error handling
import { 
    register as registerService, 
    login as loginService, 
    logout as logoutService, 
    refreshAccessToken as refreshAccessTokenService,
    forgotPassword as forgotPasswordService,
    resetPassword as resetPasswordService
} from '../services/auth.service';
import { ApiError } from '../errors/ApiError'; // Importer ApiError

export class AuthController {

  /**
   * POST /api/auth/register
   */
  static async registerUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Utiliser les données validées
      const userData = req.validatedData?.body;
      if (!userData) throw new ApiError(500, 'Validated registration data not found.');
      const newUser = await registerService(userData);
      res.status(201).json(newUser);
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') { // Unique constraint violation
          return next(new ApiError(409, 'User with this email already exists'));
        }
      }
      // Gérer l'erreur spécifique de l'ancien service
      if (error.message === 'User with this email already exists') { 
          return next(new ApiError(409, 'User with this email already exists'));
      }
      next(error); // Autres erreurs
    }
  }

  /**
   * POST /api/auth/login
   */
  static async loginUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Utiliser les données validées
      const credentials = req.validatedData?.body;
      if (!credentials) throw new ApiError(500, 'Validated login data not found.');
      const result = await loginService(credentials);
      if (!result) {
        throw new ApiError(401, 'Invalid email or password');
      }
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/logout
   */
  static async logoutUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        throw new ApiError(400, 'Refresh token is required for logout');
      }
      await logoutService(refreshToken);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/refresh-token
   */
  static async refreshAuthToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Utiliser les données validées
      const { refreshToken } = req.validatedData?.body;
      if (!refreshToken) throw new ApiError(500, 'Validated refresh token not found.');
      const result = await refreshAccessTokenService(refreshToken);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/forgot-password
   */
  static async requestPasswordReset(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Utiliser les données validées
      const { email } = req.validatedData?.body;
      if (!email) throw new ApiError(500, 'Validated email not found.');
      await forgotPasswordService(email);
      res.status(200).json({ message: 'If an account with this email exists, a password reset link has been sent.' });
    } catch (error) {
      console.error('Error during forgot password request:', error);
      res.status(200).json({ message: 'If an account with this email exists, a password reset link has been sent.' });
    }
  }

  /**
   * POST /api/auth/reset-password/:token
   */
  static async performPasswordReset(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Utiliser les données validées
      const token = req.validatedData?.params?.token;
      const password = req.validatedData?.body?.password;
      if (!token || !password) throw new ApiError(500, 'Validated token or password not found.');
      await resetPasswordService(token, password);
      res.status(200).json({ message: 'Password has been reset successfully.' });
    } catch (error) {
      next(error);
    }
  }

} 