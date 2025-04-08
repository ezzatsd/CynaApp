import { PrismaClient, Prisma } from '@prisma/client';
import { ApiError } from '../errors/ApiError';

const prisma = new PrismaClient();

// Helper pour s'assurer que la catégorie existe
async function ensureCategoryExists(categoryId: string) {
    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
        throw new ApiError(400, `Invalid categoryId: Category with ID ${categoryId} does not exist.`);
    }
}

// Interface pour les options de query validées
export interface GetProductsOptions {
    page: number;
    limit: number;
    sortBy: 'name' | 'price' | 'createdAt' | 'priorityInCategory';
    sortOrder: 'asc' | 'desc';
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    isAvailable?: boolean;
    isTopProduct?: boolean;
}

export class ProductService {
  /**
   * Récupère tous les produits avec leurs relations éventuelles (catégorie).
   * @param options - Options de filtrage, pagination, tri (à définir plus tard)
   */
  static async getAllProducts(options: GetProductsOptions) {
    const { page, limit, sortBy, sortOrder, categoryId, minPrice, maxPrice, search, isAvailable, isTopProduct } = options;
    const skip = (page - 1) * limit;

    const whereClause: Prisma.ProductWhereInput = {};

    if (categoryId) {
      whereClause.categoryId = categoryId;
    }
    if (minPrice !== undefined) {
        if (whereClause.price === undefined) {
             whereClause.price = {};
        }
        (whereClause.price as Prisma.DecimalFilter).gte = new Prisma.Decimal(minPrice);
    }
    if (maxPrice !== undefined) {
         if (whereClause.price === undefined) {
             whereClause.price = {};
        }
        (whereClause.price as Prisma.DecimalFilter).lte = new Prisma.Decimal(maxPrice);
    }
    if (search) {
        // Recherche simple dans le nom OU la description
        whereClause.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
        ];
    }
    if (isAvailable !== undefined) {
        whereClause.isAvailable = isAvailable;
    }
     if (isTopProduct !== undefined) {
        whereClause.isTopProduct = isTopProduct;
    }

    const products = await prisma.product.findMany({
      skip: skip,
      take: limit,
      where: whereClause,
      include: {
        category: true, // Inclure la catégorie
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    const totalProducts = await prisma.product.count({ where: whereClause });

    return {
      data: products,
      meta: {
        currentPage: page,
        perPage: limit,
        totalItems: totalProducts,
        totalPages: Math.ceil(totalProducts / limit),
      }
    };
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

  /**
   * Crée un nouveau produit.
   * @param productData - Les données du produit à créer.
   */
  static async createProduct(productData: Prisma.ProductCreateInput & { categoryId: string }) {
    // Prisma attend `category: { connect: { id: categoryId } }` pour les relations,
    // mais pour simplifier, on vérifie la catégorie d'abord puis on passe les données.
    // Prisma gère la conversion de Decimal si on passe un nombre ou une chaîne valide.
    await ensureCategoryExists(productData.categoryId);

    try {
        // Préparer les données pour Prisma, notamment la connexion à la catégorie
        const dataToCreate: Prisma.ProductCreateInput = {
            ...productData,
            price: new Prisma.Decimal(productData.price as any), // Assurer le type Decimal
            category: {
                connect: { id: productData.categoryId }
            }
        };
        // Supprimer categoryId car on utilise la connexion relationnelle
        delete (dataToCreate as any).categoryId; 

        return await prisma.product.create({
            data: dataToCreate,
        });
    } catch (error) {
        // Gérer les erreurs connues de Prisma (ex: catégorie invalide malgré la vérification - peu probable)
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
             if (error.code === 'P2025') { // Record not found (pour la catégorie)
                 throw new ApiError(400, `Invalid categoryId provided.`);
             }
        }
        if (error instanceof ApiError) throw error;
        throw new ApiError(500, 'Could not create product');
    }
  }

  /**
   * Met à jour un produit existant.
   * @param productId - L'ID du produit à mettre à jour.
   * @param productData - Les nouvelles données pour le produit.
   */
  static async updateProduct(productId: string, productData: Prisma.ProductUpdateInput & { categoryId?: string }) {
     try {
        // Vérifier si le produit existe
        const existingProduct = await prisma.product.findUnique({ where: { id: productId } });
        if (!existingProduct) {
            throw new ApiError(404, `Product with ID ${productId} not found`);
        }

        // Si categoryId est fourni, vérifier qu'il existe
        if (productData.categoryId) {
            await ensureCategoryExists(productData.categoryId);
        }

        // Préparer les données pour Prisma
        const dataToUpdate: Prisma.ProductUpdateInput = {
             ...productData,
        };

        // Gérer la mise à jour du prix si fourni
        if (productData.price !== undefined) {
            dataToUpdate.price = new Prisma.Decimal(productData.price as any);
        }

        // Gérer la mise à jour de la catégorie si fournie
        if (productData.categoryId) {
             dataToUpdate.category = {
                 connect: { id: productData.categoryId }
             };
             delete (dataToUpdate as any).categoryId; // Supprimer la clé temporaire
        }

        return await prisma.product.update({
            where: { id: productId },
            data: dataToUpdate,
        });
    } catch (error) {
        // Gérer les erreurs connues (ex: catégorie invalide)
         if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
             throw new ApiError(400, `Invalid categoryId provided for update.`);
         }
        if (error instanceof ApiError) throw error;
        throw new ApiError(500, `Could not update product with ID ${productId}`);
    }
  }

  /**
   * Supprime un produit.
   * @param productId - L'ID du produit à supprimer.
   */
  static async deleteProduct(productId: string) {
    try {
        // Vérifier si le produit existe
        const existingProduct = await prisma.product.findUnique({ where: { id: productId } });
        if (!existingProduct) {
            throw new ApiError(404, `Product with ID ${productId} not found`);
        }

        // Vérifier les contraintes (ex: OrderItem) - onDelete: Restrict sur OrderItem
        // Prisma lèvera une erreur P2014 ou P2003 si le produit est dans une commande.
        return await prisma.product.delete({
            where: { id: productId },
        });
    } catch (error) {
         if (error instanceof Prisma.PrismaClientKnownRequestError) {
             if (error.code === 'P2014' || error.code === 'P2003') { // Foreign key constraint
                throw new ApiError(409, `Cannot delete product with ID ${productId} because it is part of one or more orders.`);
            }
         }
        if (error instanceof ApiError) throw error;
        throw new ApiError(500, `Could not delete product with ID ${productId}`);
    }
  }
} 