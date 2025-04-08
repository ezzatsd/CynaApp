import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/order.service';
import { ApiError } from '../errors/ApiError';

export class OrderController {

  /**
   * POST /api/orders
   * Crée une intention de paiement et une commande préliminaire.
   * Renvoie le client_secret de l'intention et l'ID de la commande.
   */
  static async createOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication required');
      }
      const orderData = req.body; // Données validées par Zod
      
      // Appeler la nouvelle méthode du service
      const { clientSecret, orderId } = await OrderService.createOrderAndPaymentIntent(req.user.id, orderData);
      
      if (!clientSecret) {
          // Ce cas peut arriver si l'initialisation de Stripe a échoué ou autre erreur non prévue
          throw new ApiError(500, "Could not initialize payment.");
      }

      // Renvoyer le secret client et l'ID de commande au frontend
      res.status(201).json({ 
          message: "Payment intent created successfully.",
          clientSecret: clientSecret, 
          orderId: orderId 
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/orders
   * Récupère les commandes de l'utilisateur authentifié.
   */
  static async getUserOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication required');
      }
      const orders = await OrderService.getUserOrders(req.user.id);
      res.status(200).json(orders);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/orders/:orderId
   * Récupère une commande spécifique de l'utilisateur authentifié.
   */
  static async getUserOrderById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication required');
      }
      const orderId = req.params.orderId; // ID validé par Zod
      const order = await OrderService.getUserOrderById(req.user.id, orderId);
      res.status(200).json(order);
    } catch (error) {
      next(error);
    }
  }

} 