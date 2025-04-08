import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { ApiError } from '../errors/ApiError';

const prisma = new PrismaClient();

export class UserService {

  /**
   * Récupère les détails d'un utilisateur par ID (sans le mot de passe).
   */
  static async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { // Sélection explicite pour exclure passwordHash
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
        // Inclure les relations si nécessaire (ex: adresses)
        // addresses: true, 
      },
    });
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return user;
  }

  /**
   * Met à jour les informations du profil d'un utilisateur.
   */
  static async updateUserProfile(userId: string, data: { name?: string; email?: string }) {
    try {
        // Si l'email est mis à jour, on pourrait vouloir réinitialiser emailVerified ?
        const updateData: Prisma.UserUpdateInput = { ...data };
        if (data.email) {
             // TODO: Gérer la logique de re-vérification d'email si nécessaire
             // updateData.emailVerified = null; 
        }

        return await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: { id: true, email: true, name: true, updatedAt: true }, // Renvoyer les infos mises à jour
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
             throw new ApiError(409, `Email '${data.email}' is already in use.`);
        }
        throw new ApiError(500, 'Could not update user profile');
    }
  }

  /**
   * Change le mot de passe d'un utilisateur après vérification de l'ancien.
   */
  static async changeUserPassword(userId: string, currentPass: string, newPass: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    const isMatch = await bcrypt.compare(currentPass, user.passwordHash);
    if (!isMatch) {
        throw new ApiError(401, 'Incorrect current password');
    }

    const newPasswordHash = await bcrypt.hash(newPass, 10);
    await prisma.user.update({
        where: { id: userId },
        data: { passwordHash: newPasswordHash },
    });
    // Ne rien retourner de sensible
  }

  // --- Gestion des Adresses ---

  /**
   * Récupère toutes les adresses d'un utilisateur.
   */
  static async getUserAddresses(userId: string) {
    return prisma.address.findMany({
        where: { userId: userId },
        orderBy: { createdAt: 'desc' }, // Ou par isDefaultBilling
    });
  }

  /**
   * Ajoute une nouvelle adresse pour un utilisateur.
   */
  static async addUserAddress(userId: string, addressData: Prisma.AddressCreateWithoutUserInput) {
      // Gérer la logique isDefaultBilling: si la nouvelle est par défaut, s'assurer que les autres ne le sont plus.
      if (addressData.isDefaultBilling) {
          await prisma.address.updateMany({
              where: { userId: userId, isDefaultBilling: true },
              data: { isDefaultBilling: false },
          });
      }

      return prisma.address.create({
          data: {
              ...addressData,
              user: { connect: { id: userId } },
          },
      });
  }

  /**
   * Récupère une adresse spécifique d'un utilisateur.
   */
  static async getUserAddressById(userId: string, addressId: string) {
      const address = await prisma.address.findUnique({
          where: { id: addressId },
      });
      // Vérifier si l'adresse existe ET appartient bien à l'utilisateur
      if (!address || address.userId !== userId) {
          throw new ApiError(404, `Address with ID ${addressId} not found or does not belong to the user.`);
      }
      return address;
  }

  /**
   * Met à jour une adresse spécifique d'un utilisateur.
   */
  static async updateUserAddress(userId: string, addressId: string, addressData: Prisma.AddressUpdateInput) {
      // Vérifier que l'adresse appartient bien à l'utilisateur avant de mettre à jour
      const existingAddress = await this.getUserAddressById(userId, addressId); // Réutilise la vérification

       // Gérer la logique isDefaultBilling
      if (addressData.isDefaultBilling) {
          await prisma.address.updateMany({
              where: { userId: userId, isDefaultBilling: true, NOT: { id: addressId } }, // Exclure l'adresse actuelle
              data: { isDefaultBilling: false },
          });
      }

      return prisma.address.update({
          where: { id: addressId }, // Pas besoin de vérifier userId ici car déjà fait
          data: addressData,
      });
  }

  /**
   * Supprime une adresse spécifique d'un utilisateur.
   */
  static async deleteUserAddress(userId: string, addressId: string) {
       // Vérifier que l'adresse appartient bien à l'utilisateur avant de supprimer
      const existingAddress = await this.getUserAddressById(userId, addressId); // Réutilise la vérification

      // Vérifier si l'adresse est utilisée comme adresse de facturation dans une commande ?
      // Le schéma actuel n'a pas onDelete: Restrict ici, mais il faudrait peut-être l'ajouter
      // pour éviter de supprimer une adresse liée à une commande passée.
      // Pour l'instant, la suppression est autorisée.

      await prisma.address.delete({ 
          where: { id: addressId } 
      });
  }

} 