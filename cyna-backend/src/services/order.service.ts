import { PrismaClient, Prisma, OrderStatus } from '@prisma/client';
import { ApiError } from '../errors/ApiError';
import Stripe from 'stripe';
import config from '../config'; // Importer la config pour les clés API

// Initialiser Stripe AVEC la clé secrète
// Vérifier si la clé existe avant d'initialiser
let stripe: Stripe | null = null;
if (config.stripeSecretKey) {
    stripe = new Stripe(config.stripeSecretKey, {
        apiVersion: '2024-06-20' as any, // Forcer le type pour contourner l'erreur de typage
        typescript: true,
    });
} else {
    console.error('Stripe Secret Key is not configured. Payment processing will fail.');
}

const prisma = new PrismaClient();

interface OrderItemInput {
    productId: string;
    quantity: number;
}

interface CreateOrderInput {
    items: OrderItemInput[];
    billingAddressId: string;
    paymentMethodSummary?: string; // Temporaire
}

export class OrderService {

  /**
   * Crée une intention de paiement Stripe et une commande en BDD (statut PENDING_PAYMENT).
   * Retourne le client_secret de l'intention pour que le frontend puisse finaliser le paiement.
   */
  static async createOrderAndPaymentIntent(userId: string, orderData: CreateOrderInput): Promise<{ clientSecret: string | null; orderId: string }> {
    if (!stripe) {
        throw new ApiError(503, 'Payment service is temporarily unavailable.');
    }

    const { items, billingAddressId } = orderData;

    // 1. Vérifier adresse (comme avant)
    const address = await prisma.address.findUnique({ where: { id: billingAddressId } });
    if (!address || address.userId !== userId) {
      throw new ApiError(400, `Invalid billingAddressId`);
    }

    // 2. Vérifier produits et calculer total (comme avant)
    const productIds = items.map(item => item.productId);
    const products = await prisma.product.findMany({
        where: { id: { in: productIds }, isAvailable: true },
        select: { id: true, price: true, name: true },
    });
    if (products.length !== productIds.length) {
      throw new ApiError(400, `One or more products are unavailable.`);
    }
    let totalAmountDecimal = new Prisma.Decimal(0);
    const orderItemsToCreate: Prisma.OrderItemCreateManyOrderInput[] = items.map(itemInput => {
      const product = products.find(p => p.id === itemInput.productId)!;
      totalAmountDecimal = totalAmountDecimal.add(product.price.mul(itemInput.quantity));
      return { productId: product.id, quantity: itemInput.quantity, pricePerUnit: product.price, productName: product.name };
    });

    // Convertir le total en centimes pour Stripe (Stripe travaille avec la plus petite unité monétaire)
    // Assumer EUR ou USD pour l'instant
    const totalAmountCents = totalAmountDecimal.mul(100).toNumber();

    // 3. Créer la commande en BDD avec statut PENDING_PAYMENT (dans une transaction potentielle si plus d'étapes)
    let createdOrder;
    try {
         createdOrder = await prisma.order.create({
            data: {
                userId: userId,
                totalAmount: totalAmountDecimal,
                billingAddressId: billingAddressId,
                status: OrderStatus.PENDING_PAYMENT, // Statut initial
                items: {
                    createMany: { data: orderItemsToCreate },
                },
            },
        });
    } catch(dbError) {
        console.error("Failed to create initial order in DB:", dbError);
        throw new ApiError(500, "Could not initiate order.");
    }
    
    // 4. Créer l'Intention de Paiement Stripe
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: totalAmountCents,
            currency: 'eur', // Ou 'usd', etc. - A rendre configurable
            automatic_payment_methods: {
                enabled: true, // Laisser Stripe gérer les méthodes de paiement
            },
            // Lier l'intention à notre commande via les métadonnées
            metadata: {
                orderId: createdOrder.id,
                userId: userId,
            },
        });

        // 5. Stocker l'ID de l'intention dans notre commande
        await prisma.order.update({
            where: { id: createdOrder.id },
            data: { paymentIntentId: paymentIntent.id },
        });

        // 6. Retourner le secret client et l'ID de commande
        return {
            clientSecret: paymentIntent.client_secret,
            orderId: createdOrder.id,
        };

    } catch (stripeError: any) {
        console.error('Stripe Payment Intent creation failed:', stripeError);
        // Si l'intention Stripe échoue, on pourrait vouloir annuler/supprimer la commande créée en BDD ?
        // Ou la laisser en PENDING_PAYMENT pour une nouvelle tentative ? Pour l'instant, on la laisse.
        // await prisma.order.delete({ where: { id: createdOrder.id } }); // Optionnel: Rollback manuel
        throw new ApiError(500, `Failed to create payment intent: ${stripeError.message}`);
    }
  }

  /**
   * Met à jour le statut d'une commande. Utilisé par le webhook Stripe.
   */
  static async updateOrderStatus(orderId: string, paymentIntentId: string, status: OrderStatus): Promise<void> {
       try {
           // Vérifier que l'ID de l'intention de paiement correspond bien à la commande
           await prisma.order.updateMany({ // updateMany pour utiliser paymentIntentId dans le where
               where: {
                   id: orderId,
                   paymentIntentId: paymentIntentId,
               },
               data: {
                   status: status,
               },
           });
           console.log(`Order ${orderId} status updated to ${status} via webhook for PaymentIntent ${paymentIntentId}`);
           // Déclencher d'autres actions si nécessaire (emails, activation service, etc.)
       } catch (error) {
           console.error(`Failed to update status for order ${orderId} from webhook:`, error);
           // Gérer l'erreur (ex: re-essayer plus tard ?)
       }
   }

  /**
   * Récupère toutes les commandes d'un utilisateur spécifique.
   */
  static async getUserOrders(userId: string) {
    return prisma.order.findMany({
        where: { userId: userId },
        include: {
            items: { // Inclure les détails des items
                include: {
                    product: { // Inclure les détails de base du produit lié (optionnel)
                        select: { id: true, name: true, images: true }
                    }
                }
            },
            billingAddress: true // Inclure l'adresse de facturation
        },
        orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Récupère une commande spécifique d'un utilisateur par son ID.
   */
  static async getUserOrderById(userId: string, orderId: string) {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
            items: { 
                include: {
                    product: { 
                        select: { id: true, name: true, images: true }
                    }
                }
            },
            billingAddress: true
        },
    });

    // Vérifier que la commande existe et appartient bien à l'utilisateur
    if (!order || order.userId !== userId) {
        throw new ApiError(404, `Order with ID ${orderId} not found or does not belong to the user.`);
    }

    return order;
  }

  // --- Autres opérations éventuelles ---
  // - Mettre à jour le statut d'une commande (admin? webhook de paiement?)
  // - Annuler une commande ?

} 