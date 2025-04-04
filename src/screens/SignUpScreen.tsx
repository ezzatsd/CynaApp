import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Colors, Spacing, BorderRadius, Fonts } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AccountStackParamList } from '../navigation/AccountNavigator';

type Props = NativeStackScreenProps<AccountStackParamList, 'SignUp'>;

const SignUpScreen = ({ navigation }: Props) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signUp, isLoading } = useAuth();

  const handleSignUp = async () => {
    const success = await signUp(name, email, password);
    if (success) {
      // Alert is shown in AuthService/AuthContext
      // Navigate to login screen after successful signup prompt
      navigation.navigate('Login');
    } else {
      // Error is handled by the alert in AuthService/AuthContext
      console.log('Signup failed');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inscription</Text>
      <TextInput
        style={styles.input}
        placeholder="Nom complet"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        placeholderTextColor={Colors.textSecondary}
      />
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
        placeholder="Mot de passe (min. 8 caractères)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor={Colors.textSecondary}
      />

      {isLoading ? (
         <ActivityIndicator size="large" color={Colors.primary} style={styles.buttonSpacing}/>
      ) : (
         <TouchableOpacity style={[styles.button, styles.buttonSpacing]} onPress={handleSignUp} disabled={isLoading}>
            <Text style={styles.buttonText}>S'inscrire</Text>
         </TouchableOpacity>
      )}

       <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ marginTop: Spacing.lg }}>
         <Text style={styles.linkText}>Déjà un compte ? Se connecter</Text>
       </TouchableOpacity>
    </View>
  );
};

// Reusing styles from LoginScreen
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

export default SignUpScreen; 