import { describe, it, expect, beforeEach, vi } from 'vitest';
import i18n, { supportedLanguages, getCulturalContext, isRTL } from '../index';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock document
Object.defineProperty(document, 'documentElement', {
  value: {
    dir: 'ltr',
    lang: 'en',
    classList: {
      add: vi.fn(),
      remove: vi.fn(),
    },
  },
  writable: true,
});

describe('i18n Configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset i18n to English
    i18n.changeLanguage('en');
  });

  it('has correct supported languages', () => {
    expect(supportedLanguages).toHaveLength(10);
    
    const languageCodes = supportedLanguages.map(lang => lang.code);
    expect(languageCodes).toEqual([
      'en', 'sw', 'ar', 'fr', 'ha', 'yo', 'om', 'so', 'ig', 'am'
    ]);
  });

  it('identifies RTL languages correctly', () => {
    expect(isRTL('ar')).toBe(true);
    expect(isRTL('en')).toBe(false);
    expect(isRTL('sw')).toBe(false);
    expect(isRTL('fr')).toBe(false);
  });

  it('provides cultural context for each language', () => {
    const englishContext = getCulturalContext('en');
    expect(englishContext).toHaveProperty('region');
    expect(englishContext).toHaveProperty('greetingStyle');
    expect(englishContext).toHaveProperty('educationalApproach');
    expect(englishContext).toHaveProperty('exampleTypes');
    expect(englishContext).toHaveProperty('communicationStyle');

    const swahiliContext = getCulturalContext('sw');
    expect(swahiliContext.region).toBe('East Africa');
    expect(swahiliContext.greetingStyle).toBe('respectful');
    expect(swahiliContext.educationalApproach).toBe('storytelling');

    const arabicContext = getCulturalContext('ar');
    expect(arabicContext.region).toBe('Middle East & North Africa');
    expect(arabicContext.greetingStyle).toBe('formal');
    expect(arabicContext.educationalApproach).toBe('hierarchical');
  });

  it('falls back to English context for unknown languages', () => {
    const unknownContext = getCulturalContext('unknown' as any);
    const englishContext = getCulturalContext('en');
    expect(unknownContext).toEqual(englishContext);
  });

  it('changes language successfully', async () => {
    await i18n.changeLanguage('sw');
    expect(i18n.language).toBe('sw');
    
    await i18n.changeLanguage('ar');
    expect(i18n.language).toBe('ar');
  });

  it('loads translations for different languages', async () => {
    await i18n.changeLanguage('en');
    expect(i18n.t('common.loading')).toBe('Loading...');
    expect(i18n.t('greetings.welcome')).toBe('Welcome!');

    await i18n.changeLanguage('sw');
    expect(i18n.t('common.loading')).toBe('Inapakia...');
    expect(i18n.t('greetings.welcome')).toBe('Karibu!');

    await i18n.changeLanguage('ar');
    expect(i18n.t('common.loading')).toBe('جاري التحميل...');
    expect(i18n.t('greetings.welcome')).toBe('أهلاً وسهلاً!');

    await i18n.changeLanguage('fr');
    expect(i18n.t('common.loading')).toBe('Chargement...');
    expect(i18n.t('greetings.welcome')).toBe('Bienvenue !');
  });

  it('handles interpolation correctly', async () => {
    await i18n.changeLanguage('en');
    expect(i18n.t('education.score', { score: 8, total: 10 })).toBe('Score: 8/10');
    expect(i18n.t('imageGeneration.costEstimate', { cost: 5 })).toBe('Estimated cost: 5 credits');

    await i18n.changeLanguage('sw');
    expect(i18n.t('education.score', { score: 8, total: 10 })).toBe('Alama: 8/10');
    expect(i18n.t('imageGeneration.costEstimate', { cost: 5 })).toBe('Gharama inayokadiriwa: mikopo 5');
  });

  it('falls back to English for missing translations', async () => {
    await i18n.changeLanguage('ha'); // Has limited translations
    
    // Should fall back to English for missing keys
    const translation = i18n.t('some.missing.key', { defaultValue: 'Default Value' });
    expect(translation).toBe('Default Value');
  });

  it('updates document attributes on language change', async () => {
    const mockDocumentElement = {
      dir: 'ltr',
      lang: 'en',
      classList: {
        add: vi.fn(),
        remove: vi.fn(),
      },
    };
    
    Object.defineProperty(document, 'documentElement', {
      value: mockDocumentElement,
      writable: true,
    });

    // Change to Arabic (RTL)
    await i18n.changeLanguage('ar');
    
    expect(mockDocumentElement.dir).toBe('rtl');
    expect(mockDocumentElement.lang).toBe('ar');
    expect(mockDocumentElement.classList.add).toHaveBeenCalledWith('rtl');

    // Change back to English (LTR)
    await i18n.changeLanguage('en');
    
    expect(mockDocumentElement.dir).toBe('ltr');
    expect(mockDocumentElement.lang).toBe('en');
    expect(mockDocumentElement.classList.remove).toHaveBeenCalledWith('rtl');
  });
});