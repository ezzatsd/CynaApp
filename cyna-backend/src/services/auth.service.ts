import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import config from '../config';

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
   
   // TODO: Store refresh token

   const { passwordHash, ...userWithoutPassword } = user;

   return {
     user: userWithoutPassword,
     accessToken,
     refreshToken,
   };
 };

// Add functions for logout (invalidate refresh token), refresh token handling, etc. later 