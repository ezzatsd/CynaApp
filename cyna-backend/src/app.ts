import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './api/routes'; // Import main API router (we'll create this)
import { corsOptions } from './config/cors'; // Import CORS options (we'll create this)

dotenv.config(); // Load environment variables from .env file

const app: Express = express();

// Middleware
app.use(cors(corsOptions)); // Enable CORS with specific options
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// API Routes
app.use('/api', apiRouter); // Mount API routes under /api

// Simple Root Route
app.get('/', (req: Request, res: Response) => {
  res.send('Cyna Backend API is running!');
});

// Global Error Handler (Basic Example)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

export default app; 