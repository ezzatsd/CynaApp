import request from 'supertest';
import app from '../../app'; 
import { PrismaClient, Category } from '@prisma/client';
import { generateTestJwt } from '../helpers/auth.helper'; // Notre helper pour les tokens

const prisma = new PrismaClient();

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

     // --- Tests Admin (POST, PUT, DELETE) --- 
     describe('Admin Operations', () => {

        it('POST /api/products - should fail without admin token', async () => {
            const response = await request(app)
                .post('/api/products')
                .set('Authorization', `Bearer ${normalUserToken}`)
                .send(productData);
            expect(response.status).toBe(403);
        });

        it('POST /api/products - should fail without any token', async () => {
            const response = await request(app)
                .post('/api/products')
                .send(productData);
            expect(response.status).toBe(401);
        });

        it('POST /api/products - should create a product with admin token', async () => {
            const response = await request(app)
                .post('/api/products')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(productData);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body.name).toBe(productData.name);
            expect(response.body.description).toBe(productData.description);
            expect(response.body.categoryId).toBe(productData.categoryId);
            // Prisma retourne les Decimal comme string par défaut via JSON
            expect(response.body.price).toBe(productData.price.toString()); 
            expect(response.body.images).toEqual(productData.images);
            expect(response.body.features).toEqual(productData.features);
            createdProductId = response.body.id;
        });

        it('POST /api/products - should fail with non-existent categoryId', async () => {
             const invalidData = { ...productData, categoryId: 'nonexistent-cat-id' };
             const response = await request(app)
                 .post('/api/products')
                 .set('Authorization', `Bearer ${adminToken}`)
                 .send(invalidData);
             expect(response.status).toBe(400); // Le service doit vérifier l'existence de la catégorie
             expect(response.body.message).toMatch(/Invalid categoryId/i);
         });

         it('POST /api/products - should fail with missing name', async () => {
             const { name, ...invalidData } = productData;
             const response = await request(app)
                 .post('/api/products')
                 .set('Authorization', `Bearer ${adminToken}`)
                 .send(invalidData);
             expect(response.status).toBe(400);
             expect(response.body.errors).toEqual(expect.arrayContaining([expect.objectContaining({ field: 'body.name' })]));
         });
         
        // Ajouter tests pour prix invalide, images invalides etc.

        // --- Tests sur le produit créé --- 
        describe('Operations on created product', () => {
             beforeAll(() => {
                 if (!createdProductId) {
                     throw new Error('Cannot run product operation tests because createdProductId is not set.');
                 }
             });

            it('GET /api/products/:id - should retrieve the created product', async () => {
                const response = await request(app).get(`/api/products/${createdProductId}`);
                expect(response.status).toBe(200);
                expect(response.body.id).toBe(createdProductId);
                expect(response.body.name).toBe(productData.name);
            });

            // Ajouter des tests pour GET /api/products avec filtres (categoryId, search, price)

            it('PUT /api/products/:id - should update the product with admin token', async () => {
                const updatedData = { name: 'Updated Product Name', price: 120.50 };
                const response = await request(app)
                    .put(`/api/products/${createdProductId}`)
                    .set('Authorization', `Bearer ${adminToken}`)
                    .send(updatedData);
                expect(response.status).toBe(200);
                expect(response.body.name).toBe(updatedData.name);
                 expect(response.body.price).toBe(updatedData.price.toString());
            });

            it('PUT /api/products/:id - should fail without admin token', async () => {
                const response = await request(app)
                    .put(`/api/products/${createdProductId}`)
                    .set('Authorization', `Bearer ${normalUserToken}`)
                    .send({ name: 'Update Attempt' });
                expect(response.status).toBe(403);
            });
            
            // Ajouter tests validation PUT

            it('DELETE /api/products/:id - should fail without admin token', async () => {
                 const response = await request(app)
                    .delete(`/api/products/${createdProductId}`)
                    .set('Authorization', `Bearer ${normalUserToken}`);
                 expect(response.status).toBe(403);
            });

            it('DELETE /api/products/:id - should delete the product with admin token', async () => {
                 const response = await request(app)
                    .delete(`/api/products/${createdProductId}`)
                    .set('Authorization', `Bearer ${adminToken}`);
                 expect(response.status).toBe(204);

                 const getResponse = await request(app).get(`/api/products/${createdProductId}`);
                 expect(getResponse.status).toBe(404);
            });

             it('GET /api/products/:id - should return 404 after deletion', async () => {
                 const response = await request(app).get(`/api/products/${createdProductId}`);
                 expect(response.status).toBe(404);
             });
        });
    });
}); 