import React from 'react';
import { useTranslation } from 'react-i18next';
import { supportedLanguages, SupportedLanguage, getCulturalContext } from '../../i18n';
import { Button } from './Button';

interface LanguageSelectorProps {
  className?: string;
  variant?: 'dropdown' | 'buttons' | 'compact';
  showNativeNames?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  className = '', 
  variant = 'dropdown',
  showNativeNames = true
}) => {
  const { i18n, t } = useTranslation();

  const handleLanguageChange = (languageCode: SupportedLanguage) => {
    i18n.changeLanguage(languageCode);
    
    // Apply cultural context
    const culturalContext = getCulturalContext(languageCode);
    
    // Store cultural preferences for AI interactions
    localStorage.setItem('culturalContext', JSON.stringify(culturalContext));
    
    // Dispatch custom event for other components to react to language change
    window.dispatchEvent(new CustomEvent('languageChanged', { 
      detail: { 
        language: languageCode, 
        culturalContext 
      } 
    }));
  };

  const currentLanguage = i18n.language as SupportedLanguage;
  const currentLangInfo = supportedLanguages.find(lang => lang.code === currentLanguage);

  if (variant === 'compact') {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          // Cycle through languages
          const currentIndex = supportedLanguages.findIndex(lang => lang.code === currentLanguage);
          const nextIndex = (currentIndex + 1) % supportedLanguages.length;
          handleLanguageChange(supportedLanguages[nextIndex].code);
        }}
        className={`px-2 py-1 text-sm ${className}`}
        aria-label={t('language.selectLanguage')}
      >
        {currentLangInfo?.code.toUpperCase() || 'EN'}
      </Button>
    );
  }

  if (variant === 'buttons') {
    return (
      <div className={`flex flex-wrap gap-1 ${className}`} role="radiogroup" aria-label={t('language.selectLanguage')}>
        {supportedLanguages.map((language) => (
          <Button
            key={language.code}
            variant={currentLanguage === language.code ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => handleLanguageChange(language.code)}
            className="px-2 py-1 text-xs"
            role="radio"
            aria-checked={currentLanguage === language.code}
            aria-label={`${language.name} (${language.nativeName})`}
          >
            <span className="block">
              {language.code.toUpperCase()}
            </span>
            {showNativeNames && (
              <span className="block text-xs opacity-75">
                {language.nativeName}
              </span>
            )}
          </Button>
        ))}
      </div>
    );
  }

  // Default dropdown variant
  return (
    <div className={`relative ${className}`}>
      <select
        value={currentLanguage}
        onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguage)}
        className="
          appearance-none bg-white dark:bg-neutral-800 
          border border-neutral-300 dark:border-neutral-600
          rounded-lg px-3 py-2 pr-8
          text-neutral-900 dark:text-neutral-100
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
          transition-colors duration-200
        "
        aria-label={t('language.selectLanguage')}
      >
        {supportedLanguages.map((language) => (
          <option key={language.code} value={language.code}>
            {showNativeNames ? language.nativeName : language.name}
            {showNativeNames && ` (${language.name})`}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
        <svg
          className="w-4 h-4 text-neutral-500 dark:text-neutral-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
};

export default LanguageSelector;