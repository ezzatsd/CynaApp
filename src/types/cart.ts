import { Product } from './entities';

export interface CartItem {
  product: Product;
  quantity: number;
  // Add selected options like subscription duration later if needed
} 