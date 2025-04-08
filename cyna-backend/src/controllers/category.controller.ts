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
      // Utiliser les données validées depuis le middleware
      const options = req.validatedData?.query as unknown as GetCategoriesOptions;
      if (!options) {
          // Sécurité : Ne devrait pas arriver si le middleware a bien tourné
           throw new ApiError(500, 'Validated query data not found after validation middleware.');
      }
      const result = await CategoryService.getAllCategories(options);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/categories/:id
   * Récupère une catégorie spécifique par son ID.
   */
  static async getCategoryById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categoryId = req.validatedData?.params?.id;
       if (!categoryId) {
          throw new ApiError(500, 'Validated category ID not found.');
      }
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
      const newCategory = await CategoryService.createCategory(req.validatedData?.body);
      res.status(201).json(newCategory);
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
      const categoryId = req.validatedData?.params?.id;
       if (!categoryId) throw new ApiError(500, 'Validated category ID not found.');
      const updatedCategory = await CategoryService.updateCategory(categoryId, req.validatedData?.body);
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
      const categoryId = req.validatedData?.params?.id;
       if (!categoryId) throw new ApiError(500, 'Validated category ID not found.');
      await CategoryService.deleteCategory(categoryId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
} 