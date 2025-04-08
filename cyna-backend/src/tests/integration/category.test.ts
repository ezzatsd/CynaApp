import request from 'supertest';
import app from '../../app'; 
import { PrismaClient } from '@prisma/client';
import { generateTestJwt } from '../helpers/auth.helper';

const prisma = new PrismaClient();

// Helper pour obtenir un token admin
let adminToken: string;
let adminUser: any;
let normalUserToken: string;
let normalUser: any;

// Créer un admin et un user normal + obtenir leurs tokens avant les tests de ce fichier
beforeAll(async () => {
    // Créer Admin
    adminUser = await prisma.user.create({
        data: {
            email: 'admin.category@test.com',
            passwordHash: 'hashedpassword',
            isAdmin: true,
            name: 'Admin Category Tester',
        },
    });
    // Générer le token admin avec le helper
    adminToken = generateTestJwt({ 
        id: adminUser.id, 
        email: adminUser.email, 
        isAdmin: adminUser.isAdmin 
    });

    // Créer User Normal
    normalUser = await prisma.user.create({
        data: {
            email: 'normal.category@test.com',
            passwordHash: 'hashedpassword',
            isAdmin: false,
            name: 'Normal Category Tester',
        },
    });
    // Générer le token normal avec le helper
    normalUserToken = generateTestJwt({ 
        id: normalUser.id, 
        email: normalUser.email, 
        isAdmin: normalUser.isAdmin 
    });
});

describe('Category API Endpoints', () => {

    let createdCategoryId: string;
    const categoryData = { 
        name: 'Test Category', 
        description: 'A category for testing',
        priority: 10,
        image: 'http://example.com/image.png'
    };

    // --- Tests Publics (GET) --- 
    describe('GET /api/categories', () => {
        it('should return an empty list of categories initially', async () => {
            const response = await request(app).get('/api/categories');
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('data');
            expect(response.body.data).toBeInstanceOf(Array);
            expect(response.body.data.length).toBe(0);
            expect(response.body).toHaveProperty('meta');
        });
        // Ajouter des tests pour la pagination/tri plus tard si besoin
    });

    // --- Tests Admin (POST, PUT, DELETE) --- 
    describe('Admin Operations', () => {

        it('POST /api/categories - should fail without admin token', async () => {
            const response = await request(app)
                .post('/api/categories')
                .set('Authorization', `Bearer ${normalUserToken}`) // Utiliser token normal
                .send(categoryData);
            expect(response.status).toBe(403); // Forbidden
        });
        
        it('POST /api/categories - should fail without any token', async () => {
            const response = await request(app)
                .post('/api/categories')
                .send(categoryData);
            expect(response.status).toBe(401); // Unauthorized
        });

        // Ce test devrait maintenant réussir avec le vrai token
        it('POST /api/categories - should create a category with admin token', async () => {
            const response = await request(app)
                .post('/api/categories')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(categoryData);
            
            // Attendre 201 Created maintenant
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body.name).toBe(categoryData.name);
            expect(response.body.description).toBe(categoryData.description);
            expect(response.body.priority).toBe(categoryData.priority);
            expect(response.body.image).toBe(categoryData.image);
            createdCategoryId = response.body.id; // Sauvegarder l'ID pour les tests suivants
        });

        // Ajouter des tests pour POST validation (données manquantes/invalides) ici si nécessaire
        it('POST /api/categories - should return 400 for missing name', async () => {
            const { name, ...invalidData } = categoryData;
            const response = await request(app)
                .post('/api/categories')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(invalidData);
            expect(response.status).toBe(400);
            expect(response.body.errors).toEqual(expect.arrayContaining([expect.objectContaining({ field: 'body.name' })]));
        });
        
        // --- Tests dépendant de la création (Décommenter le bloc) ---
        describe('Operations on created category', () => {
             beforeAll(() => {
                 if (!createdCategoryId) {
                     throw new Error('Cannot run tests depending on category creation because createdCategoryId is not set.');
                 }
             });

            it('GET /api/categories/:id - should retrieve the created category', async () => {
                const response = await request(app).get(`/api/categories/${createdCategoryId}`);
                expect(response.status).toBe(200);
                expect(response.body.id).toBe(createdCategoryId);
                expect(response.body.name).toBe(categoryData.name);
            });

            it('PUT /api/categories/:id - should update the category with admin token', async () => {
                const updatedData = { name: 'Updated Category Name', priority: 5 };
                const response = await request(app)
                    .put(`/api/categories/${createdCategoryId}`)
                    .set('Authorization', `Bearer ${adminToken}`)
                    .send(updatedData);
                expect(response.status).toBe(200);
                expect(response.body.name).toBe(updatedData.name);
                expect(response.body.priority).toBe(updatedData.priority);
            });

             it('PUT /api/categories/:id - should fail without admin token', async () => {
                 const response = await request(app)
                     .put(`/api/categories/${createdCategoryId}`)
                     .set('Authorization', `Bearer ${normalUserToken}`)
                     .send({ name: 'Update Attempt' });
                 expect(response.status).toBe(403);
             });
             
            // Ajouter tests de validation PUT
            it('PUT /api/categories/:id - should return 400 for invalid priority', async () => {
                 const response = await request(app)
                    .put(`/api/categories/${createdCategoryId}`)
                    .set('Authorization', `Bearer ${adminToken}`)
                    .send({ priority: -5 }); // Priorité invalide
                expect(response.status).toBe(400);
                 expect(response.body.errors).toEqual(expect.arrayContaining([expect.objectContaining({ field: 'body.priority' })]));
            });

            it('DELETE /api/categories/:id - should fail without admin token', async () => {
                const response = await request(app)
                    .delete(`/api/categories/${createdCategoryId}`)
                    .set('Authorization', `Bearer ${normalUserToken}`);
                expect(response.status).toBe(403);
            });

            it('DELETE /api/categories/:id - should delete the category with admin token', async () => {
                const response = await request(app)
                    .delete(`/api/categories/${createdCategoryId}`)
                    .set('Authorization', `Bearer ${adminToken}`);
                expect(response.status).toBe(204);

                // Vérifier qu'elle n'est plus récupérable
                const getResponse = await request(app).get(`/api/categories/${createdCategoryId}`);
                // Vérifier l'erreur 400 car l'ID est valide mais la ressource n'existe plus
                // Note: Le contrôleur actuel renvoie une ApiError(404), qui sera gérée comme 404
                // Mais le middleware de validation Zod pour les params s'exécute avant
                // Il faudrait ajuster soit le test soit la logique (ex: middleware de vérif d'existence)
                // Pour l'instant, attendons 400 à cause de la validation CUID qui passe
                // MAIS le service lèvera 404. Le handler global renverra 404.
                expect(getResponse.status).toBe(404); 
            });

            it('GET /api/categories/:id - should return 404 after deletion', async () => {
                const response = await request(app).get(`/api/categories/${createdCategoryId}`);
                 // Idem : la route matche, la validation CUID passe, mais le service renvoie 404.
                expect(response.status).toBe(404);
            });
        });
    });

}); 