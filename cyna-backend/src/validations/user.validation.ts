import { z } from 'zod';

// Schéma pour la mise à jour du profil (nom, email)
export const updateUserSchema = z.object({
    body: z.object({
        name: z.string().min(1, "Name cannot be empty").optional(),
        email: z.string().email({ message: "Invalid email format" }).optional(),
        // Ne pas permettre de changer isAdmin via cette route
    }).partial().refine(data => Object.keys(data).length > 0, { 
        message: "At least one field (name or email) must be provided for update" 
    }), // S'assurer qu'au moins un champ est fourni
});

// Schéma pour le changement de mot de passe
export const changePasswordSchema = z.object({
    body: z.object({
        currentPassword: z.string().min(1, "Current password is required"),
        newPassword: z.string().min(8, "New password must be at least 8 characters long"),
    }),
});

// Schéma de base pour une adresse (utilisé pour la création)
const addressBaseSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    address1: z.string().min(1, "Address line 1 is required"),
    address2: z.string().optional().nullable(),
    city: z.string().min(1, "City is required"),
    region: z.string().min(1, "Region/State is required"), // Ou ajuster selon besoin (ex: optional)
    postalCode: z.string().min(1, "Postal code is required"),
    country: z.string().min(1, "Country is required"), // Peut-être une enum ou lookup plus tard
    phoneNumber: z.string().min(1, "Phone number is required"), // Validation plus stricte possible
    isDefaultBilling: z.boolean().optional().default(false),
});

// Schéma pour la création d'adresse
export const createAddressSchema = z.object({
    body: addressBaseSchema,
});

// Schéma pour la mise à jour d'adresse (tous les champs optionnels)
export const updateAddressSchema = z.object({
    params: z.object({
        addressId: z.string().cuid({ message: 'Invalid address ID format' }),
    }),
    body: addressBaseSchema.partial().refine(data => Object.keys(data).length > 0, { 
        message: "At least one field must be provided for update" 
    }),
});

// Schéma pour valider l'ID d'adresse dans les paramètres
export const addressIdParamSchema = z.object({
    params: z.object({
        addressId: z.string().cuid({ message: 'Invalid address ID format' }),
    }),
}); 