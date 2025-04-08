import { Router } from 'express';
import { AuthController } from '../../controllers/auth.controller';
import { validate } from '../middleware/validate.middleware';
import { 
    registerSchema,
    loginSchema,
    refreshTokenSchema, 
    forgotPasswordSchema, 
    resetPasswordSchema 
} from '../../validations/auth.validation';

const authRouter = Router();

// POST /api/auth/register
authRouter.post(
    '/register', 
    validate(registerSchema), 
    AuthController.registerUser
);

// POST /api/auth/login
authRouter.post(
    '/login', 
    validate(loginSchema), 
    AuthController.loginUser
);

// POST /api/auth/logout
authRouter.post(
    '/logout', 
    AuthController.logoutUser
);

// POST /api/auth/refresh-token
authRouter.post(
    '/refresh-token', 
    validate(refreshTokenSchema), 
    AuthController.refreshAuthToken
);

// POST /api/auth/forgot-password
authRouter.post(
    '/forgot-password', 
    validate(forgotPasswordSchema), 
    AuthController.requestPasswordReset
);

// POST /api/auth/reset-password/:token 
authRouter.post(
    '/reset-password/:token', 
    validate(resetPasswordSchema), 
    AuthController.performPasswordReset
);

export default authRouter; 