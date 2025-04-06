export interface Category {
    id: string;
    name: string;
    image: string; // URL or local asset identifier
    description: string;
    priority: number; // For sorting on home screen
  }
  
  export interface Product {
    id: string;
    name: string;
    description: string;
    categoryId: string;
    images: string[]; // URLs or local asset identifiers for carousel
    price: number; // Assuming a base price, could be more complex (monthly/annual)
    isAvailable: boolean; // Replaces stock concept for SaaS
    isTopProduct: boolean; // To feature on home screen
    priorityInCategory: number; // For sorting within category page
    features?: string[]; // Optional list of technical features
    // Add other fields as needed: pricingModel (monthly/annual), trialAvailable, etc.
  }

export interface Address {
  id: string;
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  region: string; // State/Province/Region
  postalCode: string;
  country: string;
  phoneNumber: string;
  isDefaultBilling?: boolean;
  // isDefaultShipping?: boolean; // If shipping applies later
}

export interface PaymentMethod {
  id: string;
  type: 'card'; // Expand later if needed (PayPal, etc.)
  last4: string;
  brand: string; // e.g., "Visa", "Mastercard"
  expMonth: number;
  expYear: number;
  isDefault?: boolean;
}

export interface OrderItem {
    productId: string;
    productName: string; // Store name at time of order
    quantity: number;
    pricePerUnit: number; // Store price at time of order
  }
  
export interface Order {
  id: string;
  orderDate: string; // ISO Date string (e.g., "2024-04-05T10:30:00Z")
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'Completed' | 'Processing' | 'Cancelled' | 'Active'; // Example statuses
  billingAddress: Address; // Store snapshot of address used
  paymentMethodSummary: string; // e.g., "Visa ending in 1234"
} 