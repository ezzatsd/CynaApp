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
      // Les données ont été validées par Zod
      const messageData = req.body;
      
      await ContactService.saveContactMessage(messageData);

      // Renvoyer une réponse succès générique
      res.status(200).json({ message: 'Your message has been received. Thank you!' });

    } catch (error) {
        // Si le service lève une erreur (ex: BDD indisponible)
        next(error); 
    }
  }
} 