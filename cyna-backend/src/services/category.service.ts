import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export class CategoryService {
  /**
   * Récupère toutes les catégories.
   * @param options - Options de filtrage, pagination, tri (à définir plus tard)
   */
  static async getAllCategories(options?: any) { // TODO: Définir une interface pour les options
    return prisma.category.findMany({
      // TODO: Ajouter la logique de pagination/filtrage/tri basée sur les options
      orderBy: {
        priority: 'asc', // Trier par priorité par défaut
      },
    });
  }

  /**
   * Récupère une catégorie spécifique par son ID, incluant les produits associés.
   * @param categoryId - L'ID de la catégorie à récupérer.
   */
  static async getCategoryById(categoryId: string) {
    return prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        products: true, // Inclut les produits associés à cette catégorie
      },
    });
  }

  // --- Fonctions CRUD supplémentaires (à ajouter) ---

  // static async createCategory(categoryData: Prisma.CategoryCreateInput) { ... }

  // static async updateCategory(categoryId: string, categoryData: Prisma.CategoryUpdateInput) { ... }

  // static async deleteCategory(categoryId: string) { ... }
} 