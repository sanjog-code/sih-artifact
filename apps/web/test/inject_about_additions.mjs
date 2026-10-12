import fs from 'fs';
import { aboutAdditionsCore } from './about_additions_core.mjs';
import { aboutAdditionsBnGuKnMl } from './about_additions_bn_gu_kn_ml.mjs';
import { aboutAdditionsOrAsUrSa } from './about_additions_or_as_ur_sa.mjs';
import { aboutAdditionsNeSdKsKok } from './about_additions_ne_sd_ks_kok.mjs';
import {
  aboutAdditions_mni,
  aboutAdditions_brx,
  aboutAdditions_mai,
  aboutAdditions_sat,
  aboutAdditions_doi,
} from './about_additions_mni_brx_mai_sat_doi.mjs';

function findClosingBrace(content, searchFrom) {
  const openBraceIdx = content.indexOf('{', searchFrom);
  if (openBraceIdx === -1) return -1;
  let depth = 0;
  let inString = false;
  let stringChar = '';
  let escape = false;

  for (let i = openBraceIdx; i < content.length; i++) {
    const ch = content[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (ch === '\\') {
      escape = true;
      continue;
    }
    if (inString) {
      if (ch === stringChar) {
        inString = false;
      }
      continue;
    }
    if (ch === '"' || ch === "'") {
      inString = true;
      stringChar = ch;
      continue;
    }
    if (ch === '{') {
      depth++;
    } else if (ch === '}') {
      depth--;
      if (depth === 0) {
        return i;
      }
    }
  }
  return -1;
}

const allAdditions = {
  ...aboutAdditionsCore,
  ...aboutAdditionsBnGuKnMl,
  ...aboutAdditionsOrAsUrSa,
  ...aboutAdditionsNeSdKsKok,
  mni: aboutAdditions_mni,
  brx: aboutAdditions_brx,
  mai: aboutAdditions_mai,
  sat: aboutAdditions_sat,
  doi: aboutAdditions_doi,
};

console.log('Loaded all additions for languages:', Object.keys(allAdditions).length);

// 1. Update src/context/LanguageContext.tsx for Core 6 languages (en, hi, pa, mr, te, ta)
const langCtxPath = 'src/context/LanguageContext.tsx';
let langCtxContent = fs.readFileSync(langCtxPath, 'utf8');

const coreLangs = ['en', 'hi', 'pa', 'mr', 'te', 'ta'];
// Iterate from last to first so that indices earlier in the file don't shift when we insert!
for (let idx = coreLangs.length - 1; idx >= 0; idx--) {
  const lang = coreLangs[idx];
  const additions = allAdditions[lang];
  if (!additions) continue;

  const langHeader = `${lang}: {`;
  const langStart = langCtxContent.indexOf(langHeader);
  if (langStart === -1) {
    console.error(`Cannot find ${langHeader} in LanguageContext`);
    continue;
  }

  const aboutStart = langCtxContent.indexOf('about: {', langStart);
  if (aboutStart === -1) {
    console.error(`Cannot find about: { after ${langStart}`);
    continue;
  }

  const closeIdx = findClosingBrace(langCtxContent, aboutStart);
  if (closeIdx === -1) {
    console.error(`Cannot find closing brace of about for ${lang}`);
    continue;
  }

  const beforeClose = langCtxContent.slice(0, closeIdx);
  const trimmedBefore = beforeClose.trimEnd();
  const needsComma = !trimmedBefore.endsWith(',');

  const linesToInsert = Object.entries(additions)
    .map(([k, v]) => `      ${k}: ${JSON.stringify(v)},`)
    .join('\n');

  const insertText = (needsComma ? ',\n' : '\n') + linesToInsert + '\n    ';

  langCtxContent =
    trimmedBefore +
    insertText +
    langCtxContent.slice(closeIdx);

  console.log(`Injected ${Object.keys(additions).length} keys into LanguageContext for ${lang}`);
}

fs.writeFileSync(langCtxPath, langCtxContent, 'utf8');
console.log('Saved LanguageContext.tsx successfully!');

// 2. Update src/context/extraTranslations.ts for 17 regional languages
const extraPath = 'src/context/extraTranslations.ts';
let extraContent = fs.readFileSync(extraPath, 'utf8');

const regionalLangs = [
  'bn', 'gu', 'kn', 'ml', 'or', 'as', 'ur', 'sa',
  'ne', 'sd', 'ks', 'kok', 'mni', 'brx', 'mai', 'sat', 'doi'
];

// Iterate backwards from doi to bn so indices don't shift
for (let idx = regionalLangs.length - 1; idx >= 0; idx--) {
  const lang = regionalLangs[idx];
  const additions = allAdditions[lang];
  if (!additions) continue;

  const langHeader = `"${lang}": {`;
  const langStart = extraContent.indexOf(langHeader);
  if (langStart === -1) {
    console.error(`Cannot find ${langHeader} in extraTranslations`);
    continue;
  }

  const aboutStart = extraContent.indexOf('"about": {', langStart);
  if (aboutStart === -1) {
    console.error(`Cannot find "about": { for ${lang} in extraTranslations`);
    continue;
  }

  const closeIdx = findClosingBrace(extraContent, aboutStart);
  if (closeIdx === -1) {
    console.error(`Cannot find closing brace of about for ${lang} in extraTranslations`);
    continue;
  }

  const beforeClose = extraContent.slice(0, closeIdx);
  const trimmedBefore = beforeClose.trimEnd();
  const needsComma = !trimmedBefore.endsWith(',');

  const linesToInsert = Object.entries(additions)
    .map(([k, v]) => `      "${k}": ${JSON.stringify(v)},`)
    .join('\n');

  const insertText = (needsComma ? ',\n' : '\n') + linesToInsert + '\n    ';

  extraContent =
    trimmedBefore +
    insertText +
    extraContent.slice(closeIdx);

  console.log(`Injected ${Object.keys(additions).length} keys into extraTranslations for ${lang}`);
}

fs.writeFileSync(extraPath, extraContent, 'utf8');
console.log('Saved extraTranslations.ts successfully!');
