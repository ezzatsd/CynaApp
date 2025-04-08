import { Router } from 'express';
import { isAuthenticated } from '../middleware/auth.middleware';
import { UserController } from '../../controllers/user.controller';
import { validate } from '../middleware/validate.middleware';
import { 
    updateUserSchema, 
    changePasswordSchema, 
    createAddressSchema, // Utiliser createAddressSchema pour POST
    updateAddressSchema, 
    addressIdParamSchema 
} from '../../validations/user.validation';

const userRouter = Router();

// Toutes les routes ici nécessitent une authentification
userRouter.use(isAuthenticated);

// --- Profil Utilisateur --- 

// GET /api/users/me - Récupérer les informations de l'utilisateur connecté
userRouter.get('/me', UserController.getCurrentUser);

// PUT /api/users/me - Mettre à jour les informations de l'utilisateur connecté (nom, email)
userRouter.put('/me', validate(updateUserSchema), UserController.updateCurrentUser);

// PUT /api/users/me/password - Changer le mot de passe de l'utilisateur connecté
userRouter.put('/me/password', validate(changePasswordSchema), UserController.changePassword);

// --- Adresses Utilisateur --- 

// GET /api/users/me/addresses - Récupérer toutes les adresses de l'utilisateur connecté
userRouter.get('/me/addresses', UserController.getUserAddresses);

// POST /api/users/me/addresses - Ajouter une nouvelle adresse pour l'utilisateur connecté
userRouter.post('/me/addresses', validate(createAddressSchema), UserController.addUserAddress);

// GET /api/users/me/addresses/:addressId - Récupérer une adresse spécifique
userRouter.get('/me/addresses/:addressId', validate(addressIdParamSchema), UserController.getUserAddressById);

// PUT /api/users/me/addresses/:addressId - Mettre à jour une adresse spécifique
userRouter.put('/me/addresses/:addressId', validate(updateAddressSchema), UserController.updateUserAddress);

// DELETE /api/users/me/addresses/:addressId - Supprimer une adresse spécifique
userRouter.delete('/me/addresses/:addressId', validate(addressIdParamSchema), UserController.deleteUserAddress);

export default userRouter; 