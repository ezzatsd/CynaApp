import { Platform } from 'react-native';

export const Colors = {
  primary: '#6200EE', // Deeper Purple
  primaryVariant: '#3700B3', // Darker Purple
  secondary: '#03DAC6', // Teal Accent
  secondaryVariant: '#018786', // Darker Teal
  background: '#FFFFFF',
  surface: '#FFFFFF',
  card: '#F8F9FA', // Slightly off-white for cards
  text: '#212529',
  textSecondary: '#6C757D',
  textOnPrimary: '#FFFFFF',
  textOnSecondary: '#000000',
  error: '#B00020', // Material Error Red
  success: '#28A745', // Keep existing green
  border: '#E0E0E0', // Lighter border
  disabled: '#BDBDBD', // Lighter disabled state
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0, 0, 0, 0.4)', // Overlay for images
  lightGrey: '#F5F5F5', // For backgrounds like inputs
};

export const Fonts = {
  regular: Platform.OS === 'ios' ? 'System' : 'sans-serif', 
  medium: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium', // Added medium
  bold: Platform.OS === 'ios' ? 'System' : 'sans-serif', // Use system bold variations
  // For actual bold on Android use fontFamily: 'sans-serif', fontWeight: 'bold'
  // Or preferably, load custom fonts (e.g., Inter-Regular, Inter-Bold)
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 16,
  full: 999,
}; 