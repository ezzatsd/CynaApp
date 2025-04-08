import { PrismaClient, Prisma } from '@prisma/client';
import { ApiError } from '../errors/ApiError';

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
   * Crée une nouvelle commande pour un utilisateur.
   * Utilise une transaction pour assurer l'atomicité.
   */
  static async createOrder(userId: string, orderData: CreateOrderInput) {
    const { items, billingAddressId, paymentMethodSummary } = orderData;

    // 1. Vérifier que l'adresse de facturation appartient bien à l'utilisateur
    const address = await prisma.address.findUnique({
        where: { id: billingAddressId },
    });
    if (!address || address.userId !== userId) {
        throw new ApiError(400, `Invalid billingAddressId: Address not found or does not belong to the user.`);
    }

    // 2. Préparer les IDs produits pour vérifier leur existence et prix
    const productIds = items.map(item => item.productId);
    const products = await prisma.product.findMany({
        where: { id: { in: productIds }, isAvailable: true }, // Vérifier aussi la disponibilité
        select: { id: true, price: true, name: true },
    });

    // 3. Vérifier que tous les produits demandés existent et sont disponibles
    if (products.length !== productIds.length) {
        const foundIds = products.map(p => p.id);
        const missingIds = productIds.filter(id => !foundIds.includes(id));
        throw new ApiError(400, `Invalid order: Product(s) not found or unavailable: ${missingIds.join(', ')}`);
    }

    // 4. Calculer le montant total et préparer les OrderItems
    let totalAmount = new Prisma.Decimal(0);
    const orderItemsToCreate: Prisma.OrderItemCreateManyOrderInput[] = items.map(itemInput => {
        const product = products.find(p => p.id === itemInput.productId);
        if (!product) throw new Error('Product consistency error'); // Ne devrait pas arriver
        
        const itemTotal = product.price.mul(itemInput.quantity);
        totalAmount = totalAmount.add(itemTotal);

        return {
            productId: product.id,
            quantity: itemInput.quantity,
            pricePerUnit: product.price, // Prix au moment de la commande
            productName: product.name,   // Nom au moment de la commande
        };
    });

    // 5. Exécuter la création dans une transaction
    try {
        const newOrder = await prisma.$transaction(async (tx) => {
            const createdOrder = await tx.order.create({
                data: {
                    userId: userId,
                    totalAmount: totalAmount,
                    billingAddressId: billingAddressId,
                    paymentMethodSummary: paymentMethodSummary ?? 'N/A', // Utiliser le résumé fourni ou N/A
                    status: 'PROCESSING', // Statut initial
                    items: {
                        createMany: { // Créer plusieurs OrderItem d'un coup
                            data: orderItemsToCreate,
                        },
                    },
                },
                include: { // Inclure les items dans la réponse
                    items: true,
                },
            });
            // --- Logique Post-Création éventuelle --- 
            // - Envoyer email de confirmation
            // - Décrémenter le stock si géré
            // - Lancer un processus de paiement si nécessaire
            
            return createdOrder;
        });
        return newOrder;
    } catch (error) {
        console.error("Order creation failed:", error);
        // Gérer les erreurs potentielles de la transaction
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            // Erreurs spécifiques ?
        }
        throw new ApiError(500, 'Could not create order due to an internal error.');
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