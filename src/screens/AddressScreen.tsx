import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Spacing, BorderRadius, Fonts } from '../constants/theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AccountStackParamList } from '../navigation/AccountNavigator';

type Props = NativeStackScreenProps<AccountStackParamList, 'Address'>;

const AddressScreen = ({ navigation }: Props) => {
  // Placeholder: Add address form later (Step IX in CdC)
  return (
    <View style={styles.container}>
      <Text style={styles.placeholder}>Formulaire d'ajout/sélection d'adresse ici...</Text>

       <TouchableOpacity 
          style={styles.buttonPrimary}
          onPress={() => navigation.navigate('Payment')} 
        >
           <Text style={styles.buttonTextPrimary}>Continuer vers le paiement</Text>
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
      },
      buttonSecondary: {
         width: '100%',
         height: 50,
         backgroundColor: Colors.surface,
         justifyContent: 'center',
         alignItems: 'center',
         borderRadius: BorderRadius.md,
         borderWidth: 1,
         borderColor: Colors.textSecondary,
       },
       buttonTextSecondary: {
         color: Colors.textSecondary,
         fontSize: 18,
       },
});

export default AddressScreen; 