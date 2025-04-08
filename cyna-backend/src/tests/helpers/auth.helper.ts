import jwt from 'jsonwebtoken';
import config from '../../config'; // Importer la config pour les secrets JWT

interface UserPayload {
    id: string;
    email: string;
    isAdmin: boolean;
}

/**
 * Génère un token d'accès JWT valide pour les tests.
 * @param user - L'objet utilisateur (ou juste l'ID, email, isAdmin).
 * @returns Le token JWT signé.
 */
export const generateTestJwt = (user: UserPayload): string => {
    const payload = {
        userId: user.id,
        email: user.email,
        isAdmin: user.isAdmin,
    };

    // Utiliser le même secret et des options similaires à la vraie génération
    const token = jwt.sign(payload, config.jwtSecret, { expiresIn: '15m' }); // Expiration courte pour les tests
    return token;
}; 