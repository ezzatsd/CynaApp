import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import config from '../config';
import { ApiError } from '../errors/ApiError';
import crypto from 'crypto';
import { EmailService } from './email.service';
import logger from '../config/logger';

const prisma = new PrismaClient();
const SALT_ROUNDS = 10; // Standard salt rounds for bcrypt

// Define User type based on Prisma model if needed elsewhere, or infer
type User = Prisma.UserGetPayload<{}>;

// Type for the payload
interface AccessTokenPayload {
   userId: string;
   email: string;
   isAdmin: boolean;
 }
 
 interface RefreshTokenPayload {
   userId: string;
 }

// Explicitly type options
const accessTokenOptions: SignOptions = {
  expiresIn: '1h', // Use string literal directly
};

const refreshTokenOptions: SignOptions = {
  expiresIn: '7d', // Use string literal directly
};

// Function to generate JWT access token
const generateAccessToken = (payload: AccessTokenPayload) => {
  return jwt.sign(payload, config.jwtSecret, accessTokenOptions);
};

// Function to generate JWT refresh token (longer expiry)
// In a real app, you would store refresh tokens securely (e.g., in Session model)
const generateRefreshToken = (payload: RefreshTokenPayload) => {
   return jwt.sign(payload, config.jwtRefreshSecret, refreshTokenOptions);
 };

// Use Prisma.validator for input type if needed, or define explicitly
// For register, we expect email, name, password (not passwordHash)
interface RegisterInput {
  email: string;
  name?: string | null;
  password: string; 
}
export const register = async (userData: RegisterInput): Promise<Omit<User, 'passwordHash'>> => {
  const existingUser = await prisma.user.findUnique({
    where: { email: userData.email.toLowerCase() },
  });

  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Hash the password received
  const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);

  const newUser = await prisma.user.create({
    data: {
      email: userData.email.toLowerCase(),
      name: userData.name,
      passwordHash: hashedPassword,
    },
  });

  const { passwordHash, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

// For login, we expect email and password
interface LoginInput {
   email: string;
   password: string;
}

// --- Gestion des Sessions / Refresh Tokens --- 

/**
 * Stocke un nouveau refresh token (session) pour un utilisateur.
 */
const storeRefreshToken = async (userId: string, token: string): Promise<void> => {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 jours (doit correspondre à JWT_REFRESH_EXPIRES_IN)
    try {
        await prisma.session.create({
            data: {
                userId: userId,
                token: token, // Idéalement, stocker un hash du token ici
                expiresAt: expiresAt,
            },
        });
    } catch (error: unknown) {
        const err = error as Error;
        logger.error('Failed to store refresh token:', { userId, error: err.message });
    }
};

/**
 * Vérifie si un refresh token est valide et appartient à un utilisateur.
 * Retourne l'utilisateur associé si valide, sinon null.
 */
const verifyRefreshToken = async (token: string): Promise<User | null> => {
    try {
        // 1. Vérifier le JWT lui-même (signature, expiration basique)
        const decoded = jwt.verify(token, config.jwtRefreshSecret) as RefreshTokenPayload;
        
        // 2. Vérifier dans la base de données (existe, non expiré, appartient à l'utilisateur)
        const session = await prisma.session.findFirst({
            where: {
                token: token, // Ou hash(token)
                userId: decoded.userId,
                expiresAt: { gt: new Date() }, // Doit être supérieur à maintenant
            },
            include: { user: true }, // Inclure l'utilisateur associé
        });

        if (!session) {
            return null; // Session invalide ou expirée en BDD
        }
        
        return session.user;
    } catch (error) {
        // Erreur JWT (signature invalide, expiré, etc.) ou erreur DB
        return null;
    }
};

/**
 * Supprime un refresh token (déconnexion).
 */
const deleteRefreshToken = async (token: string): Promise<void> => {
    try {
        await prisma.session.deleteMany({ // deleteMany au cas où (même si token devrait être unique)
            where: { token: token },
        });
    } catch (error: unknown) {
        const err = error as Error;
        logger.error('Failed to delete refresh token:', { error: err.message });
    }
};

// --- Mise à jour fonction Login --- 
export const login = async (credentials: LoginInput): Promise<{ user: Omit<User, 'passwordHash'>, accessToken: string, refreshToken: string } | null> => {
   const user = await prisma.user.findUnique({
     where: { email: credentials.email.toLowerCase() },
   });

   if (!user) {
     return null;
   }

   const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);

   if (!isPasswordValid) {
     return null;
   }

   // Use userId for payload
   const accessTokenPayload: AccessTokenPayload = { userId: user.id, email: user.email, isAdmin: user.isAdmin };
   const refreshTokenPayload: RefreshTokenPayload = { userId: user.id };

   const accessToken = generateAccessToken(accessTokenPayload);
   const refreshToken = generateRefreshToken(refreshTokenPayload);
   
   // Stocker le nouveau refresh token
   await storeRefreshToken(user.id, refreshToken);

   const { passwordHash, ...userWithoutPassword } = user;

   return {
     user: userWithoutPassword,
     accessToken,
     refreshToken,
   };
 };

 // --- Nouvelles Fonctions --- 

 /**
  * Génère un nouvel access token à partir d'un refresh token valide.
  */
 export const refreshAccessToken = async (refreshToken: string): Promise<{ accessToken: string } | null> => {
     const user = await verifyRefreshToken(refreshToken);
     if (!user) {
         throw new ApiError(401, 'Invalid or expired refresh token');
     }

     // Générer un nouvel access token
     const accessTokenPayload: AccessTokenPayload = { userId: user.id, email: user.email, isAdmin: user.isAdmin };
     const newAccessToken = generateAccessToken(accessTokenPayload);

     return { accessToken: newAccessToken };
 };

 /**
  * Gère la déconnexion en supprimant le refresh token.
  */
 export const logout = async (refreshToken: string): Promise<void> => {
     // Simplement supprimer le token de la BDD
     await deleteRefreshToken(refreshToken);
 };

 // --- Réinitialisation de Mot de Passe --- 

 /**
  * Génère un token de réinitialisation, le stocke (hashé) et envoie l'email.
  */
 export const forgotPassword = async (email: string): Promise<void> => {
     const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
     if (!user) {
         logger.warn(`Password reset requested for non-existent email: ${email}`);
         return; 
     }

     // Générer un token aléatoire simple (pour l'email)
     const resetToken = crypto.randomBytes(32).toString('hex');

     // Hasher le token avant de le stocker en BDD
     const passwordResetToken = crypto
         .createHash('sha256')
         .update(resetToken)
         .digest('hex');

     // Définir une date d'expiration (ex: 1 heure)
     const passwordResetExpires = new Date(Date.now() + 3600000); // 1 heure

     try {
         await prisma.user.update({
             where: { email: email.toLowerCase() },
             data: {
                 passwordResetToken: passwordResetToken,
                 passwordResetExpires: passwordResetExpires,
             },
         });

         // Envoyer l'email avec le token NON hashé
         await EmailService.sendPasswordResetEmail(user.email, resetToken);

     } catch (error: unknown) {
         const err = error as Error;
         logger.error("Forgot password process failed for user:", { userId: user?.id, error: err.message });
     }
 };

 /**
  * Réinitialise le mot de passe si le token est valide.
  */
 export const resetPassword = async (token: string, newPass: string): Promise<void> => {
     // Hasher le token reçu pour le comparer à celui en BDD
     const hashedToken = crypto
         .createHash('sha256')
         .update(token)
         .digest('hex');

     // Trouver l'utilisateur avec ce token hashé ET dont le token n'a pas expiré
     const user = await prisma.user.findFirst({
         where: {
             passwordResetToken: hashedToken,
             passwordResetExpires: { gt: new Date() }, // Supérieur à maintenant
         },
     });

     if (!user) {
         throw new ApiError(400, 'Password reset token is invalid or has expired');
     }

     // Mettre à jour le mot de passe
     const newPasswordHash = await bcrypt.hash(newPass, 10);

     await prisma.user.update({
         where: { id: user.id },
         data: {
             passwordHash: newPasswordHash,
             passwordResetToken: null, // Invalider le token après usage
             passwordResetExpires: null,
         },
     });

     // Optionnel: Envoyer un email de confirmation de changement de mdp
 }; 