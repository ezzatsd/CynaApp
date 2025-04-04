import React from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Colors, Spacing, Fonts, BorderRadius } from '../constants/theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AccountStackParamList } from '../navigation/AccountNavigator';
import { useAuth } from '../context/AuthContext'; // Import useAuth

type Props = NativeStackScreenProps<AccountStackParamList, 'AccountHome'>;

const AccountScreen = ({ navigation }: Props) => {
  const { user, signOut, isLoading } = useAuth(); // Get user, signOut, and loading state

  const handleLogout = async () => {
    await signOut();
    // Navigation is handled by AccountNavigator based on user state change
  };

  if (isLoading && !user) {
     // Show loading indicator only when initially loading user state and not logged in
    return (
        <View style={styles.container}>
             <ActivityIndicator size="large" color={Colors.primary} />
        </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mon Compte</Text>
      {user ? (
        // Logged In View
        <View style={styles.loggedInContainer}>
          <Text style={styles.welcomeText}>Bonjour, {user.name || user.email}!</Text>
          {/* Use styled TouchableOpacity instead of default Button */}
          <TouchableOpacity style={styles.menuButton} onPress={() => navigation.navigate('Settings')}>
            <Text style={styles.menuButtonText}>Paramètres du compte</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuButton} onPress={() => navigation.navigate('OrderHistory')}>
            <Text style={styles.menuButtonText}>Mes commandes</Text>
          </TouchableOpacity>
          {/* Add other logged-in links like CGU etc. */} 

          <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout} disabled={isLoading}>
             <Text style={styles.buttonText}>{isLoading ? 'Déconnexion...' : 'Se déconnecter'}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // Logged Out View (This part might not be reached if AccountNavigator handles it, but good for clarity)
        <View style={styles.loggedOutContainer}>
          <Text style={styles.infoText}>Connectez-vous pour accéder à votre compte.</Text>
          <TouchableOpacity style={[styles.button, { marginBottom: Spacing.md }]} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.buttonText}>Se Connecter</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonSecondary} onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.buttonSecondaryText}>S'inscrire</Text>
          </TouchableOpacity>
        </View>
      )}
       {/* Add links for CGU, Mentions Legales, Contact etc. later, likely in a separate stack or modal or within settings */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.lg,
  },
  title: {
    fontSize: 28,
    // fontFamily: Fonts.bold,
    color: Colors.text,
    marginBottom: Spacing.xl,
  },
  loggedInContainer: {
    width: '100%',
    alignItems: 'center',
  },
  loggedOutContainer: {
     width: '100%',
     alignItems: 'center',
   },
  welcomeText: {
    fontSize: 18,
    // fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  infoText: {
      fontSize: 16,
      color: Colors.textSecondary,
      textAlign: 'center',
      marginBottom: Spacing.lg,
    },
  menuButton: {
    width: '100%',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  menuButtonText: {
    fontSize: 18,
    color: Colors.text,
    // fontFamily: Fonts.regular,
    textAlign: 'center',
  },
  button: {
      width: '100%',
      height: 50,
      backgroundColor: Colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: BorderRadius.md,
    },
    buttonText: {
      color: Colors.white,
      fontSize: 18,
      // fontFamily: Fonts.bold,
    },
    buttonSecondary: {
       width: '100%',
       height: 50,
       backgroundColor: Colors.surface,
       justifyContent: 'center',
       alignItems: 'center',
       borderRadius: BorderRadius.md,
       borderWidth: 1,
       borderColor: Colors.primary,
     },
     buttonSecondaryText: {
       color: Colors.primary,
       fontSize: 18,
       // fontFamily: Fonts.bold,
     },
  logoutButton: {
    marginTop: Spacing.xl,
    backgroundColor: Colors.error, // Use error color for logout
  },
});

export default AccountScreen; 