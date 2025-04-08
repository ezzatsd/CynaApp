import { Router } from 'express';
import { isAuthenticated } from '../middleware/auth.middleware';
import { OrderController } from '../../controllers/order.controller';
import { validate } from '../middleware/validate.middleware';
import { createOrderSchema, orderIdParamSchema } from '../../validations/order.validation';

const orderRouter = Router();

// Toutes les routes ici nécessitent une authentification
orderRouter.use(isAuthenticated);

// POST /api/orders - Créer une nouvelle commande
orderRouter.post(
    '/', 
    validate(createOrderSchema), 
    OrderController.createOrder
);

// GET /api/orders - Récupérer les commandes de l'utilisateur connecté
orderRouter.get(
    '/', 
    OrderController.getUserOrders
);

// GET /api/orders/:orderId - Récupérer une commande spécifique par ID
orderRouter.get(
    '/:orderId', 
    validate(orderIdParamSchema), 
    OrderController.getUserOrderById
);

export default orderRouter; 