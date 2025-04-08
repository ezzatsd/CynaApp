import { Request, Response, NextFunction } from 'express';
import { ProductService, GetProductsOptions } from '../services/product.service';
import { ApiError } from '../errors/ApiError';
// import { NotFoundError } from '../errors/NotFoundError'; // Remplacé par une erreur générique pour l'instant

export class ProductController {
  /**
   * GET /api/products
   * Récupère la liste de tous les produits.
   */
  static async getAllProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // req.query contient les valeurs validées et avec défauts par Zod
      const options = req.query as unknown as GetProductsOptions;
      const result = await ProductService.getAllProducts(options);
      res.status(200).json(result);
    } catch (error) {
      next(error); // Passe l'erreur au middleware de gestion d'erreurs
    }
  }

  /**
   * GET /api/products/:id
   * Récupère un produit spécifique par son ID.
   */
  static async getProductById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const productId = req.params.id;
      const product = await ProductService.getProductById(productId);

      if (!product) {
        // Lancer une erreur standard si le produit n'est pas trouvé
        const error = new Error(`Product with ID ${productId} not found`);
        // Vous pourriez vouloir définir un statut spécifique pour cette erreur
        // (error as any).statusCode = 404;
        // Ou utiliser une classe d'erreur personnalisée plus tard
        // throw new NotFoundError(`Product with ID ${productId} not found`);
        return next(new ApiError(404, `Product with ID ${productId} not found`));
      }

      res.status(200).json(product);
    } catch (error) {
      // S'assurer que les erreurs inattendues sont passées au middleware
      if (!res.headersSent) {
          next(error);
      }
    }
  }

  // --- Fonctions CRUD supplémentaires ---

  /**
   * POST /api/products
   * Crée un nouveau produit.
   */
  static async createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Données validées par Zod
      const newProduct = await ProductService.createProduct(req.body);
      res.status(201).json(newProduct);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/products/:id
   * Met à jour un produit existant.
   */
  static async updateProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const productId = req.params.id;
      // Données validées par Zod
      const updatedProduct = await ProductService.updateProduct(productId, req.body);
      res.status(200).json(updatedProduct);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/products/:id
   * Supprime un produit.
   */
  static async deleteProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const productId = req.params.id;
      // ID validé par Zod
      await ProductService.deleteProduct(productId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
} 