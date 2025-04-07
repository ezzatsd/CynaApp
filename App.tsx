import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Modal, StyleSheet, View } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import MainTabNavigator from './src/navigation/MainTabNavigator';
import FloatingChatButton from './src/components/FloatingChatButton';
import ChatScreen from './src/screens/ChatScreen';
import { Colors } from './src/constants/theme';
import { I18nextProvider } from 'react-i18next';
import i18n, { updateLayoutDirection } from './src/i18n';
import SplashScreen from './src/screens/SplashScreen';

export default function App() {
  const [isChatModalVisible, setIsChatModalVisible] = useState(false);
  const [isAppReady, setIsAppReady] = useState(false);

  const openChatModal = () => setIsChatModalVisible(true);
  const closeChatModal = () => setIsChatModalVisible(false);

  useEffect(() => {
    updateLayoutDirection(i18n.language);

    const timer = setTimeout(() => {
      setIsAppReady(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (!isAppReady) {
    return <SplashScreen />;
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <CartProvider>
          <I18nextProvider i18n={i18n}>
            <NavigationContainer>
              <MainTabNavigator />
            </NavigationContainer>
            <FloatingChatButton onPress={openChatModal} />
            <Modal
              visible={isChatModalVisible}
              animationType="slide"
              transparent={false}
              onRequestClose={closeChatModal}
            >
              <SafeAreaView style={styles.modalContainer}>
                <ChatScreen closeModal={closeChatModal} />
              </SafeAreaView>
            </Modal>
          </I18nextProvider>
        </CartProvider>
      </AuthProvider>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
}); 