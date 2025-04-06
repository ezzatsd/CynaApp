import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Colors, Spacing, BorderRadius, Fonts } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AccountStackParamList } from '../navigation/AccountNavigator';

type Props = NativeStackScreenProps<AccountStackParamList, 'Settings'>;

const SettingsScreen = ({ navigation }: Props) => {
  const { user } = useAuth(); // Get current user info

  // States for editable fields (initialize with user data)
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  // Add states for password change if implementing that form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSaveChanges = () => {
    // TODO: Implement logic to save changes (call API)
    // - Validate inputs (passwords match, complexity)
    // - Call AuthService functions (updateProfile, changePassword)
    Alert.alert("Modifications", "Logique d'enregistrement à implémenter.");
    // Optionally navigate back or show success message
  };

  const handleAddAddress = () => {
    // TODO: Navigate to a new screen/modal for adding addresses
    Alert.alert("Ajout Adresse", "Navigation vers formulaire d'adresse à implémenter.");
  };

  const handleAddPaymentMethod = () => {
     // TODO: Navigate to a new screen/modal for adding payment methods
     Alert.alert("Ajout Paiement", "Navigation vers formulaire de paiement à implémenter.");
   };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.sectionTitle}>Informations personnelles</Text>
      <View style={styles.card}>
         <Text style={styles.label}>Nom complet</Text>
         <TextInput
           style={styles.input}
           value={name}
           onChangeText={setName}
           placeholder="Votre nom complet"
           placeholderTextColor={Colors.textSecondary}
         />
         <Text style={styles.label}>Adresse e-mail</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Votre adresse e-mail"
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor={Colors.textSecondary}
            // Make email potentially read-only or require verification on change
            // editable={false} 
          />
      </View>

      <Text style={styles.sectionTitle}>Changer le mot de passe</Text>
       <View style={styles.card}>
         <Text style={styles.label}>Mot de passe actuel</Text>
         <TextInput
           style={styles.input}
           value={currentPassword}
           onChangeText={setCurrentPassword}
           placeholder="Entrez votre mot de passe actuel"
           secureTextEntry
           placeholderTextColor={Colors.textSecondary}
         />
         <Text style={styles.label}>Nouveau mot de passe</Text>
          <TextInput
            style={styles.input}
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Minimum 8 caractères"
            secureTextEntry
            placeholderTextColor={Colors.textSecondary}
          />
          <Text style={styles.label}>Confirmer le nouveau mot de passe</Text>
           <TextInput
             style={styles.input}
             value={confirmPassword}
             onChangeText={setConfirmPassword}
             placeholder="Retapez le nouveau mot de passe"
             secureTextEntry
             placeholderTextColor={Colors.textSecondary}
           />
       </View>

      <Text style={styles.sectionTitle}>Carnet d'adresses</Text>
      <View style={styles.card}>
          <Text style={styles.placeholderText}>Liste des adresses enregistrées ici...</Text>
          {/* TODO: Add FlatList to display saved addresses */}
          <TouchableOpacity style={styles.addButton} onPress={handleAddAddress}>
              <Text style={styles.addButtonText}>+ Ajouter une nouvelle adresse</Text>
          </TouchableOpacity>
       </View>

      <Text style={styles.sectionTitle}>Méthodes de paiement</Text>
       <View style={styles.card}>
           <Text style={styles.placeholderText}>Liste des méthodes de paiement enregistrées ici...</Text>
           {/* TODO: Add FlatList to display saved payment methods */}
           <TouchableOpacity style={styles.addButton} onPress={handleAddPaymentMethod}>
               <Text style={styles.addButtonText}>+ Ajouter une méthode de paiement</Text>
           </TouchableOpacity>
        </View>
        
       {/* TODO: Add section for managing subscriptions */}

      <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
        <Text style={styles.saveButtonText}>Enregistrer les modifications</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
      padding: Spacing.md,
      paddingBottom: Spacing.xl, // Extra space at bottom
    },
  sectionTitle: {
    fontSize: 18,
    // fontFamily: Fonts.bold,
    color: Colors.text,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  card: {
      backgroundColor: Colors.surface,
      borderRadius: BorderRadius.md,
      padding: Spacing.md,
      marginBottom: Spacing.md,
      borderWidth: 1,
      borderColor: Colors.border,
    },
  label: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    // fontFamily: Fonts.regular,
  },
  input: {
    width: '100%',
    height: 45,
    backgroundColor: Colors.white, // Input background within card
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    fontSize: 16,
    color: Colors.text,
  },
  placeholderText: {
      fontSize: 14,
      color: Colors.textSecondary,
      textAlign: 'center',
      marginVertical: Spacing.md,
    },
  addButton: {
      marginTop: Spacing.md,
      paddingVertical: Spacing.sm,
      alignItems: 'center',
    },
    addButtonText: {
      color: Colors.primary,
      fontSize: 16,
      // fontFamily: Fonts.bold,
    },
  saveButton: {
    marginTop: Spacing.xl,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 18,
    // fontFamily: Fonts.bold,
  },
});

export default SettingsScreen; 