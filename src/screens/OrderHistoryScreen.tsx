import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing } from '../constants/theme';

const OrderHistoryScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mes Commandes</Text>
      {/* Placeholder for Order List by Year, Filters */}
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

export default OrderHistoryScreen; 