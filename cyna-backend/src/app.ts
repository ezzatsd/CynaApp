import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './api/routes'; // Import main API router (we'll create this)
import { corsOptions } from './config/cors'; // Import CORS options (we'll create this)
import { ApiError } from './errors/ApiError'; // Importer ApiError pour le handler
// Importer le contrôleur et le routeur webhook
import webhookRouter from './api/routes/webhook.routes'; 

dotenv.config(); // Load environment variables from .env file

const app: Express = express();

// Middleware
app.use(cors(corsOptions)); // Enable CORS with specific options

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

// Global Error Handler (Enhanced Example)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error | ApiError, req: Request, res: Response, next: NextFunction) => {
  console.error('[ERROR HANDLER]:', err);

  // Utiliser le statusCode de ApiError s'il existe
  const statusCode = (err instanceof ApiError) ? err.statusCode : 500;
  const message = (err instanceof ApiError && err.isOperational) ? err.message : 'Internal Server Error';
  
  // En production, ne pas envoyer le stack trace ou les détails non opérationnels
  const responseBody: { message: string; errors?: any } = { message };
  if (process.env.NODE_ENV !== 'production' && !(err instanceof ApiError && err.isOperational)) {
      responseBody.errors = err.stack; // Ou err.errors si Zod a été utilisé
  }
  // Gérer spécifiquement les erreurs de validation Zod formatées
  if (err instanceof ApiError && err.message === 'Validation failed' && err.stack) {
      try {
          responseBody.errors = JSON.parse(err.stack);
      } catch (parseError) { /* Ignorer si ce n'est pas du JSON */ }
  }

  res.status(statusCode).json(responseBody);
});

export default app; 