import { z } from 'zod';

export const createContactMessageSchema = z.object({
  body: z.object({
    email: z.string().email({ message: 'Invalid email address' }),
    subject: z.string().min(1, { message: 'Subject cannot be empty' }).max(200, { message: 'Subject too long' }),
    message: z.string().min(10, { message: 'Message must be at least 10 characters long' }),
  }),
}); 