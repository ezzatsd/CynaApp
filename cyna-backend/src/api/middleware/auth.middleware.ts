import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { ApiError } from '../../errors/ApiError'; // Correction du chemin relatif

const prisma = new PrismaClient();

interface JwtPayload {
  userId: string;
}

// Étendre l'interface Request d'Express pour inclure l'utilisateur
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; isAdmin: boolean };
    }
  }
}

/**
 * Middleware pour vérifier l'authenticité du token JWT.
 * Attache les informations de l'utilisateur à req.user si le token est valide.
 */
export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Authentication required: No token provided'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, isAdmin: true }, // Sélectionne seulement les champs nécessaires
    });

    if (!user) {
      return next(new ApiError(401, 'Authentication failed: User not found'));
    }

    req.user = user; // Attache l'utilisateur à la requête
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
        return next(new ApiError(401, `Authentication failed: ${error.message}`));
    }
    next(new ApiError(500, 'Internal Server Error during authentication')); // Erreur inattendue
  }
};

/**
 * Middleware pour vérifier si l'utilisateur authentifié est un administrateur.
 * Doit être utilisé APRÈS le middleware isAuthenticated.
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    // Ne devrait pas arriver si isAuthenticated est utilisé avant, mais sécurité supplémentaire
    return next(new ApiError(401, 'Authentication required before checking admin status'));
  }

  if (!req.user.isAdmin) {
    return next(new ApiError(403, 'Forbidden: Administrator access required'));
  }

  next();
}; 