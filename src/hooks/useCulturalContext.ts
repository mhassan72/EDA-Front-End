import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getCulturalContext, SupportedLanguage } from '../i18n';
import { CulturalContext } from '../i18n/cultural-contexts';

export const useCulturalContext = () => {
  const { i18n } = useTranslation();
  const [culturalContext, setCulturalContext] = useState<CulturalContext>(() => {
    // Try to get from localStorage first
    const stored = localStorage.getItem('culturalContext');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // Fall back to current language context
      }
    }
    return getCulturalContext(i18n.language as SupportedLanguage);
  });

  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent) => {
      const { culturalContext: newContext } = event.detail;
      setCulturalContext(newContext);
    };

    // Listen for language changes
    window.addEventListener('languageChanged', handleLanguageChange as EventListener);

    // Update context when i18n language changes
    const newContext = getCulturalContext(i18n.language as SupportedLanguage);
    setCulturalContext(newContext);
    localStorage.setItem('culturalContext', JSON.stringify(newContext));

    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange as EventListener);
    };
  }, [i18n.language]);

  // Helper functions for cultural adaptation
  const getGreeting = (timeOfDay: 'morning' | 'afternoon' | 'evening' = 'morning') => {
    const { t } = useTranslation();
    switch (timeOfDay) {
      case 'morning':
        return t('greetings.goodMorning');
      case 'afternoon':
        return t('greetings.goodAfternoon');
      case 'evening':
        return t('greetings.goodEvening');
      default:
        return t('greetings.welcome');
    }
  };

  const getEncouragement = () => {
    const { t } = useTranslation();
    const encouragements = [
      'encouragement.greatJob',
      'encouragement.keepGoing',
      'encouragement.wellDone',
      'encouragement.excellent',
      'encouragement.goodWork',
      'encouragement.youCanDoIt',
      'encouragement.learningProgress'
    ];
    
    const randomKey = encouragements[Math.floor(Math.random() * encouragements.length)];
    return t(randomKey);
  };

  const formatNumber = (num: number): string => {
    switch (culturalContext.numberFormat) {
      case 'arabic':
        return num.toLocaleString('ar');
      case 'local':
        return num.toLocaleString(i18n.language);
      default:
        return num.toLocaleString('en');
    }
  };

  const formatDate = (date: Date): string => {
    const locale = i18n.language;
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };

    switch (culturalContext.dateFormat) {
      case 'DMY':
        return date.toLocaleDateString(locale, { ...options, day: 'numeric', month: 'long', year: 'numeric' });
      case 'YMD':
        return date.toLocaleDateString(locale, { ...options, year: 'numeric', month: 'long', day: 'numeric' });
      default: // MDY
        return date.toLocaleDateString(locale, options);
    }
  };

  const formatTime = (date: Date): string => {
    const locale = i18n.language;
    return date.toLocaleTimeString(locale, {
      hour12: culturalContext.timeFormat === '12h',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return {
    culturalContext,
    getGreeting,
    getEncouragement,
    formatNumber,
    formatDate,
    formatTime,
    isRTL: i18n.dir() === 'rtl',
    currentLanguage: i18n.language as SupportedLanguage,
  };
};