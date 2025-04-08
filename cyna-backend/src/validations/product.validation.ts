import { z } from 'zod';

// Zod ne gère pas directement Decimal, nous validons comme nombre ou chaîne convertible
// La conversion réelle se fera via Prisma ou une transformation explicite si nécessaire.
const priceSchema = z.union([
    z.number().positive({ message: 'Price must be positive' }),
    z.string().regex(/^\d+(\.\d{1,2})?$/, { message: "Invalid price format (e.g., 10.99)" })
]);

export const createProductSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Product name cannot be empty'),
        description: z.string().min(1, 'Description cannot be empty'),
        images: z.array(z.string().url({ message: "Each image must be a valid URL" })).min(1, 'At least one image URL is required'),
        price: priceSchema,
        categoryId: z.string().cuid({ message: 'Invalid category ID format' }),
        isAvailable: z.boolean().optional().default(true),
        isTopProduct: z.boolean().optional().default(false),
        priorityInCategory: z.number().int().min(0).optional().default(0),
        features: z.array(z.string()).optional().default([]),
        // stock: z.number().int().min(0).optional(), // Si gestion de stock activée
    }),
});

export const updateProductSchema = z.object({
    params: z.object({
        id: z.string().cuid({ message: 'Invalid product ID format' }),
    }),
    body: z.object({
        name: z.string().min(1, 'Product name cannot be empty').optional(),
        description: z.string().min(1, 'Description cannot be empty').optional(),
        images: z.array(z.string().url({ message: "Each image must be a valid URL" })).min(1, 'At least one image URL is required').optional(),
        price: priceSchema.optional(),
        categoryId: z.string().cuid({ message: 'Invalid category ID format' }).optional(),
        isAvailable: z.boolean().optional(),
        isTopProduct: z.boolean().optional(),
        priorityInCategory: z.number().int().min(0).optional(),
        features: z.array(z.string()).optional(),
        // stock: z.number().int().min(0).optional(),
    }).partial(), // .partial() rend tous les champs du body optionnels pour la mise à jour
});

export const productIdParamSchema = z.object({
    params: z.object({
        id: z.string().cuid({ message: 'Invalid product ID format' }),
    }),
});

export const getProductsQuerySchema = z.object({
    query: z.object({
        page: z.coerce.number().int().positive().optional().default(1),
        limit: z.coerce.number().int().positive().max(100).optional().default(10),
        sortBy: z.enum(['name', 'price', 'createdAt', 'priorityInCategory']).optional().default('createdAt'),
        sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
        categoryId: z.string().cuid({ message: 'Invalid category ID format' }).optional(),
        minPrice: z.coerce.number().positive().optional(),
        maxPrice: z.coerce.number().positive().optional(),
        search: z.string().optional(), // Pour recherche textuelle simple
        isAvailable: z.enum(['true', 'false']).optional().transform(val => val === 'true'), // Convertit string en boolean
        isTopProduct: z.enum(['true', 'false']).optional().transform(val => val === 'true'),
    }),
}); 