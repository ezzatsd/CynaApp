import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from '../types/entities';
import { CartItem } from '../types/cart';
import { Alert } from 'react-native';

interface CartContextData {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  itemCount: number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextData | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

const STORAGE_KEY = '@CynaApp:cartItems';

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load cart from storage on mount
  useEffect(() => {
    const loadCartData = async () => {
      try {
        const storedCart = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedCart) {
          setCartItems(JSON.parse(storedCart));
        }
      } catch (e) {
        console.error('Failed to load cart data from storage', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadCartData();
  }, []);

  // Save cart to storage whenever it changes
  useEffect(() => {
     // Don't save while initially loading
    if (!isLoading) {
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems)).catch(e => {
             console.error('Failed to save cart data to storage', e);
        });
    }
  }, [cartItems, isLoading]);

  const addToCart = (product: Product, quantity: number = 1) => {
    if (!product.isAvailable) {
      Alert.alert("Indisponible", "Ce service n'est pas disponible actuellement.");
      return;
    }
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.product.id === product.id);
      if (existingItem) {
        // Increase quantity if item already exists
        return prevItems.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new item
        return [...prevItems, { product, quantity }];
      }
    });
    // Simple feedback
    // Consider using a more subtle notification system later (e.g., toast)
    Alert.alert("Ajouté au panier", `${product.name} a été ajouté à votre panier.`);
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      // Remove item if quantity is zero or less
      removeFromCart(productId);
    } else {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.product.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Calculate total price
  const cartTotal = cartItems.reduce((total, item) => {
    return total + item.product.price * item.quantity;
  }, 0);

  // Calculate total number of items
   const itemCount = cartItems.reduce((count, item) => {
     return count + item.quantity;
   }, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        itemCount,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 