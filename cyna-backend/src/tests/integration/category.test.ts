import request from 'supertest';
import app from '../../app'; 
import { PrismaClient, Category } from '@prisma/client';
import { generateTestJwt } from '../helpers/auth.helper';
import prisma from '../helpers/prisma.helper';

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

    const baseCategoryData = { 
        name: 'Base Test Category', 
        description: 'A category for testing',
        priority: 10,
        image: 'http://example.com/image.png'
    };

    // --- Tests Publics (GET) --- 
    describe('GET /api/categories', () => {
        it('should return an empty list of categories initially', async () => {
            const response = await request(app).get('/api/categories');
            expect(response.status).toBe(200);
            expect(response.body.data.length).toBe(0);
        });
    });

    describe('GET /api/categories/:id', () => {
        it('should return 404 for a non-existent category ID', async () => {
            // Utiliser un ID format CUID mais qui n'existe pas
            const nonExistentId = 'cl00000000000000000000000'; 
            const response = await request(app).get(`/api/categories/${nonExistentId}`);
            expect(response.status).toBe(404); 
        });

        it('should return 400 for an invalid ID format', async () => {
            const invalidId = 'invalid-id-format';
            const response = await request(app).get(`/api/categories/${invalidId}`);
             expect(response.status).toBe(400); 
              expect(response.body.errors).toEqual(expect.arrayContaining([expect.objectContaining({ field: 'params.id' })]));
        });
    });

    // --- Tests Admin (POST) --- 
    describe('POST /api/categories', () => {
        // Test permissions
        it('should fail without admin token', async () => {
            const response = await request(app)
                .post('/api/categories')
                .set('Authorization', `Bearer ${normalUserToken}`)
                .send(baseCategoryData);
            expect(response.status).toBe(403);
        });
        it('should fail without any token', async () => {
            const response = await request(app)
                .post('/api/categories')
                .send(baseCategoryData);
            expect(response.status).toBe(401);
        });

        // Test création succès
        it('should create a category with admin token', async () => {
             const categoryToCreate = { ...baseCategoryData, name: "POST Test Category" };
            const response = await request(app)
                .post('/api/categories')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(categoryToCreate);
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body.name).toBe(categoryToCreate.name);
        });

        // Test validation
         it('should return 400 for missing name', async () => {
            const { name, ...invalidData } = baseCategoryData;
            const response = await request(app)
                .post('/api/categories')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(invalidData);
            expect(response.status).toBe(400);
            expect(response.body.errors).toEqual(expect.arrayContaining([expect.objectContaining({ field: 'body.name' })]));
        });

        // Test de conflit (nom unique)
         it('should return 409 Conflict if category name already exists', async () => {
             // Créer une première fois
             const uniqueNameData = { ...baseCategoryData, name: "Unique Name Test" };
             await request(app).post('/api/categories').set('Authorization', `Bearer ${adminToken}`).send(uniqueNameData);
             // Tenter de créer à nouveau
             const response = await request(app).post('/api/categories').set('Authorization', `Bearer ${adminToken}`).send(uniqueNameData);
             expect(response.status).toBe(409);
             expect(response.body.message).toMatch(/already exists/i);
         });
    });

    // --- Tests Admin (PUT, DELETE sur une catégorie spécifique) ---
    describe('PUT & DELETE /api/categories/:id', () => {
        let categoryForOps: Category; // Catégorie créée spécifiquement pour ces tests

        // Créer la catégorie avant les tests PUT/DELETE
        beforeAll(async () => {
            categoryForOps = await prisma.category.create({
                data: { ...baseCategoryData, name: 'Category For PUT_DELETE' }
            });
        });

         it('GET /api/categories/:id - should retrieve the specific category before ops', async () => {
             const response = await request(app).get(`/api/categories/${categoryForOps.id}`);
             expect(response.status).toBe(200);
             expect(response.body.id).toBe(categoryForOps.id);
         });

        // Tests PUT
        it('PUT /:id - should update the category with admin token', async () => {
            const updatedData = { name: 'Updated Category Name', priority: 5 };
            const response = await request(app)
                .put(`/api/categories/${categoryForOps.id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(updatedData);
            expect(response.status).toBe(200);
            expect(response.body.name).toBe(updatedData.name);
            expect(response.body.priority).toBe(updatedData.priority);
        });

        it('PUT /:id - should fail without admin token', async () => {
            const response = await request(app)
                .put(`/api/categories/${categoryForOps.id}`)
                .set('Authorization', `Bearer ${normalUserToken}`)
                .send({ name: 'Update Attempt' });
            expect(response.status).toBe(403);
        });
        
         it('PUT /:id - should return 400 for invalid priority', async () => {
             const response = await request(app)
                .put(`/api/categories/${categoryForOps.id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ priority: -5 }); // Priorité invalide
            expect(response.status).toBe(400);
             expect(response.body.errors).toEqual(expect.arrayContaining([expect.objectContaining({ field: 'body.priority' })]));
        });
        
        // Test PUT avec un nom déjà existant (conflit)
        it('PUT /:id - should return 409 Conflict if name is updated to an existing one', async () => {
            // Créer une autre catégorie pour le conflit
            const conflictCat = await prisma.category.create({data: {name: "Existing Name"}});
            const response = await request(app)
                .put(`/api/categories/${categoryForOps.id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ name: conflictCat.name });
            expect(response.status).toBe(409);
            expect(response.body.message).toMatch(/already in use/i);
        });

        // Tests DELETE
        it('DELETE /:id - should fail without admin token', async () => {
            const response = await request(app)
                .delete(`/api/categories/${categoryForOps.id}`)
                .set('Authorization', `Bearer ${normalUserToken}`);
            expect(response.status).toBe(403);
        });

        it('DELETE /:id - should delete the category with admin token', async () => {
            const response = await request(app)
                .delete(`/api/categories/${categoryForOps.id}`)
                .set('Authorization', `Bearer ${adminToken}`);
            expect(response.status).toBe(204);

            // Vérifier qu'elle n'est plus récupérable
            const getResponse = await request(app).get(`/api/categories/${categoryForOps.id}`);
            expect(getResponse.status).toBe(404); 
        });

         it('DELETE /:id - should return 404 if trying to delete again', async () => {
             const response = await request(app)
                .delete(`/api/categories/${categoryForOps.id}`)
                .set('Authorization', `Bearer ${adminToken}`);
            expect(response.status).toBe(404); // Le service renvoie 404 si non trouvée
        });
    });
}); 