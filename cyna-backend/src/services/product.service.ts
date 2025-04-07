import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export class ProductService {
  /**
   * Récupère tous les produits avec leurs relations éventuelles (catégorie).
   * @param options - Options de filtrage, pagination, tri (à définir plus tard)
   */
  static async getAllProducts(options?: any) { // TODO: Définir une interface pour les options
    // Inclure la catégorie pour chaque produit
    return prisma.product.findMany({
      include: {
        category: true, // Inclut les détails de la catégorie associée
        // variants: true, // Relation 'variants' n'existe pas dans le schéma actuel
      },
      // TODO: Ajouter la logique de pagination/filtrage/tri basée sur les options
    });
  }

  /**
   * Récupère un produit spécifique par son ID.
   * @param productId - L'ID du produit à récupérer.
   */
  static async getProductById(productId: string) {
    return prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        // Relation 'variants' n'existe pas dans le schéma actuel
        // variants: {
        //   include: {
        //     options: true,
        //   },
        // },
      },
    });
  }

  // --- Fonctions CRUD supplémentaires (à ajouter) ---

  // static async createProduct(productData: Prisma.ProductCreateInput) { ... }

  // static async updateProduct(productId: string, productData: Prisma.ProductUpdateInput) { ... }

  // static async deleteProduct(productId: string) { ... }
} 