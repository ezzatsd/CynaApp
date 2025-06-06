import request from 'supertest';
import app from '../../app'; 
import { PrismaClient, Category } from '@prisma/client';
import { generateTestJwt } from '../helpers/auth.helper'; // Notre helper pour les tokens
import prisma from '../helpers/prisma.helper'; // Importer l'instance partagée

// Variables globales pour les tests
let adminToken: string;
let normalUserToken: string;
let testCategory: Category;
let adminUserId: string;

// Setup : Créer utilisateurs et catégorie avant les tests produits
beforeAll(async () => {
    // Créer Admin & Token
    const adminUser = await prisma.user.create({
        data: {
            email: 'admin.product@test.com',
            passwordHash: 'hashedpassword',
            isAdmin: true,
            name: 'Admin Product Tester',
        },
    });
    adminUserId = adminUser.id; // Sauvegarder l'ID admin si besoin
    adminToken = generateTestJwt({ id: adminUser.id, email: adminUser.email, isAdmin: adminUser.isAdmin });

    // Créer User Normal & Token
    const normalUser = await prisma.user.create({
        data: {
            email: 'normal.product@test.com',
            passwordHash: 'hashedpassword',
            isAdmin: false,
            name: 'Normal Product Tester',
        },
    });
    normalUserToken = generateTestJwt({ id: normalUser.id, email: normalUser.email, isAdmin: normalUser.isAdmin });

    // Créer une Catégorie de test
    testCategory = await prisma.category.create({
        data: {
            name: 'Category For Products',
            description: 'A category to assign products to during testing',
        },
    });
});

describe('Product API Endpoints', () => {

    let createdProductId: string;
    const productData = {
        name: 'Test Product 1',
        description: 'Description for test product 1',
        images: ['http://example.com/product1.jpg'],
        price: 99.99,
        categoryId: "", // Sera défini avec testCategory.id
        features: ['Feature A', 'Feature B'],
        isAvailable: true,
        isTopProduct: false,
        priorityInCategory: 5,
    };

    // Assigner le vrai categoryId avant les tests qui l'utilisent
    beforeAll(() => {
        productData.categoryId = testCategory.id;
    });

    // --- Tests Publics (GET) --- 
    describe('GET /api/products', () => {
        it('should return an empty list of products initially', async () => {
            const response = await request(app).get('/api/products');
            expect(response.status).toBe(200);
            expect(response.body.data).toBeInstanceOf(Array);
            expect(response.body.data.length).toBe(0);
            expect(response.body).toHaveProperty('meta');
        });
        // Ajouter des tests pour pagination/filtres ici après création
    });

    // --- Tests Admin (POST Permissions & Validation) --- 
    describe('POST /api/products (Permissions & Validation)', () => {
        // Test permissions
        it('should fail without admin token', async () => {
            const response = await request(app)
                .post('/api/products')
                .set('Authorization', `Bearer ${normalUserToken}`)
                .send(productData);
            expect(response.status).toBe(403);
        });
        it('should fail without any token', async () => {
            const response = await request(app)
                .post('/api/products')
                .send(productData);
            expect(response.status).toBe(401);
        });

        // Test validation
        it('should fail with non-existent categoryId', async () => {
             const invalidData = { ...productData, categoryId: 'nonexistent-cat-id' };
             const response = await request(app)
                 .post('/api/products')
                 .set('Authorization', `Bearer ${adminToken}`)
                 .send(invalidData);
             expect(response.status).toBe(400);
             expect(response.body.errors).toEqual(expect.arrayContaining([
                 expect.objectContaining({ field: 'body.categoryId', message: 'Invalid category ID format' })
             ]));
         });
         it('should fail with missing name', async () => {
             const { name, ...invalidData } = productData;
             const response = await request(app)
                 .post('/api/products')
                 .set('Authorization', `Bearer ${adminToken}`)
                 .send(invalidData);
             expect(response.status).toBe(400);
             expect(response.body.errors).toEqual(expect.arrayContaining([expect.objectContaining({ field: 'body.name' })]));
         });
        // Ajouter d'autres tests de validation POST ici...
    });

    // --- Tests sur un produit spécifique (GET by ID, PUT, DELETE) ---
    describe('Operations on a specific product (GET /:id, PUT /:id, DELETE /:id)', () => {
        let specificProductId: string;

        // Créer le produit nécessaire pour ces tests
        beforeAll(async () => {
            const response = await request(app)
                .post('/api/products')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(productData); // Utiliser productData défini plus haut
            
            if (response.status !== 201) {
                 console.error("Failed to create product in beforeAll:", response.body);
                 throw new Error(`Setup failed: Could not create product for testing. Status: ${response.status}`);
            }
            specificProductId = response.body.id;
        });

        it('GET /api/products/:id - should retrieve the created product', async () => {
            const response = await request(app).get(`/api/products/${specificProductId}`);
            expect(response.status).toBe(200);
            expect(response.body.id).toBe(specificProductId);
            expect(response.body.name).toBe(productData.name);
        });

        it('PUT /api/products/:id - should update the product with admin token', async () => {
            const updatedData = { name: 'Updated Product Name', price: 120.50 };
            const response = await request(app)
                .put(`/api/products/${specificProductId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(updatedData);
            expect(response.status).toBe(200);
            expect(response.body.name).toBe(updatedData.name);
            expect(response.body.price).toBe(updatedData.price.toString());
        });

        it('PUT /api/products/:id - should fail without admin token', async () => {
            const response = await request(app)
                .put(`/api/products/${specificProductId}`)
                .set('Authorization', `Bearer ${normalUserToken}`)
                .send({ name: 'Update Attempt' });
            expect(response.status).toBe(403);
        });
        
        // Ajouter tests validation PUT

        it('DELETE /api/products/:id - should fail without admin token', async () => {
            const response = await request(app)
                .delete(`/api/products/${specificProductId}`)
                .set('Authorization', `Bearer ${normalUserToken}`);
            expect(response.status).toBe(403);
        });

        it('DELETE /api/products/:id - should delete the product with admin token', async () => {
            const response = await request(app)
                .delete(`/api/products/${specificProductId}`)
                .set('Authorization', `Bearer ${adminToken}`);
            expect(response.status).toBe(204);

            // Vérifier qu'il n'est plus récupérable
            const getResponse = await request(app).get(`/api/products/${specificProductId}`);
            expect(getResponse.status).toBe(404);
        });

        it('GET /api/products/:id - should return 404 after deletion', async () => {
            const response = await request(app).get(`/api/products/${specificProductId}`);
            expect(response.status).toBe(404);
        });
    });

    // Ajouter des tests pour GET /api/products avec filtres/pagination ici

}); 