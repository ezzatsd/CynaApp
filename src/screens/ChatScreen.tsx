import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { Colors, Spacing, BorderRadius, Fonts } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

interface ChatScreenProps {
  closeModal: () => void; // Function to close the modal
}

const ChatScreen: React.FC<ChatScreenProps> = ({ closeModal }) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Bonjour ! Comment puis-je vous aider aujourd\'hui ?', sender: 'bot' },
  ]);
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
    };

    // Add user message and simulate bot response
    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // Simulate bot thinking and responding
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: `Je suis un chatbot simulé. Je ne peux pas encore traiter \"${userMessage.text}\". Contactez le support via le formulaire pour une aide réelle.`,
        sender: 'bot',
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.messageBubble, item.sender === 'user' ? styles.userBubble : styles.botBubble]}>
      <Text style={item.sender === 'user' ? styles.userText : styles.botText}>{item.text}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView 
       behavior={Platform.OS === "ios" ? "padding" : "height"} 
       style={[styles.container, { paddingTop: Platform.OS === 'ios' ? Spacing.lg : StatusBar.currentHeight }]}
       keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0} 
     >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Assistance Cyna</Text>
        <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>Fermer</Text>
        </TouchableOpacity>
      </View>

      {/* Message List and Input Area remain inside KAV */}
       <FlatList
         data={messages}
         renderItem={renderMessage}
         keyExtractor={(item) => item.id}
         style={styles.messageList}
         contentContainerStyle={{ paddingVertical: Spacing.md }}
         inverted 
       />
       <View style={styles.inputContainer}>
         <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Tapez votre message..."
            placeholderTextColor={Colors.textSecondary}
         />
         <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Ionicons name="send" size={20} color={Colors.white} />
         </TouchableOpacity>
       </View>
     </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background, 
  },
  header: {
     flexDirection: 'row',
     justifyContent: 'space-between',
     alignItems: 'center',
     paddingVertical: Spacing.sm,
     paddingHorizontal: Spacing.md,
   },
  headerTitle: {
    fontSize: 18,
    color: Colors.text,
  },
  closeButton: {
    padding: Spacing.sm,
  },
  closeButtonText: {
    fontSize: 16,
    color: Colors.primary,
  },
  messageList: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  messageBubble: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    maxWidth: '80%',
  },
  userBubble: {
    backgroundColor: Colors.primary,
    alignSelf: 'flex-end',
    borderBottomRightRadius: BorderRadius.sm,
  },
  botBubble: {
    backgroundColor: Colors.surface,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: Colors.border,
    borderBottomLeftRadius: BorderRadius.sm,
  },
  userText: {
    color: Colors.white,
    fontSize: 15,
  },
  botText: {
    color: Colors.text,
    fontSize: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  input: {
    flex: 1,
    minHeight: 45,
    maxHeight: 100,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 16,
    color: Colors.text,
    marginRight: Spacing.sm,
  },
  sendButton: {
    height: 45,
    width: 45,
    paddingHorizontal: 0,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BorderRadius.full,
  },
});

export default ChatScreen; 