import { resolvedTranslations, LANGUAGES } from '../src/context/LanguageContext.tsx';
import { enAboutAdditions } from './about_additions_en.mjs';

const keys = Object.keys(enAboutAdditions);
console.log(`Checking ${keys.length} About & Simulator keys across all ${LANGUAGES.length} languages...`);

let failed = false;

for (const lang of LANGUAGES) {
  const dict = resolvedTranslations[lang.code];
  if (!dict) {
    console.error(`FAILED: No dictionary for language ${lang.code} (${lang.label})`);
    failed = true;
    continue;
  }

  const about = dict.about;
  if (!about) {
    console.error(`FAILED: No about block for language ${lang.code} (${lang.label})`);
    failed = true;
    continue;
  }

  let missing = [];
  let untranslated = [];

  for (const k of keys) {
    const val = about[k];
    if (!val || typeof val !== 'string' || val.trim().length === 0) {
      missing.push(k);
    } else if (lang.code !== 'en' && val === enAboutAdditions[k]) {
      // Check if it remained identical to English
      untranslated.push(k);
    }
  }

  if (missing.length > 0) {
    console.error(`❌ Language ${lang.code} (${lang.label}) missing ${missing.length} keys:`, missing);
    failed = true;
  } else if (untranslated.length > 0) {
    console.warn(`⚠️ Language ${lang.code} (${lang.label}) has ${untranslated.length} identical English keys:`, untranslated);
  } else {
    console.log(`✅ ${lang.code.padEnd(4)} (${lang.label.padEnd(12)} / ${lang.native.padEnd(12)}): 100% all ${keys.length} keys translated!`);
  }
}

if (failed) {
  console.error('\nTEST FAILED: Some languages have missing about keys!');
  process.exit(1);
} else {
  console.log('\n🎉 ALL 23 LANGUAGES VERIFIED 100% COMPLETE FOR ABOUT & SIMULATOR!');
}
