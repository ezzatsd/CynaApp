import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors, Spacing, BorderRadius } from '../constants/theme';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'ar', label: 'العربية' },
];

const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const selectedLanguageCode = i18n.language;

  const setLanguage = (code: string) => {
    // Check if RTL needs update and inform user about potential restart
    const currentIsRTL = i18n.language === 'ar';
    const newIsRTL = code === 'ar';
    if (currentIsRTL !== newIsRTL) {
      Alert.alert(
        "Rechargement requis",
        "Un redémarrage de l'application peut être nécessaire pour appliquer complètement les changements de direction d'affichage.",
        [{ text: "OK" }]
      );
    }
    return i18n.changeLanguage(code);
  };

  return (
    <View style={styles.container}>
      {LANGUAGES.map((language) => {
        const selected = language.code === selectedLanguageCode;
        return (
          <TouchableOpacity
            key={language.code}
            style={[styles.button, selected && styles.selectedButton]}
            disabled={selected}
            onPress={() => setLanguage(language.code)}
          >
            <Text style={[styles.text, selected && styles.selectedText]}>
              {language.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  button: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  selectedButton: {
    backgroundColor: Colors.primary + '20', // Light primary background
  },
  text: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  selectedText: {
    color: Colors.primary,
    // fontFamily: Fonts.bold, // Make selected bold
  },
});

export default LanguageSelector; 