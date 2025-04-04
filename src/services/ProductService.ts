import { Category, Product } from '../types/entities';
import { dummyCategories, dummyProducts } from './dummyData';

// Simulate async API calls
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getCategories = async (): Promise<Category[]> => {
  await delay(300); // Simulate network delay
  // Sort categories by priority for home screen display
  return [...dummyCategories].sort((a, b) => a.priority - b.priority);
};

export const getCategoryById = async (categoryId: string): Promise<Category | undefined> => {
    await delay(100);
    return dummyCategories.find(cat => cat.id === categoryId);
}

export const getProductsByCategory = async (categoryId: string): Promise<Product[]> => {
  await delay(500);
  const products = dummyProducts.filter(product => product.categoryId === categoryId);

  // Sort products: Priority > Available > Unavailable
  return products.sort((a, b) => {
    // Prioritize available products over unavailable ones
    if (a.isAvailable !== b.isAvailable) {
      return a.isAvailable ? -1 : 1;
    }
    // If availability is the same, sort by priorityInCategory
    // Lower priority number means higher priority
    if (a.priorityInCategory !== b.priorityInCategory) {
      return a.priorityInCategory - b.priorityInCategory;
    }
    // If priority is also the same, maintain original order or sort by name
    return a.name.localeCompare(b.name);
  });
};

export const getTopProducts = async (): Promise<Product[]> => {
  await delay(400);
  return dummyProducts.filter(product => product.isTopProduct && product.isAvailable);
  // Note: In a real app, the backend would likely handle selecting top products
};

export const getProductById = async (productId: string): Promise<Product | undefined> => {
  await delay(200);
  return dummyProducts.find(product => product.id === productId);
};

// Add functions for search later (getProductsBySearchCriteria) 