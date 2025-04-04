import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import * as AuthService from '../services/AuthService'; // Assuming AuthService exports login, signup, logout
import AsyncStorage from '@react-native-async-storage/async-storage'; // To persist login state

// Define the User type (can be shared in types/index.ts later)
interface User {
  id: string;
  name: string;
  email: string;
}

// Define the shape of the context data
interface AuthContextData {
  user: User | null;
  isLoading: boolean; // To handle loading state during async operations
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (name: string, email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextData | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Create the provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true to check storage

  // Check async storage on initial load
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('userData');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error('Failed to load user data from storage', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadUserData();
  }, []);

  const handleSignIn = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const loggedInUser = await AuthService.login(email, password);
      if (loggedInUser) {
        setUser(loggedInUser);
        await AsyncStorage.setItem('userData', JSON.stringify(loggedInUser));
        setIsLoading(false);
        return true;
      } else {
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const handleSignUp = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // The dummy signup service shows an alert and doesn't auto-login
      // In a real app, you might auto-login or require verification
      const signedUpUser = await AuthService.signUp(name, email, password);
      // For this simulation, we don't automatically log the user in after signup
      // setUser(signedUpUser); // If auto-login
      // await AsyncStorage.setItem('userData', JSON.stringify(signedUpUser)); // If auto-login
      setIsLoading(false);
      return !!signedUpUser; // Return true if signup simulation was successful (returned a user)
    } catch (error) {
      console.error('Sign up error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await AuthService.logout();
      setUser(null);
      await AsyncStorage.removeItem('userData');
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signIn: handleSignIn,
        signUp: handleSignUp,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Create a custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 