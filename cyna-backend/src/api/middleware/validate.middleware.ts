import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError, z } from 'zod';
import { ApiError } from '../../errors/ApiError';

// Étendre Request pour inclure validatedData
declare global {
  namespace Express {
    interface Request {
      validatedData?: {
        body?: any;
        query?: any;
        params?: any;
      };
    }
  }
}

/**
 * Middleware pour valider les données de la requête (body, params, query) en utilisant un schéma Zod.
 * @param schema Le schéma Zod à utiliser pour la validation.
 */
export const validate = (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Parser les données
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      
      // Attacher les données parsées à la requête
      req.validatedData = {
          body: parsed.body,
          query: parsed.query,
          params: parsed.params,
      };

      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Formater les erreurs Zod pour une meilleure lisibilité
        const errorMessages = error.errors.map((err) => ({
          field: err.path.join('.'), // Chemin du champ en erreur (ex: body.email)
          message: err.message,
        }));
        // Utiliser ApiError pour une gestion centralisée (ou envoyer directement)
        // Renvoyer une erreur 400 Bad Request
        return next(new ApiError(400, 'Validation failed', true, JSON.stringify(errorMessages)));
        // Alternative: res.status(400).json({ errors: errorMessages });
      } else {
        // Erreur inattendue pendant la validation
        return next(new ApiError(500, 'Internal Server Error during validation'));
      }
    }
}; 