import { Router } from 'express';
import { CategoryController } from '../../controllers/category.controller';

const categoryRouter = Router();

// GET /api/categories - Récupérer toutes les catégories
categoryRouter.get('/', CategoryController.getAllCategories);

// GET /api/categories/:id - Récupérer une catégorie par ID
categoryRouter.get('/:id', CategoryController.getCategoryById);

// --- Routes CRUD supplémentaires (à ajouter) ---
// POST /api/categories - Créer une nouvelle catégorie (nécessite auth + admin)
// categoryRouter.post('/', /* isAuthenticated, isAdmin, */ CategoryController.createCategory);

// PUT /api/categories/:id - Mettre à jour une catégorie (nécessite auth + admin)
// categoryRouter.put('/:id', /* isAuthenticated, isAdmin, */ CategoryController.updateCategory);

// DELETE /api/categories/:id - Supprimer une catégorie (nécessite auth + admin)
// categoryRouter.delete('/:id', /* isAuthenticated, isAdmin, */ CategoryController.deleteCategory);

export default categoryRouter; 