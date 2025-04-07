import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization'; // Import expo-localization

// Import translation files
import en from './en.json';
import fr from './fr.json';

const resources = {
  en: {
    translation: en,
  },
  fr: {
    translation: fr,
  },
  // Add other languages here (e.g., ar for Arabic)
};

const detectedLanguage = Localization.getLocales()[0]?.languageTag || 'en'; // Get device language or default to English

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: detectedLanguage.startsWith('fr') ? 'fr' : 'en', // Use French if device language starts with fr, otherwise English
    fallbackLng: 'en', // use en if detected lng is not available

    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n; 