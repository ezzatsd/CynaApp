import { Request, Response, NextFunction } from 'express';
import { CategoryService } from '../services/category.service';

export class CategoryController {
  /**
   * GET /api/categories
   * Récupère la liste de toutes les catégories.
   */
  static async getAllCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // TODO: Extraire les options de query (page, limit, sort, filter) de req.query
      const categories = await CategoryService.getAllCategories();
      res.status(200).json(categories);
    } catch (error) {
      next(error); // Passe l'erreur au middleware de gestion d'erreurs
    }
  }

  /**
   * GET /api/categories/:id
   * Récupère une catégorie spécifique par son ID.
   */
  static async getCategoryById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categoryId = req.params.id;
      const category = await CategoryService.getCategoryById(categoryId);

      if (!category) {
        const error = new Error(`Category with ID ${categoryId} not found`);
        res.status(404).json({ message: error.message });
        return;
      }

      res.status(200).json(category);
    } catch (error) {
        if (!res.headersSent) {
            next(error);
        }
    }
  }

  // --- Fonctions CRUD supplémentaires (à ajouter) ---

  // static async createCategory(req: Request, res: Response, next: NextFunction): Promise<void> { ... }

  // static async updateCategory(req: Request, res: Response, next: NextFunction): Promise<void> { ... }

  // static async deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void> { ... }
} 