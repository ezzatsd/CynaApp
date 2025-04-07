import { Router } from 'express';
import { ProductController } from '../../controllers/product.controller';

const productRouter = Router();

// GET /api/products - Récupérer tous les produits
productRouter.get('/', ProductController.getAllProducts);

// GET /api/products/:id - Récupérer un produit par ID
productRouter.get('/:id', ProductController.getProductById);

// --- Routes CRUD supplémentaires (à ajouter) ---
// POST /api/products - Créer un nouveau produit (nécessite auth + admin)
// productRouter.post('/', /* isAuthenticated, isAdmin, */ ProductController.createProduct);

// PUT /api/products/:id - Mettre à jour un produit (nécessite auth + admin)
// productRouter.put('/:id', /* isAuthenticated, isAdmin, */ ProductController.updateProduct);

// DELETE /api/products/:id - Supprimer un produit (nécessite auth + admin)
// productRouter.delete('/:id', /* isAuthenticated, isAdmin, */ ProductController.deleteProduct);

export default productRouter; 