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
      // TODO: Utiliser le schéma de validation Zod ici
      const newUser = await registerService(req.body);
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
      // TODO: Utiliser le schéma de validation Zod ici
      const result = await loginService(req.body);
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
      // TODO: Utiliser le schéma de validation Zod ici
      const { refreshToken } = req.body;
      if (!refreshToken) { // Vérification basique en attendant Zod
         throw new ApiError(400, 'Refresh token is required');
      }
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
      // TODO: Utiliser le schéma de validation Zod ici
      const { email } = req.body;
      if (!email) { // Vérification basique en attendant Zod
         throw new ApiError(400, 'Email is required');
      }
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
       // TODO: Utiliser le schéma de validation Zod ici
      const { token } = req.params;
      const { password } = req.body;
       if (!token || !password) { // Vérification basique
          throw new ApiError(400, 'Token and new password are required');
       }
      await resetPasswordService(token, password);
      res.status(200).json({ message: 'Password has been reset successfully.' });
    } catch (error) {
      next(error);
    }
  }

} 