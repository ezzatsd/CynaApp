import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing } from '../constants/theme';

const SettingsScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Paramètres</Text>
      {/* Placeholder for Personal Info, Addresses, Payment Methods sections */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.md,
  },
  title: {
    fontSize: 24,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
});

export default SettingsScreen; 