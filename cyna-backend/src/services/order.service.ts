import { PrismaClient, Prisma, OrderStatus } from '@prisma/client';
import { ApiError } from '../errors/ApiError';
import Stripe from 'stripe';
import logger from '../config/logger';

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

  // Méthode statique privée pour obtenir une instance Stripe (pourrait être mise ailleurs)
  private static getStripeInstance(): Stripe {
      // Charger la config ici au besoin
       const config = require('../config').default;
       if (!config.stripeSecretKey) {
           console.error('Stripe Secret Key is not configured.');
            throw new ApiError(503, 'Payment service configuration error.');
       }
        return new Stripe(config.stripeSecretKey, { 
            apiVersion: '2024-06-20' as any, 
            typescript: true 
        });
  }

  /**
   * Crée une intention de paiement Stripe et une commande en BDD (statut PENDING_PAYMENT).
   * Retourne le client_secret de l'intention pour que le frontend puisse finaliser le paiement.
   */
  static async createOrderAndPaymentIntent(
      userId: string, 
      orderData: CreateOrderInput,
      // Injecter l'instance Stripe (optionnelle pour les tests)
      stripeInstance?: Stripe 
  ): Promise<{ clientSecret: string | null; orderId: string }> {
    // Utiliser l'instance injectée ou en obtenir une nouvelle
    const stripe = stripeInstance || this.getStripeInstance(); 
    
    const { items, billingAddressId } = orderData;
    try {
      // --- Début de la Transaction --- 
      const result = await prisma.$transaction(async (tx) => {
        
        // 1. Vérifier adresse DANS la transaction
        const address = await tx.address.findUnique({ where: { id: billingAddressId } });
        if (!address || address.userId !== userId) {
          throw new ApiError(400, `Invalid billingAddressId: Address not found or does not belong to the user.`);
        }

        // 2. Vérifier produits et calculer total DANS la transaction
        const productIds = items.map(item => item.productId);
        const products = await tx.product.findMany({
            where: { id: { in: productIds }, isAvailable: true },
            select: { id: true, price: true, name: true },
        });
        if (products.length !== productIds.length) {
             const missingIds = productIds.filter(id => !products.map(p=>p.id).includes(id));
             throw new ApiError(400, `Invalid order: Product(s) not found or unavailable: ${missingIds.join(', ')}`);
        }
        let totalAmountDecimal = new Prisma.Decimal(0);
        const orderItemsToCreate: Prisma.OrderItemCreateManyOrderInput[] = products.map(product => {
          totalAmountDecimal = totalAmountDecimal.add(product.price.mul(items.find(item => item.productId === product.id)!.quantity));
          return { productId: product.id, quantity: items.find(item => item.productId === product.id)!.quantity, pricePerUnit: product.price, productName: product.name };
        });
        const totalAmountCents = totalAmountDecimal.mul(100).toNumber();

        // 3. Créer la commande en BDD DANS la transaction
        const createdOrder = await tx.order.create({
            data: {
                userId: userId,
                totalAmount: totalAmountDecimal,
                billingAddressId: billingAddressId,
                status: OrderStatus.PENDING_PAYMENT,
                items: {
                    createMany: { data: orderItemsToCreate },
                },
            },
        });

        // 4. Créer l'Intention de Paiement Stripe (hors transaction Prisma, mais après succès BDD)
        const paymentIntent = await stripe.paymentIntents.create({
            amount: totalAmountCents,
            currency: 'eur',
            automatic_payment_methods: { enabled: true },
            metadata: {
                orderId: createdOrder.id,
                userId: userId,
            },
        });

        // 5. Mettre à jour la commande avec l'ID de l'intention (hors transaction initialement, mais nécessaire)
        // On le fait après la transaction pour avoir l'ID, mais avant de retourner.
        // Si cette étape échoue, la commande reste PENDING_PAYMENT sans ID PI.
         await prisma.order.update({ // Utiliser prisma normal ici, pas tx
             where: { id: createdOrder.id },
             data: { paymentIntentId: paymentIntent.id },
         });

        // Retourner les infos nécessaires
        return {
            clientSecret: paymentIntent.client_secret,
            orderId: createdOrder.id,
        };
      }); 
      // --- Fin de la Transaction --- 

      return result; // Retourner le résultat de la transaction

    } catch (error: any) {
        // Relancer ApiErrors
        if (error instanceof ApiError) { throw error; }
        // Logguer l'erreur interne
        logger.error('Order creation failed', { error: error.message, stack: error.stack, userId });
        // Vérifier si l'erreur encapsule le message de l'ApiError lancée dans la transaction
        // (Ceci est une heuristique, car l'erreur exacte propagée par $transaction peut varier)
        if (error.message?.includes('Invalid billingAddressId') || error.message?.includes('Invalid order: Product(s) not found')) {
             throw new ApiError(400, error.message); // Relancer avec le statut 400
        }
        
        // Gérer erreurs Stripe spécifiques si possible
        if (error.type === 'StripeAuthenticationError' || error.message?.includes('Invalid API Key')) {
             throw new ApiError(500, `Payment provider authentication error. Please contact support.`);
        } else if (error.type?.startsWith('Stripe')) { 
             throw new ApiError(500, `Payment provider error: ${error.message}`);
        } else if (error.code === 'P2003') { 
             throw new ApiError(400, "Invalid data provided for order creation (e.g., invalid product or address ID).")
        } 
        // Erreur générique
        throw new ApiError(500, 'Could not create order due to an internal error.');
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
           logger.info(`Order ${orderId} status updated to ${status}`, { paymentIntentId });
           // Déclencher d'autres actions si nécessaire (emails, activation service, etc.)
       } catch (error: unknown) {
            const err = error as Error;
            logger.error(
                `Failed to update status for order ${orderId} from webhook`, 
                { error: err.message, stack: err.stack, paymentIntentId }
            );
       }
   }

  /**
   * Récupère toutes les commandes d'un utilisateur spécifique.
   */
  static async getUserOrders(userId: string) {
    return prisma.order.findMany({
        where: { userId: userId },
        include: {
            items: true,
            billingAddress: true
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
            items: true,
            billingAddress: true
        },
    });

    if (!order || order.userId !== userId) {
        throw new ApiError(404, `Order with ID ${orderId} not found or does not belong to the user.`);
    }

    return order;
  }

  // --- Autres opérations éventuelles ---
  // - Mettre à jour le statut d'une commande (admin? webhook de paiement?)
  // - Annuler une commande ?

} 