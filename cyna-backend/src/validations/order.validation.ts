import { z } from 'zod';

// Schéma pour un article dans la requête de création de commande
const orderItemSchema = z.object({
    productId: z.string().cuid({ message: 'Invalid product ID format' }),
    quantity: z.number().int().positive({ message: 'Quantity must be a positive integer' }),
});

// Schéma pour la création d'une commande
export const createOrderSchema = z.object({
    body: z.object({
        items: z.array(orderItemSchema).min(1, { message: 'Order must contain at least one item' }),
        billingAddressId: z.string().cuid({ message: 'Invalid billing address ID format' }),
        // On pourrait ajouter des infos de paiement ici plus tard (ex: paymentMethodId)
        // Pour l'instant, on simule avec un résumé simple
        paymentMethodSummary: z.string().optional().default('Payment on delivery'), // Exemple simple
    }),
});

// Schéma pour valider l'ID de commande dans les paramètres
export const orderIdParamSchema = z.object({
    params: z.object({
        orderId: z.string().cuid({ message: 'Invalid order ID format' }),
    }),
}); 