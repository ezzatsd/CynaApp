// This file aggregates all routers and exports a single router for app.ts
import { Router } from 'express';
// Import individual routers as they are created
// import authRouter from './routes/auth.routes';
// import productRouter from './routes/product.routes';
// ... etc ...

const apiRouter = Router();

// Mount individual routers
// apiRouter.use('/auth', authRouter);
// apiRouter.use('/products', productRouter);
// ... etc ...

// Simple health check route for /api
apiRouter.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

export default apiRouter; 