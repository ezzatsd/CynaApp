import { Request, Response, NextFunction } from 'express';
import { WebhookService } from '../services/webhook.service';

export class WebhookController {

  /**
   * POST /api/webhooks/stripe
   * Reçoit les événements webhook de Stripe.
   */
  static async handleStripeWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    const signature = req.headers['stripe-signature'] as string;

    if (!signature) {
        console.warn('Stripe webhook request missing signature.');
        res.status(400).send('Webhook Error: Missing stripe-signature header');
        return;
    }

    // req.body contient ici le Buffer brut (grâce à la config Express spécifique)
    let event;
    try {
        event = WebhookService.constructWebhookEvent(req.body, signature);
    } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }

    // Traiter l'événement vérifié (de manière asynchrone, sans attendre la fin)
    WebhookService.handleWebhookEvent(event).catch(err => {
        // Logguer les erreurs de traitement asynchrone
        console.error(`Error handling webhook event ${event.id}:`, err);
        // Note : On ne peut plus renvoyer d'erreur HTTP ici car la réponse 200 a déjà été envoyée
    });

    // Renvoyer une réponse 200 OK à Stripe immédiatement pour confirmer la réception
    // Le traitement réel se fait en arrière-plan (ci-dessus).
    res.status(200).json({ received: true });
  }
} 