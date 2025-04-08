import { Request, Response, NextFunction } from 'express';
import { CategoryService, GetCategoriesOptions } from '../services/category.service';
import { ApiError } from '../errors/ApiError';

export class CategoryController {
  /**
   * GET /api/categories
   * Récupère la liste de toutes les catégories.
   */
  static async getAllCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // req.query contient les valeurs validées et avec défauts par Zod
      const options = req.query as unknown as GetCategoriesOptions;
      const result = await CategoryService.getAllCategories(options);
      res.status(200).json(result);
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
        return next(new ApiError(404, `Category with ID ${categoryId} not found`));
      }

      res.status(200).json(category);
    } catch (error) {
        next(error);
    }
  }

  // --- Fonctions CRUD supplémentaires ---

  /**
   * POST /api/categories
   * Crée une nouvelle catégorie.
   */
  static async createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Les données ont été validées par le middleware Zod
      const newCategory = await CategoryService.createCategory(req.body);
      res.status(201).json(newCategory); // 201 Created
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/categories/:id
   * Met à jour une catégorie existante.
   */
  static async updateCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categoryId = req.params.id;
      // Les données ont été validées par le middleware Zod
      const updatedCategory = await CategoryService.updateCategory(categoryId, req.body);
      res.status(200).json(updatedCategory);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/categories/:id
   * Supprime une catégorie.
   */
  static async deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categoryId = req.params.id;
      // La validation de l'ID a été faite par le middleware Zod
      await CategoryService.deleteCategory(categoryId);
      res.status(204).send(); // 204 No Content
    } catch (error) {
      next(error);
    }
  }
} 