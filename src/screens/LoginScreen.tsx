import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Colors, Spacing, BorderRadius, Fonts } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AccountStackParamList } from '../navigation/AccountNavigator';

// Define props type including navigation
type Props = NativeStackScreenProps<AccountStackParamList, 'Login'>;

const LoginScreen = ({ navigation }: Props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, isLoading } = useAuth(); // Get signIn function and loading state from context

  const handleLogin = async () => {
    const success = await signIn(email, password);
    if (success) {
      // Navigation back or to home is handled by the navigator logic listening to auth state
      // Potentially navigate back if login was shown modally, or rely on state change
      console.log('Login successful, state updated');
      // navigation.navigate('AccountHome'); // Or let the navigator handle the redirect
    } else {
      // Error is handled by the alert in AuthService/AuthContext
      console.log('Login failed');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connexion</Text>
      <TextInput
        style={styles.input}
        placeholder="Adresse e-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor={Colors.textSecondary}
      />
      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor={Colors.textSecondary}
      />

      {isLoading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={styles.buttonSpacing} />
      ) : (
        <TouchableOpacity style={[styles.button, styles.buttonSpacing]} onPress={handleLogin} disabled={isLoading}>
           <Text style={styles.buttonText}>Se connecter</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
        <Text style={styles.linkText}>Mot de passe oublié ?</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('SignUp')} style={{ marginTop: Spacing.md }}>
         <Text style={styles.linkText}>Pas encore de compte ? S'inscrire</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.lg, // Increased padding
  },
  title: {
    fontSize: 28,
    // fontFamily: Fonts.bold,
    color: Colors.text,
    marginBottom: Spacing.xl,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    fontSize: 16,
    // fontFamily: Fonts.regular,
    color: Colors.text,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
  },
   buttonSpacing: {
     marginTop: Spacing.md,
   },
  buttonText: {
    color: Colors.white,
    fontSize: 18,
    // fontFamily: Fonts.bold,
  },
  linkText: {
    color: Colors.primary,
    marginTop: Spacing.lg,
    fontSize: 16,
    // fontFamily: Fonts.regular,
  },
});

export default LoginScreen; 