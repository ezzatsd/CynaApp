import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CategoryDetailScreen from '../screens/CategoryDetailScreen'; // Renamed from CategoryScreen
import ProductDetailScreen from '../screens/ProductDetailScreen';
import CategoryListScreen from '../screens/CategoryListScreen'; // Import the new list screen
import { Category, Product } from '../types/entities'; // Import types if needed for params

// Define the ParamList for this stack
export type CategoryStackParamList = {
  CategoryList: undefined; // Add the list screen here
  CategoryDetail: { categoryId: string }; // Expect a categoryId param
  ProductDetail: { productId: string }; // Expect a productId param
};

const Stack = createNativeStackNavigator<CategoryStackParamList>();

const CategoryStackNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="CategoryList" // Set the initial route
      screenOptions={{ 
         // You might want to share header styles or hide header depending on design
         // Example: customize header background and tint color
         // headerStyle: { backgroundColor: Colors.surface },
         // headerTintColor: Colors.text,
      }}
    >
       <Stack.Screen 
         name="CategoryList" 
         component={CategoryListScreen} 
         options={{ title: 'Toutes les catégories' }} // Set title for the list screen
       />
       <Stack.Screen 
         name="CategoryDetail" 
         component={CategoryDetailScreen} 
         options={({ route }) => ({ title: route.params?.categoryId ? `Catégorie` : 'Détails' })} // Dynamic title later
       />
       <Stack.Screen 
         name="ProductDetail" 
         component={ProductDetailScreen} 
         options={({ route }) => ({ title: route.params?.productId ? `Produit` : 'Détails'})} // Dynamic title later
       />
    </Stack.Navigator>
  );
};

export default CategoryStackNavigator; 