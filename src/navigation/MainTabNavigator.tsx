import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigatorScreenParams } from '@react-navigation/native'; // Import this
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import CartScreen from '../screens/CartScreen';
import AccountNavigator, { AccountStackParamList } from './AccountNavigator'; // Import ParamList
import CategoryStackNavigator, { CategoryStackParamList } from './CategoryStackNavigator'; // Import the new stack
import { Colors } from '../constants/theme';
// import TabBarIcon from './TabBarIcon'; // Placeholder for icons

// Define Param List for Tabs
export type MainTabParamList = {
  Home: undefined;
  // Specify that Categories tab contains a stack navigator with its own params
  Categories: NavigatorScreenParams<CategoryStackParamList> | undefined;
  Search: undefined;
  Cart: undefined;
  // Specify that Account tab contains a stack navigator with its own params
  Account: NavigatorScreenParams<AccountStackParamList> | undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        // tabBarShowLabel: false, // Optionally hide labels if using icons only
        headerShown: true, // Show headers for screens initially
        headerStyle: {
            backgroundColor: Colors.surface,
        },
        headerTitleStyle: {
            // fontFamily: Fonts.bold // Add when fonts are set up
        },
        headerTintColor: Colors.text,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Accueil',
          // tabBarIcon: ({ color, size }) => (
          //   <TabBarIcon name="home-outline" color={color} size={size} />
          // ),
        }}
      />
      <Tab.Screen
        name="Categories"
        component={CategoryStackNavigator} // Use the Stack Navigator here
        options={{
          title: 'Catégories',
          headerShown: false, // Hide Tab header, Stack header will be used
          // tabBarIcon: ({ color, size }) => (
          //   <TabBarIcon name="grid-outline" color={color} size={size} />
          // ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          title: 'Recherche',
          // tabBarIcon: ({ color, size }) => (
          //   <TabBarIcon name="search-outline" color={color} size={size} />
          // ),
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          title: 'Panier',
          // tabBarBadge: 3, // Example badge
          // tabBarIcon: ({ color, size }) => (
          //   <TabBarIcon name="cart-outline" color={color} size={size} />
          // ),
        }}
      />
      <Tab.Screen
        name="Account"
        component={AccountNavigator}
        options={{
          title: 'Compte',
          headerShown: false,
          // tabBarIcon: ({ color, size }) => (
          //   <TabBarIcon name="person-outline" color={color} size={size} />
          // ),
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator; 