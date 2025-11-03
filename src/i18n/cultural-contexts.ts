import { SupportedLanguage } from './index';

export interface CulturalContext {
  region: string;
  greetingStyle: 'formal' | 'casual' | 'respectful';
  educationalApproach: 'direct' | 'storytelling' | 'collaborative' | 'hierarchical';
  exampleTypes: string[];
  communicationStyle: 'direct' | 'indirect' | 'contextual';
  encouragementStyle: 'individual' | 'community' | 'achievement' | 'effort';
  timeFormat: '12h' | '24h';
  dateFormat: 'MDY' | 'DMY' | 'YMD';
  numberFormat: 'western' | 'arabic' | 'local';
}

export const culturalContexts: Record<SupportedLanguage, CulturalContext> = {
  en: {
    region: 'Global',
    greetingStyle: 'casual',
    educationalApproach: 'direct',
    exampleTypes: ['technology', 'business', 'science', 'daily life'],
    communicationStyle: 'direct',
    encouragementStyle: 'individual',
    timeFormat: '12h',
    dateFormat: 'MDY',
    numberFormat: 'western',
  },
  sw: {
    region: 'East Africa',
    greetingStyle: 'respectful',
    educationalApproach: 'storytelling',
    exampleTypes: ['community', 'agriculture', 'trade', 'family', 'nature'],
    communicationStyle: 'contextual',
    encouragementStyle: 'community',
    timeFormat: '24h',
    dateFormat: 'DMY',
    numberFormat: 'western',
  },
  ar: {
    region: 'Middle East & North Africa',
    greetingStyle: 'formal',
    educationalApproach: 'hierarchical',
    exampleTypes: ['history', 'literature', 'mathematics', 'philosophy', 'family'],
    communicationStyle: 'indirect',
    encouragementStyle: 'achievement',
    timeFormat: '12h',
    dateFormat: 'DMY',
    numberFormat: 'arabic',
  },
  fr: {
    region: 'West & Central Africa',
    greetingStyle: 'formal',
    educationalApproach: 'direct',
    exampleTypes: ['literature', 'arts', 'philosophy', 'cuisine', 'culture'],
    communicationStyle: 'direct',
    encouragementStyle: 'individual',
    timeFormat: '24h',
    dateFormat: 'DMY',
    numberFormat: 'western',
  },
  ha: {
    region: 'West Africa',
    greetingStyle: 'respectful',
    educationalApproach: 'collaborative',
    exampleTypes: ['trade', 'community', 'agriculture', 'crafts', 'oral tradition'],
    communicationStyle: 'contextual',
    encouragementStyle: 'community',
    timeFormat: '12h',
    dateFormat: 'DMY',
    numberFormat: 'western',
  },
  yo: {
    region: 'West Africa',
    greetingStyle: 'respectful',
    educationalApproach: 'storytelling',
    exampleTypes: ['proverbs', 'community', 'arts', 'music', 'family traditions'],
    communicationStyle: 'indirect',
    encouragementStyle: 'community',
    timeFormat: '12h',
    dateFormat: 'DMY',
    numberFormat: 'western',
  },
  om: {
    region: 'Horn of Africa',
    greetingStyle: 'respectful',
    educationalApproach: 'collaborative',
    exampleTypes: ['pastoralism', 'community', 'oral tradition', 'nature', 'family'],
    communicationStyle: 'contextual',
    encouragementStyle: 'community',
    timeFormat: '12h',
    dateFormat: 'DMY',
    numberFormat: 'western',
  },
  so: {
    region: 'Horn of Africa',
    greetingStyle: 'respectful',
    educationalApproach: 'storytelling',
    exampleTypes: ['poetry', 'trade', 'nomadic life', 'community', 'oral tradition'],
    communicationStyle: 'indirect',
    encouragementStyle: 'community',
    timeFormat: '12h',
    dateFormat: 'DMY',
    numberFormat: 'western',
  },
  ig: {
    region: 'West Africa',
    greetingStyle: 'respectful',
    educationalApproach: 'collaborative',
    exampleTypes: ['community', 'trade', 'crafts', 'family', 'traditional governance'],
    communicationStyle: 'contextual',
    encouragementStyle: 'community',
    timeFormat: '12h',
    dateFormat: 'DMY',
    numberFormat: 'western',
  },
  am: {
    region: 'Horn of Africa',
    greetingStyle: 'formal',
    educationalApproach: 'hierarchical',
    exampleTypes: ['history', 'religion', 'literature', 'agriculture', 'family'],
    communicationStyle: 'indirect',
    encouragementStyle: 'achievement',
    timeFormat: '12h',
    dateFormat: 'DMY',
    numberFormat: 'western',
  },
};