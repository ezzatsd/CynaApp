import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Colors, Spacing, BorderRadius, Fonts } from '../constants/theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AccountStackParamList } from '../navigation/AccountNavigator'; // Assuming it will be in Account stack

type Props = NativeStackScreenProps<AccountStackParamList, 'Contact'>;

const ContactScreen = ({ navigation }: Props) => {
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // To disable button during fake submission

  const validateEmail = (text: string) => {
    // Simple regex for basic email validation
    let reg = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    return reg.test(text);
  };

  const handleSubmit = () => {
    if (!email || !subject || !message) {
      Alert.alert("Champs requis", "Veuillez remplir tous les champs.");
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert("Email invalide", "Veuillez entrer une adresse e-mail valide.");
      return;
    }

    setIsSubmitting(true);
    // Simulate sending message
    console.log("Submitting contact form:", { email, subject, message });
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert("Message envoyé", "Merci de nous avoir contactés. Nous reviendrons vers vous bientôt.");
      // Optionally clear form or navigate back
      setEmail('');
      setSubject('');
      setMessage('');
      // navigation.goBack();
    }, 1500);
  };

  const handleChatbotPress = () => {
     Alert.alert("Chatbot", "Le chatbot interactif sera bientôt disponible ici !");
     // Later: Open a modal or navigate to a dedicated chatbot screen
   };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Title handled by navigator options */}
      <Text style={styles.infoText}>Besoin d'aide ou une question ? Utilisez le formulaire ci-dessous ou contactez-nous via notre chatbot.</Text>

      {/* Contact Form */}
      <View style={styles.formContainer}>
        <Text style={styles.label}>Votre adresse e-mail</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="email@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor={Colors.textSecondary}
        />

        <Text style={styles.label}>Sujet</Text>
         <TextInput
           style={styles.input}
           value={subject}
           onChangeText={setSubject}
           placeholder="ex: Question sur l'abonnement EDR Pro"
           placeholderTextColor={Colors.textSecondary}
         />

        <Text style={styles.label}>Votre message</Text>
         <TextInput
           style={[styles.input, styles.textArea]}
           value={message}
           onChangeText={setMessage}
           placeholder="Écrivez votre message ici..."
           multiline
           numberOfLines={4}
           placeholderTextColor={Colors.textSecondary}
         />

        <TouchableOpacity 
            style={[styles.button, styles.submitButton]} 
            onPress={handleSubmit}
            disabled={isSubmitting}
        >
          <Text style={styles.buttonText}>{isSubmitting ? 'Envoi en cours...' : 'Envoyer le message'}</Text>
        </TouchableOpacity>
      </View>

       {/* Chatbot Button Separator */}
       <View style={styles.separatorContainer}>
           <View style={styles.separatorLine} />
           <Text style={styles.separatorText}>OU</Text>
           <View style={styles.separatorLine} />
         </View>

      {/* Chatbot Button */}
      <TouchableOpacity 
        style={[styles.button, styles.chatbotButton]} 
        onPress={handleChatbotPress}
      >
         {/* Add Chat icon later */}
        <Text style={styles.buttonText}>Contact Me (Chatbot)</Text>
      </TouchableOpacity>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
   contentContainer: {
      padding: Spacing.lg,
    },
  infoText: {
      fontSize: 16,
      color: Colors.textSecondary,
      textAlign: 'center',
      marginBottom: Spacing.xl,
    },
  formContainer: {
      marginBottom: Spacing.xl,
    },
  label: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    // fontFamily: Fonts.regular,
  },
  input: {
    width: '100%',
    minHeight: 45,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm, // Adjust vertical padding for multiline
    marginBottom: Spacing.md,
    fontSize: 16,
    color: Colors.text,
  },
  textArea: {
     height: 120, // Fixed height for multiline
     textAlignVertical: 'top', // Start text at the top for multiline
   },
   button: {
      width: '100%',
      height: 50,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: BorderRadius.md,
      marginTop: Spacing.md,
    },
    buttonText: {
      color: Colors.white,
      fontSize: 18,
      // fontFamily: Fonts.bold,
    },
    submitButton: {
      backgroundColor: Colors.primary,
    },
    chatbotButton: {
       backgroundColor: Colors.secondary, // Use a different color for chatbot
       // Or maybe a more subtle outline style
     },
    separatorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: Spacing.lg,
      },
      separatorLine: {
        flex: 1,
        height: 1,
        backgroundColor: Colors.border,
      },
      separatorText: {
        marginHorizontal: Spacing.md,
        color: Colors.textSecondary,
        fontSize: 14,
        // fontFamily: Fonts.bold,
      },
});

export default ContactScreen; 