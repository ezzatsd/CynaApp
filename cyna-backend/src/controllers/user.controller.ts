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
      if (!req.user) throw new ApiError(401, 'Authentication required');
      // Utiliser les données validées
      const updateData = req.validatedData?.body;
      if (!updateData) throw new ApiError(500, 'Validated user data not found.');
      const updatedUser = await UserService.updateUserProfile(req.user.id, updateData);
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
      if (!req.user) throw new ApiError(401, 'Authentication required');
       // Utiliser les données validées
      const { currentPassword, newPassword } = req.validatedData?.body;
      if (!currentPassword || !newPassword) throw new ApiError(500, 'Validated password data not found.');
      await UserService.changeUserPassword(req.user.id, currentPassword, newPassword);
      res.status(204).send(); 
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
      if (!req.user) throw new ApiError(401, 'Authentication required');
       // Utiliser les données validées
      const addressData = req.validatedData?.body;
      if (!addressData) throw new ApiError(500, 'Validated address data not found.');
      const newAddress = await UserService.addUserAddress(req.user.id, addressData);
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
      if (!req.user) throw new ApiError(401, 'Authentication required');
      // Utiliser les données validées
      const addressId = req.validatedData?.params?.addressId;
      if (!addressId) throw new ApiError(500, 'Validated address ID not found.');
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
      if (!req.user) throw new ApiError(401, 'Authentication required');
       // Utiliser les données validées
      const addressId = req.validatedData?.params?.addressId;
      const addressData = req.validatedData?.body;
      if (!addressId || !addressData) throw new ApiError(500, 'Validated address ID or data not found.');
      const updatedAddress = await UserService.updateUserAddress(req.user.id, addressId, addressData);
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
      if (!req.user) throw new ApiError(401, 'Authentication required');
      // Utiliser les données validées
      const addressId = req.validatedData?.params?.addressId;
      if (!addressId) throw new ApiError(500, 'Validated address ID not found.');
      await UserService.deleteUserAddress(req.user.id, addressId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

} 