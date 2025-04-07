// This file aggregates all routers and exports a single router for app.ts
import { Router } from 'express';
import authRouter from './auth.routes'; // Corrected import path
import productRouter from './product.routes'; // Importer les routes produits
import categoryRouter from './category.routes'; // Importer les routes catégories
// ... etc ...

const apiRouter = Router();

// Mount individual routers
apiRouter.use('/auth', authRouter); // Mount auth routes under /api/auth
apiRouter.use('/products', productRouter); // Mount product routes under /api/products
apiRouter.use('/categories', categoryRouter); // Mount category routes under /api/categories
// ... etc ...

// Simple health check route for /api
apiRouter.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

export default apiRouter; 