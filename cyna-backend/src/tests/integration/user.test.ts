import request from 'supertest';
import app from '../../app'; 
import { generateTestJwt } from '../helpers/auth.helper';
import prisma from '../helpers/prisma.helper';
import bcrypt from 'bcryptjs'; // Importer pour vérifier le hash du mdp

// Variables globales
let userToken: string;
let userId: string;
let userEmail: string;
let createdAddressId: string;

// Créer un utilisateur avant les tests de ce fichier
beforeAll(async () => {
    const user = await prisma.user.create({
        data: {
            email: 'user.profile@test.com',
            passwordHash: await bcrypt.hash('password123', 10),
            isAdmin: false,
            name: 'User Profile Tester',
        },
    });
    userId = user.id;
    userEmail = user.email;
    userToken = generateTestJwt({ id: userId, email: userEmail, isAdmin: false });
});

describe('User Profile & Address API Endpoints', () => {

    // --- Tests Profil (/api/users/me) --- 
    describe('Profile Endpoints (/api/users/me)', () => {
        it('GET /me - should retrieve current user details', async () => {
            const response = await request(app)
                .get('/api/users/me')
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(200);
            expect(response.body.id).toBe(userId);
            expect(response.body.email).toBe(userEmail);
            expect(response.body.name).toBe('User Profile Tester');
            expect(response.body).not.toHaveProperty('passwordHash');
        });

        it('GET /me - should fail without token', async () => {
            const response = await request(app).get('/api/users/me');
            expect(response.status).toBe(401);
        });

        it('PUT /me - should update user profile (name)', async () => {
            const newName = 'Updated User Name';
            const response = await request(app)
                .put('/api/users/me')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ name: newName });

            expect(response.status).toBe(200);
            expect(response.body.name).toBe(newName);

            // Vérifier en BDD
            const dbUser = await prisma.user.findUnique({ where: { id: userId } });
            expect(dbUser?.name).toBe(newName);
        });
        
        it('PUT /me - should update user profile (email)', async () => {
            const newEmail = 'updated.profile@test.com';
            const response = await request(app)
                .put('/api/users/me')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ email: newEmail });

            expect(response.status).toBe(200);
            expect(response.body.email).toBe(newEmail);
            userEmail = newEmail; // Mettre à jour pour les tests suivants
        });

        it('PUT /me - should fail with invalid email format', async () => {
            const response = await request(app)
                .put('/api/users/me')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ email: 'invalid-email' });
            expect(response.status).toBe(400);
        });
        
        it('PUT /me - should fail without providing any field', async () => {
             const response = await request(app)
                .put('/api/users/me')
                .set('Authorization', `Bearer ${userToken}`)
                .send({}); // Envoi vide
             expect(response.status).toBe(400);
             expect(response.body.errors).toEqual(expect.arrayContaining([
                 expect.objectContaining({ field: 'body' }) // Zod refinment error on body object
             ]));
         });

        it('PUT /me/password - should change password successfully', async () => {
            const newPassword = 'newPassword456';
            const response = await request(app)
                .put('/api/users/me/password')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ currentPassword: 'password123', newPassword: newPassword });
            
            expect(response.status).toBe(204);

            // Vérifier que l'ancien mot de passe ne fonctionne plus
            const loginAttemptOld = await request(app).post('/api/auth/login').send({ email: userEmail, password: 'password123' });
            expect(loginAttemptOld.status).toBe(401);

             // Vérifier que le nouveau mot de passe fonctionne
            const loginAttemptNew = await request(app).post('/api/auth/login').send({ email: userEmail, password: newPassword });
            expect(loginAttemptNew.status).toBe(200);
        });

        it('PUT /me/password - should fail with incorrect current password', async () => {
            const response = await request(app)
                .put('/api/users/me/password')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ currentPassword: 'wrongOldPassword', newPassword: 'anotherNewPass' });
            expect(response.status).toBe(401);
            expect(response.body.message).toMatch(/Incorrect current password/i);
        });

        it('PUT /me/password - should fail with short new password', async () => {
            // Utiliser le mot de passe courant initial connu pour isoler le test de validation Zod
            const response = await request(app)
                .put('/api/users/me/password')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ currentPassword: 'password123', newPassword: 'short' }); 
            expect(response.status).toBe(400);
             expect(response.body.errors).toEqual(expect.arrayContaining([expect.objectContaining({ field: 'body.newPassword' })]));
        });
    });

    // --- Tests Adresses (/api/users/me/addresses) --- 
    describe('Address Endpoints (/api/users/me/addresses)', () => {
        const addressData = {
            firstName: "Test", lastName: "UserAddr",
            address1: "123 Test St", city: "Testville", region: "TS", 
            postalCode: "12345", country: "Testland", phoneNumber: "555-1234"
        };

        it('GET /me/addresses - should return empty list initially', async () => {
             const response = await request(app)
                .get('/api/users/me/addresses')
                .set('Authorization', `Bearer ${userToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toBeInstanceOf(Array);
            expect(response.body.length).toBe(0);
        });

        it('POST /me/addresses - should create a new address', async () => {
            const response = await request(app)
                .post('/api/users/me/addresses')
                .set('Authorization', `Bearer ${userToken}`)
                .send(addressData);
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body.address1).toBe(addressData.address1);
            expect(response.body.userId).toBe(userId);
            createdAddressId = response.body.id;
        });
        
         it('POST /me/addresses - should fail with missing required fields', async () => {
             const { firstName, ...invalidData } = addressData;
             const response = await request(app)
                 .post('/api/users/me/addresses')
                 .set('Authorization', `Bearer ${userToken}`)
                 .send(invalidData);
             expect(response.status).toBe(400);
              expect(response.body.errors).toEqual(expect.arrayContaining([expect.objectContaining({ field: 'body.firstName' })]));
         });

        describe('Operations on created address', () => {
            beforeAll(() => {
                if (!createdAddressId) throw new Error('createdAddressId not set');
            });

            it('GET /me/addresses/:addressId - should retrieve the created address', async () => {
                const response = await request(app)
                    .get(`/api/users/me/addresses/${createdAddressId}`)
                    .set('Authorization', `Bearer ${userToken}`);
                expect(response.status).toBe(200);
                expect(response.body.id).toBe(createdAddressId);
            });

             it('GET /me/addresses/:addressId - should fail for non-existent address ID', async () => {
                const response = await request(app)
                    .get(`/api/users/me/addresses/clfakeid0000ld00fake0000`)
                    .set('Authorization', `Bearer ${userToken}`);
                expect(response.status).toBe(404); 
            });

            it('PUT /me/addresses/:addressId - should update the address', async () => {
                const updated = { city: 'UpdatedCity' };
                const response = await request(app)
                    .put(`/api/users/me/addresses/${createdAddressId}`)
                    .set('Authorization', `Bearer ${userToken}`)
                    .send(updated);
                expect(response.status).toBe(200);
                expect(response.body.city).toBe(updated.city);
            });

            // Test pour vérifier qu'un user ne peut pas accéder/modifier l'adresse d'un autre user
            // (Nécessite de créer un deuxième utilisateur et son adresse)

            it('DELETE /me/addresses/:addressId - should delete the address', async () => {
                const deleteResponse = await request(app)
                    .delete(`/api/users/me/addresses/${createdAddressId}`)
                    .set('Authorization', `Bearer ${userToken}`);
                
                // Vérification explicite du statut DELETE
                expect(deleteResponse.status).toBe(204);

                // Petite pause pour s'assurer que la BDD a le temps de traiter (pas idéal, mais pour tester)
                await new Promise(resolve => setTimeout(resolve, 50)); 

                // Vérifier qu'elle n'est plus récupérable
                const getAttempt = await request(app)
                    .get(`/api/users/me/addresses/${createdAddressId}`)
                    .set('Authorization', `Bearer ${userToken}`);
                
                // S'attendre maintenant au 404
                expect(getAttempt.status).toBe(404);
            });
        });
    });
}); 