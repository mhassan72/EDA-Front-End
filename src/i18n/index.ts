import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enTranslations from './locales/en.json';
import swTranslations from './locales/sw.json';
import arTranslations from './locales/ar.json';
import frTranslations from './locales/fr.json';
import haTranslations from './locales/ha.json';
import yoTranslations from './locales/yo.json';
import omTranslations from './locales/om.json';
import soTranslations from './locales/so.json';
import igTranslations from './locales/ig.json';
import amTranslations from './locales/am.json';

// Cultural context data
import { culturalContexts } from './cultural-contexts';

export const supportedLanguages = [
  { code: 'en', name: 'English', nativeName: 'English', rtl: false },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', rtl: false },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', rtl: true },
  { code: 'fr', name: 'French', nativeName: 'Français', rtl: false },
  { code: 'ha', name: 'Hausa', nativeName: 'Hausa', rtl: false },
  { code: 'yo', name: 'Yoruba', nativeName: 'Yorùbá', rtl: false },
  { code: 'om', name: 'Oromo', nativeName: 'Afaan Oromoo', rtl: false },
  { code: 'so', name: 'Somali', nativeName: 'Soomaali', rtl: false },
  { code: 'ig', name: 'Igbo', nativeName: 'Igbo', rtl: false },
  { code: 'am', name: 'Amharic', nativeName: 'አማርኛ', rtl: false },
] as const;

export type SupportedLanguage = typeof supportedLanguages[number]['code'];

// Get cultural context for a language
export const getCulturalContext = (language: SupportedLanguage) => {
  return culturalContexts[language] || culturalContexts.en;
};

// Check if language is RTL
export const isRTL = (language: SupportedLanguage): boolean => {
  const lang = supportedLanguages.find(l => l.code === language);
  return lang?.rtl || false;
};

const resources = {
  en: { translation: enTranslations },
  sw: { translation: swTranslations },
  ar: { translation: arTranslations },
  fr: { translation: frTranslations },
  ha: { translation: haTranslations },
  yo: { translation: yoTranslations },
  om: { translation: omTranslations },
  so: { translation: soTranslations },
  ig: { translation: igTranslations },
  am: { translation: amTranslations },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    // Language detection options
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    // Support for pluralization and context
    pluralSeparator: '_',
    contextSeparator: '_',
    
    // Namespace configuration
    defaultNS: 'translation',
    ns: ['translation'],
  });

// Apply RTL styles when language changes
i18n.on('languageChanged', (lng: string) => {
  const isRtl = isRTL(lng as SupportedLanguage);
  document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
  document.documentElement.lang = lng;
  
  // Add/remove RTL class for Tailwind
  if (isRtl) {
    document.documentElement.classList.add('rtl');
  } else {
    document.documentElement.classList.remove('rtl');
  }
});

export default i18n;