import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet'; // Importer Helmet
import path from 'path'; // Ré-importer path
import apiRouter from './api/routes'; // Import main API router (we'll create this)
import { corsOptions } from './config/cors'; // Import CORS options (we'll create this)
import { ApiError } from './errors/ApiError'; // Importer ApiError pour le handler
// Importer le contrôleur et le routeur webhook
import webhookRouter from './api/routes/webhook.routes'; 
import logger from './config/logger'; // Importer le logger
import rateLimit from 'express-rate-limit'; // Importer express-rate-limit

dotenv.config({ path: path.resolve(process.cwd(), '.env') }); // Garder le chargement simple

const app: Express = express();

// --- Middleware Sécurité --- 
app.use(helmet()); // Utiliser Helmet (doit être tôt)
app.use(cors(corsOptions)); // Enable CORS with specific options

// --- Rate Limiter --- 
// Appliquer aux routes API pour prévenir les abus
const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limiter chaque IP à 100 requêtes par `window` (ici, par 15 minutes)
	standardHeaders: true, // Retourner l'info de limite dans les en-têtes `RateLimit-*`
	legacyHeaders: false, // Désactiver les en-têtes `X-RateLimit-*` (legacy)
    message: { message: 'Too many requests from this IP, please try again after 15 minutes' },
    handler: (req, res, next, options) => {
        logger.warn(`Rate limit exceeded for IP ${req.ip}`, { path: req.path });
	    res.status(options.statusCode).send(options.message);
    }
});
// Appliquer le limiter seulement aux routes /api
app.use('/api', apiLimiter);

// IMPORTANT: Webhook route doit être AVANT express.json() pour recevoir le corps brut
// Nous montons donc le routeur webhook ici.
app.use('/api/webhooks', webhookRouter); 

// Parseurs pour les autres routes
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// API Routes
app.use('/api', apiRouter); // Mount API routes under /api

// Simple Root Route
app.get('/', (req: Request, res: Response) => {
  res.send('Cyna Backend API is running!');
});

// --- Global Error Handler --- 
app.use((err: Error | ApiError, req: Request, res: Response, next: NextFunction) => {
  logger.error(
    `${req.method} ${req.originalUrl} - Error: ${err.message}`,
    { stack: err.stack, statusCode: (err instanceof ApiError) ? err.statusCode : 500 }
  );

  let statusCode = 500;
  let responseBody: { message: string; errors?: any } = { message: 'Internal Server Error' };

  if (err instanceof ApiError) {
      statusCode = err.statusCode;
      // Toujours utiliser le message de l'ApiError si elle est définie, 
      // même si elle n'est pas "opérationnelle", car c'est souvent voulu (ex: 404)
      responseBody.message = err.message;

      // Gérer les erreurs de validation Zod spécifiquement SI le message correspond
      // et que le stack est une string (pour éviter erreurs sur d'autres types d'erreurs)
      if (err.message === 'Validation failed' && typeof err.stack === 'string') {
          try {
              responseBody.errors = JSON.parse(err.stack); 
          } catch (parseError) { 
               if (process.env.NODE_ENV !== 'production') {
                   // Afficher le stack brut en dev si le parsing JSON échoue
                   responseBody.errors = err.stack;
               }
          }
      } else if (process.env.NODE_ENV !== 'production' && !err.isOperational) {
          // Inclure le stack pour les autres erreurs non opérationnelles en dev 
           responseBody.errors = err.stack;
      }
  } else if (process.env.NODE_ENV !== 'production') {
     responseBody.message = err.message;
     responseBody.errors = err.stack;
  }

  if (res.headersSent) {
    logger.warn('Headers already sent, skipping error response.', { path: req.path });
    return next(err); 
  }

  res.status(statusCode).json(responseBody);
});

export default app; 