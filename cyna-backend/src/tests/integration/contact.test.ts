import request from 'supertest';
import app from '../../app'; 
import { PrismaClient } from '@prisma/client';
import prisma from '../helpers/prisma.helper';

describe('Contact API Endpoint', () => {

    const validMessage = {
        email: "test.contact@example.com",
        subject: "Question about your service",
        message: "This is a test message with enough characters to pass validation."
    };

    it('POST /api/contact - should accept a valid message and return 200', async () => {
        const initialCount = await prisma.contactMessage.count();

        const response = await request(app)
            .post('/api/contact')
            .send(validMessage);

        expect(response.status).toBe(200);
        expect(response.body.message).toMatch(/received/i);

        // Vérifier que le message a été enregistré en BDD
        const finalCount = await prisma.contactMessage.count();
        expect(finalCount).toBe(initialCount + 1);
        const newMessage = await prisma.contactMessage.findFirst({
            where: { email: validMessage.email },
            orderBy: { createdAt: 'desc' }
        });
        expect(newMessage).not.toBeNull();
        expect(newMessage?.subject).toBe(validMessage.subject);
        expect(newMessage?.message).toBe(validMessage.message);
    });

    it('POST /api/contact - should return 400 for missing email', async () => {
        const { email, ...invalidData } = validMessage;
        const response = await request(app)
            .post('/api/contact')
            .send(invalidData);
        expect(response.status).toBe(400);
        expect(response.body.errors).toEqual(expect.arrayContaining([
            expect.objectContaining({ field: 'body.email' })
        ]));
    });

     it('POST /api/contact - should return 400 for short message', async () => {
        const invalidData = { ...validMessage, message: 'short' };
        const response = await request(app)
            .post('/api/contact')
            .send(invalidData);
        expect(response.status).toBe(400);
         expect(response.body.errors).toEqual(expect.arrayContaining([
            expect.objectContaining({ field: 'body.message' })
        ]));
    });

     it('POST /api/contact - should return 400 for missing subject', async () => {
        const { subject, ...invalidData } = validMessage;
        const response = await request(app)
            .post('/api/contact')
            .send(invalidData);
        expect(response.status).toBe(400);
         expect(response.body.errors).toEqual(expect.arrayContaining([
            expect.objectContaining({ field: 'body.subject' })
        ]));
    });

}); 