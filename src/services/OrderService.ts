import { Order } from '../types/entities';
import { dummyOrders } from './dummyOrderData';
import { useAuth } from '../context/AuthContext'; // Import useAuth potentially if orders are user-specific

// Simulate async API calls
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// In a real app, you'd pass userId or token here
export const getOrderHistory = async (userId: string | undefined): Promise<Order[]> => {
  await delay(700); // Simulate network delay

  if (!userId) {
     return []; // No orders if no user ID
  }

  // Filter dummy orders by userId (even though they all have '123' for now)
  const userOrders = dummyOrders.filter(order => order.userId === userId);
  
  // Sort orders by date descending (most recent first)
  return userOrders.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
};

export const getOrderDetails = async (orderId: string, userId: string | undefined): Promise<Order | undefined> => {
    await delay(300);
    if (!userId) return undefined;
    // Find the specific order for the user
    return dummyOrders.find(order => order.id === orderId && order.userId === userId);
};

// Function to simulate downloading a PDF invoice (replace with actual logic)
export const downloadInvoice = async (orderId: string): Promise<boolean> => {
   console.log(`Simulating download for invoice of order: ${orderId}`);
   await delay(1000);
   // In a real app, this would trigger a file download or open a PDF viewer
   // Return true for success simulation
   return true;
 }; 