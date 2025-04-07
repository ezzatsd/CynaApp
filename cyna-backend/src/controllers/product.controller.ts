import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service';
// import { NotFoundError } from '../errors/NotFoundError'; // Remplacé par une erreur générique pour l'instant

export class ProductController {
  /**
   * GET /api/products
   * Récupère la liste de tous les produits.
   */
  static async getAllProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // TODO: Extraire les options de query (page, limit, sort, filter) de req.query
      const products = await ProductService.getAllProducts();
      res.status(200).json(products);
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
        res.status(404).json({ message: error.message });
        return; // Important pour ne pas appeler next() après avoir envoyé une réponse
      }

      res.status(200).json(product);
    } catch (error) {
      // S'assurer que les erreurs inattendues sont passées au middleware
      if (!res.headersSent) {
          next(error);
      }
    }
  }

  // --- Fonctions CRUD supplémentaires (à ajouter) ---

  // static async createProduct(req: Request, res: Response, next: NextFunction): Promise<void> { ... }

  // static async updateProduct(req: Request, res: Response, next: NextFunction): Promise<void> { ... }

  // static async deleteProduct(req: Request, res: Response, next: NextFunction): Promise<void> { ... }
} 