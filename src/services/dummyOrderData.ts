import { Order, Address } from '../types/entities';

const dummyAddress1: Address = {
  id: 'addr-1',
  firstName: 'Test',
  lastName: 'User',
  address1: '123 Rue de la Sécurité',
  city: 'Paris',
  region: 'Île-de-France',
  postalCode: '75001',
  country: 'France',
  phoneNumber: '0123456789',
  isDefaultBilling: true,
};

const dummyAddress2: Address = {
  id: 'addr-2',
  firstName: 'Test',
  lastName: 'User',
  address1: '456 Avenue du Cloud',
  city: 'Lyon',
  region: 'Auvergne-Rhône-Alpes',
  postalCode: '69002',
  country: 'France',
  phoneNumber: '0987654321',
};

export const dummyOrders: Order[] = [
  {
    id: 'order-003',
    orderDate: '2024-04-01T10:00:00Z',
    userId: '123',
    items: [
      { productId: 'prod-edr-01', productName: 'Cyna EDR Pro', quantity: 1, pricePerUnit: 49.99 },
      { productId: 'prod-xdr-01', productName: 'Cyna XDR Unified', quantity: 1, pricePerUnit: 149.99 },
    ],
    totalAmount: 199.98,
    status: 'Active',
    billingAddress: dummyAddress1,
    paymentMethodSummary: 'Visa **** 1234',
  },
  {
    id: 'order-002',
    orderDate: '2024-01-15T14:30:00Z',
    userId: '123',
    items: [
      { productId: 'prod-soc-02', productName: 'Cyna Managed SOC - Premium', quantity: 1, pricePerUnit: 2499.00 },
    ],
    totalAmount: 2499.00,
    status: 'Active', // Assuming still active
    billingAddress: dummyAddress1,
    paymentMethodSummary: 'Visa **** 1234',
  },
  {
     id: 'order-001',
     orderDate: '2023-11-20T09:05:00Z',
     userId: '123',
     items: [
       { productId: 'prod-edr-02', productName: 'Cyna EDR Enterprise', quantity: 1, pricePerUnit: 99.99 },
     ],
     totalAmount: 99.99,
     status: 'Completed', // Assume previous period completed
     billingAddress: dummyAddress2, // Used a different address
     paymentMethodSummary: 'Mastercard **** 5678',
   },
]; 