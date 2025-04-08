import { z } from 'zod';

export const createCategorySchema = z.object({
    body: z.object({
        name: z.string({
            required_error: 'Category name is required',
        }).min(1, 'Category name cannot be empty'),
        description: z.string().optional(),
        image: z.string().url({ message: "Invalid URL format for image" }).optional(),
        priority: z.number().int().min(0).optional().default(0),
    }),
});

export const updateCategorySchema = z.object({
    params: z.object({
        id: z.string().cuid({ message: 'Invalid category ID format' }), // Valide que l'ID est un CUID
    }),
    body: z.object({
        name: z.string().min(1, 'Category name cannot be empty').optional(),
        description: z.string().optional().nullable(), // Permet de mettre à null
        image: z.string().url({ message: "Invalid URL format for image" }).optional().nullable(),
        priority: z.number().int().min(0).optional(),
    }),
});

export const categoryIdParamSchema = z.object({
    params: z.object({
        id: z.string().cuid({ message: 'Invalid category ID format' }),
    }),
});

export const getCategoriesQuerySchema = z.object({
    query: z.object({
        page: z.coerce.number().int().positive().optional().default(1),
        limit: z.coerce.number().int().positive().max(100).optional().default(10),
        sortBy: z.enum(['name', 'priority', 'createdAt']).optional().default('priority'),
        sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
        // filterByName: z.string().optional(), // Exemple de filtre
    }),
}); 