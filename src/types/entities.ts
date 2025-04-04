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