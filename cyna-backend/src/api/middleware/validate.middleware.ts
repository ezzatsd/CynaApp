import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { ApiError } from '../../errors/ApiError';

/**
 * Middleware pour valider les données de la requête (body, params, query) en utilisant un schéma Zod.
 * @param schema Le schéma Zod à utiliser pour la validation.
 */
export const validate = (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      // Si la validation réussit, les données parsées ne sont pas explicitement attachées ici,
      // les contrôleurs utiliseront req.body, req.params, req.query comme d'habitude.
      // Zod assure la conformité du type et les transformations (par ex., .default()).
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