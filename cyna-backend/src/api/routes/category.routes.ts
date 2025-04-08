import { Router } from 'express';
import { CategoryController } from '../../controllers/category.controller';
import { isAuthenticated, isAdmin } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { 
    createCategorySchema, 
    updateCategorySchema, 
    categoryIdParamSchema, 
    getCategoriesQuerySchema
} from '../../validations/category.validation';

const categoryRouter = Router();

// --- Routes Publiques --- 

// GET /api/categories - Récupérer toutes les catégories (Publique)
// Validation des query params
categoryRouter.get(
    '/', 
    validate(getCategoriesQuerySchema), // Valider page, limit, sortBy, etc.
    CategoryController.getAllCategories
);

// GET /api/categories/:id - Récupérer une catégorie par ID (Publique)
// Validation de l'ID dans l'URL
categoryRouter.get(
    '/:id', 
    validate(categoryIdParamSchema), 
    CategoryController.getCategoryById
);

// --- Routes Administrateur --- 

// POST /api/categories - Créer une nouvelle catégorie (Admin seulement)
// Valide le body, puis vérifie l'authentification et le rôle admin
categoryRouter.post(
    '/', 
    validate(createCategorySchema), 
    isAuthenticated, 
    isAdmin, 
    CategoryController.createCategory
);

// PUT /api/categories/:id - Mettre à jour une catégorie (Admin seulement)
// Valide l'ID et le body, puis vérifie l'authentification et le rôle admin
categoryRouter.put(
    '/:id', 
    validate(updateCategorySchema), 
    isAuthenticated, 
    isAdmin, 
    CategoryController.updateCategory
);

// DELETE /api/categories/:id - Supprimer une catégorie (Admin seulement)
// Valide l'ID, puis vérifie l'authentification et le rôle admin
categoryRouter.delete(
    '/:id', 
    validate(categoryIdParamSchema), // Valide seulement l'ID ici
    isAuthenticated, 
    isAdmin, 
    CategoryController.deleteCategory
);

export default categoryRouter; 