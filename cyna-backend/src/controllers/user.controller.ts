import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { ApiError } from '../errors/ApiError';

export class UserController {

  /**
   * GET /api/users/me
   * Récupère les informations de l'utilisateur actuellement authentifié.
   */
  static async getCurrentUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // req.user est attaché par le middleware isAuthenticated
      if (!req.user) {
        throw new ApiError(401, 'Authentication required');
      }
      // Récupérer les détails complets (sans mot de passe) via le service
      const userDetails = await UserService.getUserById(req.user.id);
      res.status(200).json(userDetails);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/users/me
   * Met à jour le profil de l'utilisateur authentifié.
   */
  static async updateCurrentUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication required');
      }
      // Les données du body ont été validées par Zod
      const updatedUser = await UserService.updateUserProfile(req.user.id, req.body);
      res.status(200).json(updatedUser);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/users/me/password
   * Change le mot de passe de l'utilisateur authentifié.
   */
  static async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication required');
      }
      const { currentPassword, newPassword } = req.body; // Données validées par Zod
      await UserService.changeUserPassword(req.user.id, currentPassword, newPassword);
      res.status(204).send(); // Pas de contenu à renvoyer
    } catch (error) {
      next(error);
    }
  }

  // --- Contrôleurs pour les Adresses --- 

  /**
   * GET /api/users/me/addresses
   * Récupère les adresses de l'utilisateur authentifié.
   */
  static async getUserAddresses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication required');
      }
      const addresses = await UserService.getUserAddresses(req.user.id);
      res.status(200).json(addresses);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/users/me/addresses
   * Ajoute une adresse pour l'utilisateur authentifié.
   */
  static async addUserAddress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication required');
      }
      // Données validées par Zod
      const newAddress = await UserService.addUserAddress(req.user.id, req.body);
      res.status(201).json(newAddress);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/users/me/addresses/:addressId
   * Récupère une adresse spécifique de l'utilisateur.
   */
  static async getUserAddressById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication required');
      }
      const addressId = req.params.addressId; // ID validé par Zod
      const address = await UserService.getUserAddressById(req.user.id, addressId);
      res.status(200).json(address);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/users/me/addresses/:addressId
   * Met à jour une adresse spécifique de l'utilisateur.
   */
  static async updateUserAddress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication required');
      }
      const addressId = req.params.addressId; // ID validé par Zod
      // Données du body validées par Zod
      const updatedAddress = await UserService.updateUserAddress(req.user.id, addressId, req.body);
      res.status(200).json(updatedAddress);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/users/me/addresses/:addressId
   * Supprime une adresse spécifique de l'utilisateur.
   */
  static async deleteUserAddress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication required');
      }
      const addressId = req.params.addressId; // ID validé par Zod
      await UserService.deleteUserAddress(req.user.id, addressId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

} 