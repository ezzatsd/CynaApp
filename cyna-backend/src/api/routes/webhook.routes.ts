import express, { Router } from 'express';
import { WebhookController } from '../../controllers/webhook.controller';

const webhookRouter = Router();

// POST /api/webhooks/stripe - Route pour recevoir les webhooks Stripe
// Utiliser express.raw() pour obtenir le corps brut de la requête pour cette route spécifique
webhookRouter.post(
    '/stripe', 
    express.raw({ type: 'application/json' }), // Middleware pour parser le corps brut
    WebhookController.handleStripeWebhook
);

export default webhookRouter; 