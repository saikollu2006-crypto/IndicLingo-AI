import { SupportedLanguage, LanguageCode } from '../types';

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    script: 'Latin',
    fontFamily: 'Inter, sans-serif',
    sampleGlyphs: ['A', 'B', 'Ω', 'AI', 'Z', '∞', 'L', 'i'],
    description: 'Global standard for international scientific and digital communication.',
    voiceCode: 'en-US',
  },
  {
    code: 'kn',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    script: 'Kannada',
    fontFamily: 'Noto Sans Kannada, sans-serif',
    sampleGlyphs: ['ಅ', 'ಕ', 'ಲ', 'ಥ', 'ರ', 'ಜ್ಞ', 'ಶ', 'ಹ', 'ಓ', 'ಭ'],
    description: 'Classical Dravidian language of Karnataka with distinct rounded circular script geometry.',
    voiceCode: 'kn-IN',
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    script: 'Devanagari',
    fontFamily: 'Noto Sans Devanagari, sans-serif',
    sampleGlyphs: ['अ', 'क', 'सं', 'ज्ञ', 'म', 'ह', 'त्र', 'ॐ', 'भ', 'द'],
    description: 'Widely spoken Indo-Aryan language characterized by the horizontal shirorekha head-stroke.',
    voiceCode: 'hi-IN',
  },
  {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    script: 'Telugu',
    fontFamily: 'Noto Sans Telugu, sans-serif',
    sampleGlyphs: ['అ', 'క', 'త', 'ధ', 'శ', 'క్ష', 'ఱ', 'మ', 'గ', 'ఓ'],
    description: 'Known as the Italian of the East for its rhythmic, vowel-ending euphonic word structures.',
    voiceCode: 'te-IN',
  },
  {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    script: 'Tamil',
    fontFamily: 'Noto Sans Tamil, sans-serif',
    sampleGlyphs: ['அ', 'க', 'த', 'ழ', 'வ', 'ஞ', 'ண', 'ய', 'ர', 'ஔ'],
    description: 'Ancient classical language with thousands of years of recorded literature and phonetic precision.',
    voiceCode: 'ta-IN',
  },
  {
    code: 'ml',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    script: 'Malayalam',
    fontFamily: 'Noto Sans Malayalam, sans-serif',
    sampleGlyphs: ['അ', 'ക', 'ത', 'ഴ', 'ണ', 'മ', 'ശ്ര', 'ജ്ഞ', 'റ', 'എ'],
    description: 'Rich Dravidian script with intricate loops, fluid curves, and vast phonetic repertoire.',
    voiceCode: 'ml-IN',
  },
];

export const getLanguageByCode = (code: LanguageCode): SupportedLanguage => {
  return SUPPORTED_LANGUAGES.find((lang) => lang.code === code) || SUPPORTED_LANGUAGES[0];
};

/**
 * All prominent Indian and English glyphs for the cosmic 3D particle universe.
 * Derived directly from the cosmic reference aesthetic.
 */
export const COSMIC_GLYPHS = [
  // Centerpiece and prominent glyphs
  { char: 'ಅ', lang: 'kn', weight: 'bold' },
  { char: 'ಕ', lang: 'kn', weight: 'normal' },
  { char: 'ಜ್ಞ', lang: 'kn', weight: 'bold' },
  { char: 'ಲ', lang: 'kn', weight: 'normal' },
  { char: 'ಥ', lang: 'kn', weight: 'normal' },
  { char: 'अ', lang: 'hi', weight: 'bold' },
  { char: 'सं', lang: 'hi', weight: 'normal' },
  { char: 'क', lang: 'hi', weight: 'bold' },
  { char: 'ज्ञ', lang: 'hi', weight: 'normal' },
  { char: 'ॐ', lang: 'hi', weight: 'bold' },
  { char: 'అ', lang: 'te', weight: 'bold' },
  { char: 'క', lang: 'te', weight: 'normal' },
  { char: 'త', lang: 'te', weight: 'normal' },
  { char: 'ధ', lang: 'te', weight: 'bold' },
  { char: 'క్ష', lang: 'te', weight: 'normal' },
  { char: 'அ', lang: 'ta', weight: 'bold' },
  { char: 'க', lang: 'ta', weight: 'normal' },
  { char: 'ழ', lang: 'ta', weight: 'bold' },
  { char: 'த', lang: 'ta', weight: 'normal' },
  { char: 'வ', lang: 'ta', weight: 'normal' },
  { char: 'അ', lang: 'ml', weight: 'bold' },
  { char: 'ക', lang: 'ml', weight: 'normal' },
  { char: 'ഴ', lang: 'ml', weight: 'bold' },
  { char: 'ത', lang: 'ml', weight: 'normal' },
  { char: 'ജ്ഞ', lang: 'ml', weight: 'bold' },
  { char: 'AI', lang: 'en', weight: 'bold' },
  { char: 'A', lang: 'en', weight: 'bold' },
  { char: 'Ω', lang: 'en', weight: 'normal' },
  { char: '3', lang: 'en', weight: 'bold' },
  { char: 'B', lang: 'en', weight: 'bold' },
  { char: 'कನ್ನಡ', lang: 'kn', weight: 'bold' },
  { char: 'हिन्दी', lang: 'hi', weight: 'bold' },
  { char: 'తెలుగు', lang: 'te', weight: 'bold' },
  { char: 'தமிழ்', lang: 'ta', weight: 'bold' },
  { char: 'മലയാളം', lang: 'ml', weight: 'bold' },
  { char: 'IndicLingo', lang: 'en', weight: 'bold' },
];
