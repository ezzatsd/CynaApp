import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AccountScreen from '../screens/AccountScreen';
import SettingsScreen from '../screens/SettingsScreen';
import OrderHistoryScreen from '../screens/OrderHistoryScreen';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import AddressScreen from '../screens/AddressScreen';
import PaymentScreen from '../screens/PaymentScreen';
import ContactScreen from '../screens/ContactScreen';
import { useAuth } from '../context/AuthContext';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import CategoryListScreen from '../screens/CategoryListScreen';
import { Category, Product } from '../types/entities';
import { Colors } from '../constants/theme';

// Define the types for the stack parameters
export type AccountStackParamList = {
  AccountHome: undefined; // No params expected for the main account screen
  Settings: undefined;
  OrderHistory: undefined;
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  Address: undefined;
  Payment: undefined;
  Contact: undefined;
  // Add other account-related screens here like ForgotPassword
};

const Stack = createNativeStackNavigator<AccountStackParamList>();

const AccountNavigator = () => {
  const { user, isLoading } = useAuth();

  // Show loading indicator or handle initial loading state if needed
  // if (isLoading) { ... }

  return (
    <Stack.Navigator 
       screenOptions={{ 
         // Show headers for checkout screens
         // We might want a different header style here
         headerShown: true, 
         headerBackTitle: 'Retour', // Default back button text
         headerStyle: { backgroundColor: Colors.surface },
         headerTintColor: Colors.text,
       }}
    >
      {user ? (
        <>
          <Stack.Screen name="AccountHome" component={AccountScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Paramètres' }} />
          <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} options={{ title: 'Mes Commandes' }} />
          <Stack.Screen name="Address" component={AddressScreen} options={{ title: 'Adresse' }} />
          <Stack.Screen name="Payment" component={PaymentScreen} options={{ title: 'Paiement' }} />
          <Stack.Screen name="Contact" component={ContactScreen} options={{ title: 'Nous Contacter' }} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: 'Mot de passe oublié' }} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AccountNavigator; 