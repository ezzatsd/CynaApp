import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigatorScreenParams } from '@react-navigation/native'; // Import this
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import CartScreen from '../screens/CartScreen';
import AccountNavigator, { AccountStackParamList } from './AccountNavigator'; // Import ParamList
import CategoryStackNavigator, { CategoryStackParamList } from './CategoryStackNavigator'; // Import the new stack
import { Colors } from '../constants/theme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; // Import icons
import { useCart } from '../context/CartContext'; // To show cart badge
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
  const { itemCount } = useCart(); // Get item count for badge

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({ // Access route prop for icons
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarShowLabel: false, // Hide labels, rely on icons
        headerShown: true,
        headerStyle: {
            backgroundColor: Colors.surface,
        },
        headerTitleStyle: {
            // fontFamily: Fonts.bold
        },
        headerTintColor: Colors.text,
         tabBarIcon: ({ focused, color, size }) => { // Define tabBarIcon here
           let iconName: any;
           const iconSize = focused ? size + 2 : size; // Slightly larger when focused

           if (route.name === 'Home') {
             iconName = focused ? 'home' : 'home-outline';
             return <Ionicons name={iconName} size={iconSize} color={color} />;
           } else if (route.name === 'Categories') {
             iconName = focused ? 'apps' : 'apps-outline';
              return <Ionicons name={iconName} size={iconSize} color={color} />;
           } else if (route.name === 'Search') {
             iconName = focused ? 'search' : 'search-outline';
              return <Ionicons name={iconName} size={iconSize} color={color} />;
           } else if (route.name === 'Cart') {
             iconName = focused ? 'cart' : 'cart-outline';
              return <Ionicons name={iconName} size={iconSize} color={color} />;
           } else if (route.name === 'Account') {
             iconName = focused ? 'person-circle' : 'person-circle-outline';
              return <Ionicons name={iconName} size={iconSize} color={color} />;
           }
         },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Accueil',
          // tabBarIcon is now defined in screenOptions
        }}
      />
      <Tab.Screen
        name="Categories"
        component={CategoryStackNavigator}
        options={{
          title: 'Catégories',
          headerShown: false,
          // tabBarIcon defined in screenOptions
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          title: 'Recherche',
          // tabBarIcon defined in screenOptions
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          title: 'Panier',
          tabBarBadge: itemCount > 0 ? itemCount : undefined, // Show badge if items > 0
          // tabBarIcon defined in screenOptions
        }}
      />
      <Tab.Screen
        name="Account"
        component={AccountNavigator}
        options={{
          title: 'Compte',
          headerShown: false,
          // tabBarIcon defined in screenOptions
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator; 