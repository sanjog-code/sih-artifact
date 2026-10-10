import fs from 'node:fs';
import { ROUTES } from './env.mjs';

export const REQUIRED_LANGUAGES = ['en', 'hi', 'pa', 'mr', 'te', 'ta'];

export const REQUIRED_SECTIONS = [
  'nav',
  'hero',
  'advisory',
  'market',
  'architecture',
  'comparison',
  'about',
  'footer',
  'modal',
  'farmer',
  'buyer',
  'logistics',
];

export function auditLanguageContext() {
  if (!fs.existsSync(ROUTES.languageContext)) {
    return { exists: false, error: 'LanguageContext.tsx not found' };
  }

  const content = fs.readFileSync(ROUTES.languageContext, 'utf8');

  // Verify all 6 languages are declared in LANGUAGES constant
  const registeredLanguages = [];
  for (const lang of REQUIRED_LANGUAGES) {
    if (content.includes(`code: '${lang}'`) || content.includes(`code: "${lang}"`)) {
      registeredLanguages.push(lang);
    }
  }

  // Verify each dictionary block exists in translations
  const foundDictionaries = [];
  for (const lang of REQUIRED_LANGUAGES) {
    const hasDict = new RegExp(`\\b${lang}:\\s*\\{`).test(content);
    if (hasDict) {
      foundDictionaries.push(lang);
    }
  }

  // Check section occurrences across dictionary blocks
  const sectionReport = {};
  for (const sec of REQUIRED_SECTIONS) {
    // Count how many times section key appears as an object property
    const matches = (content.match(new RegExp(`\\b${sec}:\\s*\\{`, 'g')) || []).length;
    sectionReport[sec] = matches;
  }

  // Check deep fallback implementation
  const hasFallbackLogic =
    content.includes('translations.en') &&
    (content.includes('currentDict') || content.includes('deepMerge') || content.includes('||') || content.includes('fallback'));

  return {
    exists: true,
    registeredLanguages,
    foundDictionaries,
    allLanguagesPresent: registeredLanguages.length === 6 && foundDictionaries.length === 6,
    sectionReport,
    hasFallbackLogic,
    fileSizeBytes: Buffer.byteLength(content, 'utf8'),
  };
}

/**
 * Simulates deep fallback key lookup
 */
export function simulateDeepLookup(dict, fallbackDict, pathArray) {
  let curr = dict;
  let fb = fallbackDict;

  for (const key of pathArray) {
    if (curr && typeof curr === 'object' && key in curr) {
      curr = curr[key];
    } else {
      curr = undefined;
    }

    if (fb && typeof fb === 'object' && key in fb) {
      fb = fb[key];
    } else {
      fb = undefined;
    }
  }

  return curr !== undefined ? curr : fb;
}
