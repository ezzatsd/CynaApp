import { Router } from 'express';
import { ProductController } from '../../controllers/product.controller';
import { isAuthenticated, isAdmin } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { 
    createProductSchema, 
    updateProductSchema, 
    productIdParamSchema,
    getProductsQuerySchema
} from '../../validations/product.validation';

const productRouter = Router();

// --- Routes Publiques --- 

// GET /api/products - Récupérer tous les produits (Publique)
// Validation des query params
productRouter.get(
    '/', 
    validate(getProductsQuerySchema),
    ProductController.getAllProducts
);

// GET /api/products/:id - Récupérer un produit par ID (Publique)
productRouter.get(
    '/:id', 
    validate(productIdParamSchema), 
    ProductController.getProductById
);

// --- Routes Administrateur --- 

// POST /api/products - Créer un nouveau produit (Admin seulement)
productRouter.post(
    '/', 
    validate(createProductSchema), 
    isAuthenticated, 
    isAdmin, 
    ProductController.createProduct
);

// PUT /api/products/:id - Mettre à jour un produit (Admin seulement)
productRouter.put(
    '/:id', 
    validate(updateProductSchema), 
    isAuthenticated, 
    isAdmin, 
    ProductController.updateProduct
);

// DELETE /api/products/:id - Supprimer un produit (Admin seulement)
productRouter.delete(
    '/:id', 
    validate(productIdParamSchema), // Valide seulement l'ID
    isAuthenticated, 
    isAdmin, 
    ProductController.deleteProduct
);

export default productRouter; 