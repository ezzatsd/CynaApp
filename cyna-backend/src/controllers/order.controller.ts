import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/order.service';
import { ApiError } from '../errors/ApiError';

export class OrderController {

  /**
   * POST /api/orders
   * Crée une nouvelle commande pour l'utilisateur authentifié.
   */
  static async createOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication required');
      }
      // Données validées par Zod
      const orderData = req.body;
      const newOrder = await OrderService.createOrder(req.user.id, orderData);
      res.status(201).json(newOrder);
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