import { Router } from 'express';
import * as AuthController from '../../controllers/auth.controller';
// Import validation middleware later
// import { validate } from '../middleware/validate.middleware'; 
// import { registerSchema, loginSchema } from '../../types/validationSchemas'; // Define validation schemas later

const authRouter = Router();

// POST /api/auth/register
// Add validation middleware before controller: validate(registerSchema)
authRouter.post('/register', AuthController.registerUser);

// POST /api/auth/login
// Add validation middleware: validate(loginSchema)
authRouter.post('/login', AuthController.loginUser);

// Add routes for /logout, /refresh-token, /forgot-password, /reset-password later

export default authRouter; 