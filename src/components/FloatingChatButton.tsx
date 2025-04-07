import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface FloatingChatButtonProps {
  onPress: () => void;
}

const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.8}>
       <Ionicons name="chatbubble-ellipses-outline" size={28} color={Colors.white} />
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