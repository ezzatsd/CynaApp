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
      // Utiliser les données validées
      const options = req.validatedData?.query as unknown as GetProductsOptions;
      if (!options) throw new ApiError(500, 'Validated query data not found.');
      const result = await ProductService.getAllProducts(options);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/products/:id
   * Récupère un produit spécifique par son ID.
   */
  static async getProductById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Utiliser les données validées
      const productId = req.validatedData?.params?.id;
      if (!productId) throw new ApiError(500, 'Validated product ID not found.');
      const product = await ProductService.getProductById(productId);
      if (!product) {
        return next(new ApiError(404, `Product with ID ${productId} not found`));
      }
      res.status(200).json(product);
    } catch (error) {
      next(error);
    }
  }

  // --- Fonctions CRUD supplémentaires ---

  /**
   * POST /api/products
   * Crée un nouveau produit.
   */
  static async createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Utiliser les données validées
      const productData = req.validatedData?.body;
      if (!productData) throw new ApiError(500, 'Validated product data not found.');
      const newProduct = await ProductService.createProduct(productData);
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
      // Utiliser les données validées
      const productId = req.validatedData?.params?.id;
      const productData = req.validatedData?.body;
      if (!productId || !productData) throw new ApiError(500, 'Validated product ID or data not found.');
      const updatedProduct = await ProductService.updateProduct(productId, productData);
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
      // Utiliser les données validées
      const productId = req.validatedData?.params?.id;
      if (!productId) throw new ApiError(500, 'Validated product ID not found.');
      await ProductService.deleteProduct(productId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
} 