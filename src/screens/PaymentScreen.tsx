import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Colors, Spacing, BorderRadius, Fonts } from '../constants/theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AccountStackParamList } from '../navigation/AccountNavigator';

type Props = NativeStackScreenProps<AccountStackParamList, 'Payment'>;

const PaymentScreen = ({ navigation }: Props) => {
  // Placeholder: Add payment form later (Step IX in CdC)
  return (
    <View style={styles.container}>
      <Text style={styles.placeholder}>Formulaire de saisie/sélection de carte ici...</Text>

      <TouchableOpacity 
         style={styles.buttonPrimary}
         onPress={() => Alert.alert('Achat Confirmé', 'Logique de confirmation et redirection à implémenter')} // Placeholder action
      >
          <Text style={styles.buttonTextPrimary}>Confirmer l'achat</Text>
      </TouchableOpacity>

      <TouchableOpacity 
         style={styles.buttonSecondary}
         onPress={() => navigation.goBack()} 
       >
          <Text style={styles.buttonTextSecondary}>Retour</Text>
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
    padding: Spacing.lg,
  },
  placeholder: {
      fontSize: 16,
      color: Colors.textSecondary,
      marginBottom: Spacing.xl,
      textAlign: 'center',
    },
    // Button Styles (copied from AddressScreen)
    buttonPrimary: {
        width: '100%',
        height: 50,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.md,
      },
      buttonTextPrimary: {
        color: Colors.white,
        fontSize: 18,
        // fontFamily: Fonts.bold,
      },
      buttonSecondary: {
         width: '100%',
         height: 50,
         backgroundColor: Colors.surface, // Or transparent
         justifyContent: 'center',
         alignItems: 'center',
         borderRadius: BorderRadius.md,
         borderWidth: 1,
         borderColor: Colors.textSecondary, // Use secondary color for border
       },
       buttonTextSecondary: {
         color: Colors.textSecondary, // Use secondary color for text
         fontSize: 18,
         // fontFamily: Fonts.bold,
       },
});

export default PaymentScreen; 