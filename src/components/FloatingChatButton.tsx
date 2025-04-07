import React from 'react';
import { TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Colors, Spacing, BorderRadius } from '../constants/theme';
// Import icon library later
// import { Ionicons } from '@expo/vector-icons';

interface FloatingChatButtonProps {
  onPress: () => void;
}

const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.8}>
       {/* Removed comments, ensure only Text component is direct child if needed */}
       <Text style={{color: 'white', fontSize: 24}}>?</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: Spacing.lg + 60,
    right: Spacing.lg,
    width: 60,
    height: 60,
    borderRadius: 30, // Make it circular
    backgroundColor: Colors.secondary, // Or primary
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 1000, // Ensure it's above other content
  },
});

export default FloatingChatButton; 