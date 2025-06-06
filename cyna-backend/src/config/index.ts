import dotenv from 'dotenv';
import path from 'path';

// Charger simplement .env par défaut pour l'application
// L'environnement de test (Jest) chargera .env.test via setupFiles
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

interface Config {
  port: number;
  databaseUrl: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  jwtRefreshSecret: string;
  jwtRefreshExpiresIn: string;
  corsOrigins: string[];
  stripePublishableKey: string;
  stripeSecretKey: string;
  stripeWebhookSecret: string;
  // Variables Email
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  emailFrom: string;
  // URL Frontend (pour les liens dans les emails)
  frontendUrl: string;
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
  stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  // Charger les variables SMTP (optionnelles, Ethereal sinon)
  smtpHost: process.env.SMTP_HOST,
  smtpPort: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined,
  smtpUser: process.env.SMTP_USER,
  smtpPass: process.env.SMTP_PASS,
  emailFrom: process.env.EMAIL_FROM || 'no-reply@cyna.app', // Adresse expéditeur par défaut
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000', // URL frontend par défaut
};

// Validation simple pour les clés essentielles
if (!config.databaseUrl) {
    console.error('FATAL ERROR: DATABASE_URL is not defined in .env');
    process.exit(1);
}
if (!config.jwtSecret || config.jwtSecret === 'DEFAULT_SECRET') {
    console.warn('WARNING: JWT_SECRET is not set or uses default value in .env');
}
if (!config.jwtRefreshSecret || config.jwtRefreshSecret === 'DEFAULT_REFRESH_SECRET') {
    console.warn('WARNING: JWT_REFRESH_SECRET is not set or uses default value in .env');
}
// Ajouter une vérification pour les clés Stripe (surtout la clé secrète)
if (!config.stripeSecretKey) {
    console.warn('WARNING: STRIPE_SECRET_KEY is not defined in .env. Stripe functionality will fail.');
}
if (!config.stripeWebhookSecret) {
    console.warn('WARNING: STRIPE_WEBHOOK_SECRET is not defined in .env. Stripe webhooks will fail verification.');
}
if (!config.emailFrom) {
    console.warn('WARNING: EMAIL_FROM is not defined in .env. Using default.');
}
if (!config.frontendUrl) {
    console.warn('WARNING: FRONTEND_URL is not defined in .env. Using default.');
}

export default config; 