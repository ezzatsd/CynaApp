import Stripe from 'stripe';
import { OrderService } from './order.service';
import { OrderStatus } from '@prisma/client';
import config from '../config';
import logger from '../config/logger';

// Initialiser Stripe (nécessaire pour construire l'événement)
let stripe: Stripe | null = null;
if (config.stripeSecretKey) {
    stripe = new Stripe(config.stripeSecretKey, {
        apiVersion: '2024-06-20' as any,
        typescript: true,
    });
} else {
    console.error('Stripe Secret Key is not configured. Webhook verification might fail.');
}

export class WebhookService {

    /**
     * Construit l'événement Stripe à partir de la requête brute et de la signature.
     * @param body - Le corps brut de la requête (Buffer ou string).
     * @param signature - L'en-tête 'stripe-signature'.
     * @returns L'événement Stripe vérifié.
     * @throws ApiError si la vérification échoue.
     */
    static constructWebhookEvent(body: Buffer | string, signature: string): Stripe.Event {
        if (!stripe || !config.stripeWebhookSecret) {
            logger.error('Stripe or Webhook Secret not configured for webhook construction.');
            throw new Error('Webhook processing configuration error.');
        }

        try {
            const event = stripe.webhooks.constructEvent(
                body,
                signature,
                config.stripeWebhookSecret
            );
            return event;
        } catch (err: unknown) {
            const error = err as Error;
            logger.error(`Webhook signature verification failed: ${error.message}`);
            throw new Error(`Webhook Error: ${error.message}`);
        }
    }

    /**
     * Traite un événement webhook Stripe vérifié.
     */
    static async handleWebhookEvent(event: Stripe.Event): Promise<void> {
        logger.info(`Received Stripe webhook event: ${event.type}`, { eventId: event.id });

        // Gérer l'événement payment_intent
        if (event.type.startsWith('payment_intent.')) {
            const paymentIntent = event.data.object as Stripe.PaymentIntent;
            const orderId = paymentIntent.metadata?.orderId;
            
            if (!orderId) {
                logger.error('Webhook Error: Missing orderId in PaymentIntent metadata', { paymentIntentId: paymentIntent.id });
                return; // Ignorer si on ne peut pas lier à une commande
            }

            switch (event.type) {
                case 'payment_intent.succeeded':
                    logger.info(`PaymentIntent ${paymentIntent.id} succeeded for order ${orderId}.`);
                    // Paiement réussi : Mettre à jour la commande à ACTIVE (ou autre statut pertinent)
                    await OrderService.updateOrderStatus(orderId, paymentIntent.id, OrderStatus.ACTIVE);
                    // TODO: Envoyer email de confirmation de commande, activer services, etc.
                    break;
                case 'payment_intent.payment_failed':
                    logger.warn(`PaymentIntent ${paymentIntent.id} failed for order ${orderId}.`, { reason: paymentIntent.last_payment_error?.message });
                    // Paiement échoué : Mettre à jour la commande à FAILED
                    await OrderService.updateOrderStatus(orderId, paymentIntent.id, OrderStatus.FAILED);
                    // TODO: Envoyer email informant de l'échec ?
                    break;
                case 'payment_intent.processing':
                    logger.info(`PaymentIntent ${paymentIntent.id} processing for order ${orderId}.`);
                     // Optionnel: Mettre à jour la commande à PROCESSING si ce statut est utilisé
                    // await OrderService.updateOrderStatus(orderId, paymentIntent.id, OrderStatus.PROCESSING);
                    break;
                case 'payment_intent.canceled': // Peut arriver si annulé avant succès/échec
                    logger.info(`PaymentIntent ${paymentIntent.id} canceled for order ${orderId}.`);
                     await OrderService.updateOrderStatus(orderId, paymentIntent.id, OrderStatus.CANCELLED);
                    break;
                // Ajouter d'autres événements si nécessaire (ex: charge.refunded)
                default:
                    logger.info(`Unhandled payment_intent event type: ${event.type}`, { eventId: event.id });
            }
        } else {
             logger.info(`Unhandled event type: ${event.type}`, { eventId: event.id });
        }
        // Confirmer à Stripe que l'événement a été reçu (le contrôleur renverra 200)
    }
} 