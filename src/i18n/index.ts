import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import { I18nManager } from 'react-native'; // Import I18nManager

// Import translation files
import en from './en.json';
import fr from './fr.json';
import ar from './ar.json'; // Import Arabic

const resources = {
  en: {
    translation: en,
  },
  fr: {
    translation: fr,
  },
  ar: { // Add Arabic resource
    translation: ar,
  },
};

// Export the function so it can be called from App.tsx
export const updateLayoutDirection = (language: string) => {
  const isRTL = language === 'ar';
  I18nManager.forceRTL(isRTL);
  I18nManager.allowRTL(isRTL);
  // Important: On native platforms, a reload of the app might be required for RTL changes to take full effect.
  // You might need to prompt the user to restart the app after changing to/from Arabic.
  // For Expo Go, changes might apply more readily, but a production build often needs a restart.
  console.log(`Setting RTL to: ${isRTL} for language: ${language}`);
  // Consider using expo-updates to trigger a reload if needed: Updates.reloadAsync();
};

const detectedLanguage = Localization.getLocales()[0]?.languageTag || 'en';
let initialLanguage = 'en';
if (detectedLanguage.startsWith('fr')) {
  initialLanguage = 'fr';
} else if (detectedLanguage.startsWith('ar')) {
  initialLanguage = 'ar';
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLanguage, // Use the determined initial language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

// Update layout direction when language changes
i18n.on('languageChanged', (lng) => {
  updateLayoutDirection(lng);
});

export default i18n; 