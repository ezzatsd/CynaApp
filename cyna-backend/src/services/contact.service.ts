import { PrismaClient, Prisma } from '@prisma/client';
import { ApiError } from '../errors/ApiError';
import logger from '../config/logger';

const prisma = new PrismaClient();

interface ContactMessageInput {
    email: string;
    subject: string;
    message: string;
}

export class ContactService {

  /**
   * Enregistre un nouveau message de contact dans la base de données.
   */
  static async saveContactMessage(data: ContactMessageInput): Promise<void> {
    try {
      await prisma.contactMessage.create({
        data: {
          email: data.email,
          subject: data.subject,
          message: data.message,
          // isRead est false par défaut
        },
      });
      logger.info(`Contact message received from ${data.email}`);
      // Optionnel : Envoyer une notification à l'admin ici

    } catch (error: unknown) {
      const err = error as Error;
      logger.error("Failed to save contact message:", { email: data.email, error: err.message });
      // Ne pas nécessairement renvoyer une erreur 500 à l'utilisateur pour cela,
      // mais une erreur interne peut être appropriée si le stockage est critique.
      throw new ApiError(500, 'Could not process your message at this time.');
    }
  }

  // Ajouter des fonctions pour lister/lire/supprimer les messages (admin) plus tard si nécessaire

} 