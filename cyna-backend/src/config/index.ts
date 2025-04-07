import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: number;
  databaseUrl: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  jwtRefreshSecret: string;
  jwtRefreshExpiresIn: string;
  corsOrigins: string[];
}

// Basic validation for essential variables
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set.');
}
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set.');
}
if (!process.env.JWT_REFRESH_SECRET) {
  throw new Error('JWT_REFRESH_SECRET environment variable is not set.');
}

let corsOrigins: string[] = [];
const allowedOriginsEnv = process.env.CORS_ORIGIN;
if (allowedOriginsEnv) {
    try {
      if (allowedOriginsEnv.startsWith('[') && allowedOriginsEnv.endsWith(']')) {
        corsOrigins = JSON.parse(allowedOriginsEnv);
      } else {
        corsOrigins = allowedOriginsEnv.split(',').map(origin => origin.trim());
      }
    } catch (error) {
      console.error('Error parsing CORS_ORIGIN environment variable:', error);
      corsOrigins = ['http://localhost:8081', 'http://localhost:5173']; 
    }
  } else {
     console.warn('CORS_ORIGIN environment variable not set. Falling back to default development origins.');
     corsOrigins = ['http://localhost:8081', 'http://localhost:5173'];
  }


const config: Config = {
  port: parseInt(process.env.PORT || '5001', 10),
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  corsOrigins: corsOrigins,
};

export default config; 