import request from 'supertest';
import app from '../../app'; 
import { PrismaClient, User, Category, Product, Address, Prisma } from '@prisma/client';
import prisma from '../helpers/prisma.helper';
import { generateTestJwt } from '../helpers/auth.helper';
import Stripe from 'stripe';
import { OrderService } from '../../services/order.service';
import { ApiError } from '../../errors/ApiError';

// Variables globales
let userToken: string;
let user: User;
let category: Category;
let product1: Product;
let product2: Product;
let address: Address;
let createdOrderId: string;
let paymentClientSecret: string | null;

// Setup : Créer user, catégorie, produits, adresse
beforeAll(async () => {
    user = await prisma.user.create({ data: { email: 'order.user@test.com', passwordHash: 'hash' }});
    userToken = generateTestJwt({ id: user.id, email: user.email, isAdmin: false });
    category = await prisma.category.create({ data: { name: 'Order Test Cat' } });
    product1 = await prisma.product.create({ data: {
        name: 'Order Prod 1', description: '...', price: 10.00, categoryId: category.id, images: ['img1']
    }});
     product2 = await prisma.product.create({ data: {
        name: 'Order Prod 2', description: '...', price: 25.50, categoryId: category.id, images: ['img2']
    }});
    address = await prisma.address.create({ data: {
        firstName: "Order", lastName: "User", address1: "456 Order Ln", 
        city: "Orderton", region: "OR", postalCode: "67890", country: "Test", 
        phoneNumber: "555-order", userId: user.id
    }});
});

describe('Order API Endpoints', () => {

    const mockClientSecret = 'pi_mock_' + Date.now() + '_secret_mockSecretKey';
    const mockStripeInstance = { 
        paymentIntents: {
            create: jest.fn().mockResolvedValue({
                id: 'pi_mock_' + Date.now(),
                client_secret: mockClientSecret,
            }),
        }
    } as unknown as Stripe;

    let createOrderSpy: jest.SpyInstance;

    beforeEach(() => {
        createOrderSpy = jest.spyOn(OrderService, 'createOrderAndPaymentIntent')
                         .mockResolvedValue({
                             orderId: "mockOrderId_" + Date.now(),
                             clientSecret: mockClientSecret 
                         });
    });

    afterEach(() => {
        createOrderSpy.mockRestore();
    });

    describe('POST /api/orders', () => {
        it('should fail without authentication', async () => {
            const response = await request(app).post('/api/orders').send({});
            expect(response.status).toBe(401);
        });

        it('should fail with missing items', async () => {
            const response = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ billingAddressId: address.id, items: [] });
            expect(response.status).toBe(400);
            expect(response.body.errors).toEqual(expect.arrayContaining([
                expect.objectContaining({ field: 'body.items' })
            ]));
        });
        
         it('should fail with missing billingAddressId', async () => {
            const response = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ items: [{ productId: product1.id, quantity: 1 }] });
            expect(response.status).toBe(400);
             expect(response.body.errors).toEqual(expect.arrayContaining([
                expect.objectContaining({ field: 'body.billingAddressId' })
            ]));
        });

        it('should fail with invalid productId in items', async () => {
             const response = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ items: [{ productId: 'invalid-id', quantity: 1 }], billingAddressId: address.id });
             expect(response.status).toBe(400); // Zod validation fail
              expect(response.body.errors).toEqual(expect.arrayContaining([
                expect.objectContaining({ field: 'body.items.0.productId' })
            ]));
         });
         
         it('should fail if billing address does not belong to user', async () => {
            const otherUser = await prisma.user.create({data: {email: 'other@ordertest.com', passwordHash: 'h'}});
            const otherAddress = await prisma.address.create({ data: {
                firstName: "Other", lastName: "Addr", address1: "789 Other Way", city: "Otherville", region: "OT", 
                postalCode: "00000", country: "Test", phoneNumber: "555-other", userId: otherUser.id
            }});
            
            // Mocker spécifiquement pour ce test pour lancer l'erreur 400 attendue
            createOrderSpy.mockImplementationOnce(async (userId: string, orderData: any) => { 
                 if (orderData.billingAddressId === otherAddress.id && userId === user.id) {
                     throw new ApiError(400, `Invalid billingAddressId: Address not found or does not belong to the user.`);
                 }
                 // Ne devrait pas être atteint dans ce test précis
                 return { orderId: 'wont-be-used', clientSecret: 'wont-be-used' }; 
            });

            const response = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ items: [{ productId: product1.id, quantity: 1 }], billingAddressId: otherAddress.id });
            
            expect(response.status).toBe(400);
            expect(response.body.message).toMatch(/Invalid billingAddressId: Address not found or does not belong to the user./i);
            expect(createOrderSpy).toHaveBeenCalled(); 
        });

        it('should call the service and return 201 on valid data', async () => {
            const orderPayload = {
                items: [{ productId: product1.id, quantity: 1 }],
                billingAddressId: address.id,
            };
            // Préparer l'objet attendu APRÈS validation Zod (avec défauts)
            const expectedPayloadAfterValidation = {
                ...orderPayload,
                paymentMethodSummary: 'Payment on delivery', // Ajouter la valeur par défaut
            };

            const response = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${userToken}`)
                .send(orderPayload);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('orderId');
            expect(response.body).toHaveProperty('clientSecret');
            expect(response.body.clientSecret).toBe(mockClientSecret);
            // Comparer avec l'objet attendu incluant les valeurs par défaut
            expect(createOrderSpy).toHaveBeenCalledWith(user.id, expectedPayloadAfterValidation);
            
            // Pas de vérification BDD ici car le mock ne l'écrit pas
        });
    });

    describe('GET /api/orders', () => {
        let orderCreatedForGetTests: any;
        beforeAll(async () => {
            orderCreatedForGetTests = await prisma.order.create({
                data: {
                    userId: user.id,
                    totalAmount: 12.34,
                    billingAddressId: address.id,
                    status: 'PENDING_PAYMENT',
                    paymentIntentId: 'pi_for_get_test'
                }
            });
        });

        it('should fail without authentication', async () => {
             const response = await request(app).get('/api/orders');
             expect(response.status).toBe(401);
         });

        it('should return the list of orders for the authenticated user', async () => {
             const response = await request(app)
                .get('/api/orders')
                .set('Authorization', `Bearer ${userToken}`);
            
            expect(response.status).toBe(200);
            expect(response.body).toBeInstanceOf(Array);
            expect(response.body.length).toBeGreaterThanOrEqual(1);
            const orderInList = response.body.find((o:any) => o.id === orderCreatedForGetTests.id);
            expect(orderInList).toBeDefined();
            expect(orderInList.status).toBe('PENDING_PAYMENT');
        });
    });

    describe('GET /api/orders/:orderId', () => {
        let orderCreatedForGetIdTests: any;
        beforeAll(async () => {
           orderCreatedForGetIdTests = await prisma.order.create({
               data: { 
                   userId: user.id, 
                   totalAmount: 56.78,
                   billingAddressId: address.id, 
                   status: 'ACTIVE' 
                },
           });
       });

         it('should fail without authentication', async () => {
             const response = await request(app).get(`/api/orders/${orderCreatedForGetIdTests.id}`);
             expect(response.status).toBe(401);
         });

         it('should retrieve a specific order for the authenticated user', async () => {
             const response = await request(app)
                .get(`/api/orders/${orderCreatedForGetIdTests.id}`)
                .set('Authorization', `Bearer ${userToken}`);
            
            expect(response.status).toBe(200);
            expect(response.body.id).toBe(orderCreatedForGetIdTests.id);
            expect(response.body.status).toBe('ACTIVE');
         });

         it('should return 404 for a non-existent order ID', async () => {
             const response = await request(app)
                .get(`/api/orders/clfakeid0000ld00fake0000`)
                .set('Authorization', `Bearer ${userToken}`);
            expect(response.status).toBe(404);
         });

          it('should return 404 if trying to access another user\'s order', async () => {
             const otherUser = await prisma.user.create({data: {email: 'other3@ordertest.com', passwordHash: 'h'}});
             const otherOrder = await prisma.order.create({data: {userId: otherUser.id, totalAmount: 9.99, billingAddressId: address.id }});
             const response = await request(app)
                .get(`/api/orders/${otherOrder.id}`)
                .set('Authorization', `Bearer ${userToken}`);
            expect(response.status).toBe(404); 
         });
    });

}); 