import request from 'supertest';
import app from '../../app'; // Votre application Express
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { EmailService } from '../../services/email.service'; // Importer pour le mock
import prisma from '../helpers/prisma.helper'; // Importer l'instance partagée

// const prisma = new PrismaClient(); // Supprimé

// Simuler (Mock) le EmailService pour ne pas envoyer de vrais emails pendant les tests
jest.mock('../../services/email.service');
const mockedEmailService = EmailService as jest.Mocked<typeof EmailService>;

// Note : Le fichier setup.ts nettoie la BDD avant l'exécution de ce fichier.

describe('Auth API Endpoints', () => {
    let testUser = {
        email: 'test.user@example.com',
        password: 'password123',
        name: 'Test User',
    };
    let createdUserId: string;
    let loginResponse: request.Response; // Pour stocker la réponse du login (avec tokens)
    let validRefreshToken: string;

    // --- Setup : Créer l'utilisateur avant les tests de login/logout/refresh --- 
    // (Note: beforeAll dans setup.ts nettoie la BDD avant ce fichier)
    beforeAll(async () => {
        const registerRes = await request(app)
            .post('/api/auth/register')
            .send(testUser);
        createdUserId = registerRes.body.id;

        loginResponse = await request(app)
            .post('/api/auth/login')
            .send({ email: testUser.email, password: testUser.password });
        validRefreshToken = loginResponse.body.refreshToken;
    });

    // --- Tests pour /api/auth/register --- 
    describe('POST /api/auth/register', () => {
        // Créer un utilisateur différent pour ces tests car le principal est déjà créé dans beforeAll
        const registerSpecificUser = {
             email: 'register.test@example.com',
             password: 'password123',
             name: 'Register Test',
        };
        it('should register a new user successfully', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send(registerSpecificUser);
            expect(response.status).toBe(201);
            expect(response.body.email).toBe(registerSpecificUser.email);
        });
        it('should return 409 Conflict if email already exists', async () => {
             // Utiliser l'utilisateur créé dans beforeAll
            const response = await request(app)
                .post('/api/auth/register')
                .send({ email: testUser.email, password: 'anotherpass' }); 
            expect(response.status).toBe(409);
        });
         it('should return 400 Bad Request for missing email', async () => {
             const { email, ...userWithoutEmail } = registerSpecificUser;
             const response = await request(app).post('/api/auth/register').send(userWithoutEmail);
             expect(response.status).toBe(400);
             expect(response.body.errors).toEqual(expect.arrayContaining([expect.objectContaining({ field: 'body.email' })]));
         });
         it('should return 400 Bad Request for short password', async () => {
              const response = await request(app).post('/api/auth/register').send({ ...registerSpecificUser, password: '123' });
              expect(response.status).toBe(400);
              expect(response.body.errors).toEqual(expect.arrayContaining([expect.objectContaining({ field: 'body.password' })]));
         });
    });

    // --- Tests pour /api/auth/login --- 
    describe('POST /api/auth/login', () => {
        it('should login the registered user successfully and return tokens', async () => {
             // Utilise la réponse stockée dans beforeAll
            expect(loginResponse.status).toBe(200);
            expect(loginResponse.body.user.id).toBe(createdUserId);
            expect(loginResponse.body).toHaveProperty('accessToken');
            expect(loginResponse.body).toHaveProperty('refreshToken');
        });
        it('should return 401 Unauthorized for incorrect password', async () => {
             const response = await request(app).post('/api/auth/login').send({ email: testUser.email, password: 'wrong' });
             expect(response.status).toBe(401);
         });
        it('should return 401 Unauthorized for non-existent email', async () => {
            const response = await request(app).post('/api/auth/login').send({ email: 'no@no.com', password: 'pass' });
            expect(response.status).toBe(401);
        });
         it('should return 400 Bad Request for missing password', async () => {
            const response = await request(app).post('/api/auth/login').send({ email: testUser.email });
            expect(response.status).toBe(400);
        });
    });

    // --- Tests pour /api/auth/refresh-token --- 
    describe('POST /api/auth/refresh-token', () => {
        it('should return a new access token with a valid refresh token', async () => {
            const response = await request(app)
                .post('/api/auth/refresh-token')
                .send({ refreshToken: validRefreshToken });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('accessToken');
            expect(response.body.accessToken).not.toBeNull();
            // Vérifier que le nouvel access token est différent de l'ancien (optionnel mais bon)
            // expect(response.body.accessToken).not.toBe(loginResponse.body.accessToken);
            // Commenté car le token peut être identique si généré dans la même seconde.
            // L'important est qu'un token valide soit retourné.
        });

        it('should return 401 Unauthorized with an invalid refresh token', async () => {
            const response = await request(app)
                .post('/api/auth/refresh-token')
                .send({ refreshToken: 'invalid-token' });

            expect(response.status).toBe(401);
            expect(response.body.message).toMatch(/Invalid or expired refresh token/i);
        });

         it('should return 400 Bad Request if refresh token is missing', async () => {
            const response = await request(app)
                .post('/api/auth/refresh-token')
                .send({});

            expect(response.status).toBe(400);
             expect(response.body.errors).toEqual(expect.arrayContaining([expect.objectContaining({ field: 'body.refreshToken' })]));
        });
    });

    // --- Tests pour /api/auth/logout --- 
    describe('POST /api/auth/logout', () => {
         // Recréer un utilisateur et login pour obtenir un refresh token frais pour ce test
        let logoutUser = { email: 'logout@example.com', password: 'password123' };
        let logoutRefreshToken: string;

        beforeAll(async () => {
            await request(app).post('/api/auth/register').send(logoutUser);
            const loginRes = await request(app).post('/api/auth/login').send(logoutUser);
            logoutRefreshToken = loginRes.body.refreshToken;
        });

        it('should logout successfully with a valid refresh token', async () => {
            const response = await request(app)
                .post('/api/auth/logout')
                .send({ refreshToken: logoutRefreshToken });
            
            expect(response.status).toBe(204);

            // Vérifier que le token n'est plus utilisable pour refresh
            const refreshAttempt = await request(app)
                .post('/api/auth/refresh-token')
                .send({ refreshToken: logoutRefreshToken });
            expect(refreshAttempt.status).toBe(401);

            // Vérifier que la session a été supprimée de la BDD
            const session = await prisma.session.findFirst({ where: { token: logoutRefreshToken } });
            expect(session).toBeNull();
        });

        it('should return 400 if refresh token is missing', async () => {
            const response = await request(app)
                .post('/api/auth/logout')
                .send({});
            expect(response.status).toBe(400); // Le contrôleur vérifie la présence
        });

        it('should still return 204 even if refresh token is invalid/already logged out', async () => {
            // Le service ne lève pas d'erreur si la suppression échoue (idempotent)
            const response = await request(app)
                .post('/api/auth/logout')
                .send({ refreshToken: 'invalid-or-already-logged-out-token' });
            expect(response.status).toBe(204);
        });
    });

    // --- Tests pour /api/auth/forgot-password --- 
    describe('POST /api/auth/forgot-password', () => {
        beforeEach(() => {
            // Réinitialiser les mocks avant chaque test de ce bloc
            mockedEmailService.sendPasswordResetEmail.mockClear();
        });

        it('should return 200 OK and trigger email sending for existing user', async () => {
            const response = await request(app)
                .post('/api/auth/forgot-password')
                .send({ email: testUser.email });

            expect(response.status).toBe(200);
            expect(response.body.message).toMatch(/link has been sent/i);

            // Vérifier que le service d'email simulé a été appelé
            expect(mockedEmailService.sendPasswordResetEmail).toHaveBeenCalledTimes(1);
            expect(mockedEmailService.sendPasswordResetEmail).toHaveBeenCalledWith(
                testUser.email.toLowerCase(),
                expect.any(String) // Le token est généré aléatoirement
            );

            // Vérifier que le token hashé et l'expiration sont en BDD
            const user = await prisma.user.findUnique({ where: { email: testUser.email } });
            expect(user).not.toBeNull();
            expect(user?.passwordResetToken).not.toBeNull();
            expect(user?.passwordResetExpires).not.toBeNull();
            // Vérifier que l'expiration est dans le futur (ex: dans l'heure)
            expect(user?.passwordResetExpires?.getTime()).toBeGreaterThan(Date.now());
            expect(user?.passwordResetExpires?.getTime()).toBeLessThan(Date.now() + 3600000 + 1000); // Dans 1h + marge
        });

        it('should return 200 OK even for non-existent user (security)', async () => {
            const response = await request(app)
                .post('/api/auth/forgot-password')
                .send({ email: 'nonexistent@example.com' });
            
            expect(response.status).toBe(200);
            expect(response.body.message).toMatch(/link has been sent/i);
            // Vérifier que le service d'email n'a PAS été appelé
            expect(mockedEmailService.sendPasswordResetEmail).not.toHaveBeenCalled();
        });

         it('should return 400 Bad Request for invalid email format', async () => {
            const response = await request(app)
                .post('/api/auth/forgot-password')
                .send({ email: 'invalid-email' });
            expect(response.status).toBe(400);
            expect(response.body.errors).toEqual(expect.arrayContaining([expect.objectContaining({ field: 'body.email' })]));
        });
    });

    // --- Tests pour /api/auth/reset-password --- 
    describe('POST /api/auth/reset-password/:token', () => {
        let resetUser = { email: 'reset@example.com', password: 'oldPassword123' };
        let plainTextResetToken: string;
        let hashedResetToken: string;
        let resetUserId: string;

        // Préparer un utilisateur avec un token de reset valide
        beforeAll(async () => {
            const regRes = await request(app).post('/api/auth/register').send(resetUser);
            resetUserId = regRes.body.id;

            plainTextResetToken = crypto.randomBytes(32).toString('hex');
            hashedResetToken = crypto.createHash('sha256').update(plainTextResetToken).digest('hex');
            const expires = new Date(Date.now() + 3600000); // Expire dans 1 heure

            await prisma.user.update({
                where: { id: resetUserId },
                data: { passwordResetToken: hashedResetToken, passwordResetExpires: expires },
            });
        });

        it('should reset password successfully with valid token and new password', async () => {
            const newPassword = 'newStrongPassword123';
            const response = await request(app)
                .post(`/api/auth/reset-password/${plainTextResetToken}`)
                .send({ password: newPassword });

            expect(response.status).toBe(200);
            expect(response.body.message).toMatch(/Password has been reset successfully/i);

            // Vérifier que le mot de passe a changé (en essayant de se logger avec le nouveau)
            const loginAttempt = await request(app)
                .post('/api/auth/login')
                .send({ email: resetUser.email, password: newPassword });
            expect(loginAttempt.status).toBe(200);

            // Vérifier que le token a été invalidé en BDD
            const user = await prisma.user.findUnique({ where: { id: resetUserId } });
            expect(user?.passwordResetToken).toBeNull();
            expect(user?.passwordResetExpires).toBeNull();
        });

        it('should return 400 Bad Request with invalid token', async () => {
            const response = await request(app)
                .post(`/api/auth/reset-password/invalid-token`)
                .send({ password: 'newPassword' });
            
            expect(response.status).toBe(400);
            expect(response.body.message).toMatch(/invalid or has expired/i);
        });

        it('should return 400 Bad Request with expired token', async () => {
            // Créer un token expiré manuellement
            const expiredTokenPlain = crypto.randomBytes(32).toString('hex');
            const expiredTokenHashed = crypto.createHash('sha256').update(expiredTokenPlain).digest('hex');
            const expiredDate = new Date(Date.now() - 1000); // Date dans le passé
            await prisma.user.update({ 
                where: { id: resetUserId }, 
                data: { passwordResetToken: expiredTokenHashed, passwordResetExpires: expiredDate }
            });

            const response = await request(app)
                .post(`/api/auth/reset-password/${expiredTokenPlain}`)
                .send({ password: 'anotherNewPassword' });

            expect(response.status).toBe(400);
            expect(response.body.message).toMatch(/invalid or has expired/i);
        });

        it('should return 400 Bad Request if password is too short', async () => {
            const response = await request(app)
                .post(`/api/auth/reset-password/${plainTextResetToken}`)
                .send({ password: 'short' });
            
            expect(response.status).toBe(400);
            expect(response.body.errors).toEqual(expect.arrayContaining([expect.objectContaining({ field: 'body.password' })]));
        });

    });

}); 