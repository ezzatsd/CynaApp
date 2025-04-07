// Basic CORS configuration - Adjust origins based on your frontend URLs
import { CorsOptions } from 'cors';

const allowedOriginsEnv = process.env.CORS_ORIGIN;
let allowedOrigins: string[] = [];

if (allowedOriginsEnv) {
  try {
    // Expecting a comma-separated string or a JSON array string
    if (allowedOriginsEnv.startsWith('[') && allowedOriginsEnv.endsWith(']')) {
      allowedOrigins = JSON.parse(allowedOriginsEnv);
    } else {
      allowedOrigins = allowedOriginsEnv.split(',').map(origin => origin.trim());
    }
  } catch (error) {
    console.error('Error parsing CORS_ORIGIN environment variable:', error);
    // Fallback to a default development origin if parsing fails
    allowedOrigins = ['http://localhost:8081', 'http://localhost:5173']; 
  }
} else {
   console.warn('CORS_ORIGIN environment variable not set. Falling back to default development origins.');
   allowedOrigins = ['http://localhost:8081', 'http://localhost:5173'];
}

export const corsOptions: CorsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps or curl requests in dev)
    // Or check if origin is in the allowed list
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Allow cookies if needed later
  optionsSuccessStatus: 204,
}; 