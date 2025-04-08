import { Router } from 'express';
import { ContactController } from '../../controllers/contact.controller';
import { validate } from '../middleware/validate.middleware';
import { createContactMessageSchema } from '../../validations/contact.validation';

const contactRouter = Router();

// POST /api/contact - Soumettre un message (Public)
contactRouter.post(
    '/', 
    validate(createContactMessageSchema), 
    ContactController.submitContactForm
);

export default contactRouter; 