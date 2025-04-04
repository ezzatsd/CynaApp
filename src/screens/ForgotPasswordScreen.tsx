import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Colors, Spacing, BorderRadius, Fonts } from '../constants/theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AccountStackParamList } from '../navigation/AccountNavigator';
import * as AuthService from '../services/AuthService'; // Import the dummy service

type Props = NativeStackScreenProps<AccountStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen = ({ navigation }: Props) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordReset = async () => {
    if (!email) {
      Alert.alert('Erreur', 'Veuillez entrer votre adresse e-mail.');
      return;
    }
    setIsLoading(true);
    await AuthService.forgotPassword(email); // Call the dummy service
    setIsLoading(false);
    // Alert is shown inside the service, we can navigate back or show another confirmation
    // navigation.goBack(); // Optionally go back after submission
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mot de passe oublié</Text>
      <Text style={styles.subtitle}>Entrez votre email pour recevoir un lien de réinitialisation.</Text>
      <TextInput
        style={styles.input}
        placeholder="Adresse e-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor={Colors.textSecondary}
      />
      {isLoading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={styles.buttonSpacing} />
      ) : (
        <TouchableOpacity style={[styles.button, styles.buttonSpacing]} onPress={handlePasswordReset} disabled={isLoading}>
          <Text style={styles.buttonText}>Envoyer le lien</Text>
        </TouchableOpacity>
      )}
       <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: Spacing.lg }}>
         <Text style={styles.linkText}>Retour à la connexion</Text>
       </TouchableOpacity>
    </View>
  );
};

// Reusing styles from LoginScreen where applicable, adjust as needed
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
    marginBottom: Spacing.md,
  },
   subtitle: {
       fontSize: 16,
       // fontFamily: Fonts.regular,
       color: Colors.textSecondary,
       textAlign: 'center',
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
    fontSize: 16,
    // fontFamily: Fonts.regular,
  },
});

export default ForgotPasswordScreen; 