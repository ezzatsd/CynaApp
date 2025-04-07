import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Colors, Spacing, BorderRadius, Fonts } from '../constants/theme';

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
       style={styles.container}
       keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0} // Adjust offset if needed
     >
      {/* Header */}
      <View style={styles.header}>
         <Text style={styles.headerTitle}>Assistance Cyna</Text>
         <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
           <Text style={styles.closeButtonText}>Fermer</Text>
         </TouchableOpacity>
       </View>

      {/* Message List */}
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messageList}
        contentContainerStyle={{ paddingVertical: Spacing.md }}
        inverted // Show latest messages at the bottom
      />

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Tapez votre message..."
          placeholderTextColor={Colors.textSecondary}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          {/* Replace with Send icon later */}
          <Text style={styles.sendButtonText}>Envoyer</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    // Removed padding to allow KeyboardAvoidingView to manage it
  },
  header: {
     flexDirection: 'row',
     justifyContent: 'space-between',
     alignItems: 'center',
     paddingVertical: Spacing.md,
     paddingHorizontal: Spacing.lg,
     backgroundColor: Colors.surface,
     borderBottomWidth: 1,
     borderBottomColor: Colors.border,
   },
   headerTitle: {
     fontSize: 18,
     // fontFamily: Fonts.bold,
     color: Colors.text,
   },
   closeButton: {
      padding: Spacing.sm,
    },
    closeButtonText: {
      fontSize: 16,
      color: Colors.primary,
      // fontFamily: Fonts.regular,
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
    maxWidth: '80%', // Prevent bubbles from taking full width
  },
  userBubble: {
    backgroundColor: Colors.primary,
    alignSelf: 'flex-end',
    borderBottomRightRadius: BorderRadius.sm, // Different corner for user
  },
  botBubble: {
    backgroundColor: Colors.surface,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: Colors.border,
    borderBottomLeftRadius: BorderRadius.sm, // Different corner for bot
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
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BorderRadius.full,
  },
  sendButtonText: {
    color: Colors.white,
    fontSize: 16,
    // fontFamily: Fonts.bold,
  },
});

export default ChatScreen; 