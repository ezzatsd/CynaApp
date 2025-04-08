import { PrismaClient, Prisma } from '@prisma/client';
import { ApiError } from '../errors/ApiError';

const prisma = new PrismaClient();

// Interface pour les options de query validées
export interface GetCategoriesOptions {
    page: number;
    limit: number;
    sortBy: 'name' | 'priority' | 'createdAt';
    sortOrder: 'asc' | 'desc';
    // filterByName?: string;
}

export class CategoryService {
  /**
   * Récupère toutes les catégories.
   * @param options - Options de filtrage, pagination, tri (à définir plus tard)
   */
  static async getAllCategories(options: GetCategoriesOptions) {
    const { page, limit, sortBy, sortOrder } = options;
    const skip = (page - 1) * limit;

    const whereClause: Prisma.CategoryWhereInput = {};
    // Exemple de filtre (si activé dans le schéma Zod)
    // if (options.filterByName) {
    //     whereClause.name = { contains: options.filterByName, mode: 'insensitive' };
    // }

    const categories = await prisma.category.findMany({
      skip: skip,
      take: limit,
      where: whereClause,
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    const totalCategories = await prisma.category.count({ where: whereClause });

    return {
      data: categories,
      meta: {
        currentPage: page,
        perPage: limit,
        totalItems: totalCategories,
        totalPages: Math.ceil(totalCategories / limit),
      }
    };
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

  // --- Fonctions CRUD supplémentaires ---

  /**
   * Crée une nouvelle catégorie.
   * @param categoryData - Les données de la catégorie à créer.
   */
  static async createCategory(categoryData: Prisma.CategoryCreateInput) {
    try {
      return await prisma.category.create({
        data: categoryData,
      });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            // Gérer les erreurs connues de Prisma (ex: contrainte unique violée)
            if (error.code === 'P2002') { // Code pour violation de contrainte unique
                throw new ApiError(409, `Category with name '${categoryData.name}' already exists.`);
            }
        }
        // Gérer d'autres erreurs potentielles
        throw new ApiError(500, 'Could not create category');
    }
  }

  /**
   * Met à jour une catégorie existante.
   * @param categoryId - L'ID de la catégorie à mettre à jour.
   * @param categoryData - Les nouvelles données pour la catégorie.
   */
  static async updateCategory(categoryId: string, categoryData: Prisma.CategoryUpdateInput) {
    try {
        // Vérifier d'abord si la catégorie existe
        const existingCategory = await prisma.category.findUnique({ where: { id: categoryId } });
        if (!existingCategory) {
            throw new ApiError(404, `Category with ID ${categoryId} not found`);
        }

        return await prisma.category.update({
            where: { id: categoryId },
            data: categoryData,
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
             throw new ApiError(409, `Category name '${categoryData.name}' is already in use by another category.`);
        }
        if (error instanceof ApiError) throw error; // Relancer les erreurs ApiError connues
        throw new ApiError(500, `Could not update category with ID ${categoryId}`);
    }
  }

  /**
   * Supprime une catégorie.
   * @param categoryId - L'ID de la catégorie à supprimer.
   */
  static async deleteCategory(categoryId: string) {
    try {
        // Vérifier d'abord si la catégorie existe
        const existingCategory = await prisma.category.findUnique({ where: { id: categoryId } });
        if (!existingCategory) {
            throw new ApiError(404, `Category with ID ${categoryId} not found`);
        }

        // Attention: Gérer les produits associés ? Le schéma actuel utilise onDelete: Restrict
        // ce qui empêchera la suppression si des produits existent.
        // Il faut soit supprimer/déplacer les produits d'abord, soit changer la règle onDelete.
        // Pour l'instant, l'erreur Prisma 'P2014' sera levée si des produits existent.

        return await prisma.category.delete({
            where: { id: categoryId },
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
             if (error.code === 'P2014' || error.code === 'P2003') { // Erreur de contrainte de clé étrangère
                throw new ApiError(409, `Cannot delete category with ID ${categoryId} because it still has associated products.`);
            }
        }
        if (error instanceof ApiError) throw error;
        throw new ApiError(500, `Could not delete category with ID ${categoryId}`);
    }
  }
} 