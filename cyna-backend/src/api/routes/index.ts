// This file aggregates all routers and exports a single router for app.ts
import { Router } from 'express';
import authRouter from './auth.routes'; // Corrected import path
// import productRouter from './product.routes';
// ... etc ...

const apiRouter = Router();

// Mount individual routers
apiRouter.use('/auth', authRouter); // Mount auth routes under /api/auth
// apiRouter.use('/products', productRouter);
// ... etc ...

// Simple health check route for /api
apiRouter.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

export default apiRouter; 