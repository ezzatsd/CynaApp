// This file aggregates all routers and exports a single router for app.ts
import { Router } from 'express';
import authRouter from './auth.routes'; // Corrected import path
import productRouter from './product.routes'; // Importer les routes produits
import categoryRouter from './category.routes'; // Importer les routes catégories
import userRouter from './user.routes'; // Importer les routes utilisateur
import orderRouter from './order.routes'; // Importer les routes commandes
// ... etc ...

const apiRouter = Router();

// Mount individual routers
apiRouter.use('/auth', authRouter); // Mount auth routes under /api/auth
apiRouter.use('/products', productRouter); // Mount product routes under /api/products
apiRouter.use('/categories', categoryRouter); // Mount category routes under /api/categories
apiRouter.use('/users', userRouter); // Mount user routes (pour /api/users/me, /api/users/me/addresses, etc.)
apiRouter.use('/orders', orderRouter); // Monter les routes commandes
// ... etc ...

// Simple health check route for /api
apiRouter.get('/health', (req, res) => {
    res.status(200).json({ status: 'API is running' });
});

export default apiRouter; 