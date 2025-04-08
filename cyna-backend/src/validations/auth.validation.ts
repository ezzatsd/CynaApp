import { z } from 'zod';

// Schéma pour la requête /register (si on veut le séparer)
export const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    name: z.string().optional(),
  }),
});

// Schéma pour la requête /login
export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1, "Password is required"),
  }),
});

// Schéma pour la requête /refresh-token
export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, "Refresh token is required"),
  }),
});

// Schéma pour la requête /forgot-password
export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email({ message: "Please provide a valid email address" }),
  }),
});

// Schéma pour la requête /reset-password
export const resetPasswordSchema = z.object({
  // Le token sera dans les params de l'URL
  params: z.object({
     token: z.string().min(1, "Reset token is required"),
  }),
  // Le nouveau mot de passe dans le body
  body: z.object({
    password: z.string().min(8, "New password must be at least 8 characters long"),
  }),
}); 