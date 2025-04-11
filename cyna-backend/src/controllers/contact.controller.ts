import { Request, Response, NextFunction } from 'express';
import { ContactService } from '../services/contact.service';
import { ApiError } from '../errors/ApiError';

export class ContactController {

  /**
   * POST /api/contact
   * Reçoit et enregistre un message du formulaire de contact.
   */
  static async submitContactForm(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Utiliser les données validées
      const messageData = req.validatedData?.body;
      if (!messageData) throw new ApiError(500, 'Validated contact data not found.');
      await ContactService.saveContactMessage(messageData);
      res.status(200).json({ message: 'Your message has been received. Thank you!' });
    } catch (error) {
      next(error); 
    }
  }
} 