import React from 'react';
import { View, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { Colors } from '../constants/theme';

const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <Image 
        source={require('../assets/images/cyna-logo.png')} 
        style={styles.logo}
        resizeMode="contain"
      />
      {/* Optional: Add an activity indicator below logo */}
       {/* <ActivityIndicator size="small" color={Colors.white} style={{ marginTop: 20 }}/> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#6200EE', // Use the primary purple color
  },
  logo: {
    width: '70%', // Adjust size as needed
    height: 100, // Adjust height based on logo aspect ratio
    // Add maxWidth if needed to prevent logo becoming too large on tablets
  },
});

export default SplashScreen; 