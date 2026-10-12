import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const extraPath = path.resolve(__dirname, '../src/context/extraTranslations.ts');
const content = fs.readFileSync(extraPath, 'utf8');

const langs = [
  'bn', 'gu', 'kn', 'ml', 'or', 'as',
  'ur', 'sa', 'ne', 'sd', 'ks', 'kok',
  'mni', 'brx', 'mai', 'sat', 'doi'
];

for (let i = 0; i < langs.length; i++) {
  const lang = langs[i];
  const marker = '"' + lang + '":';
  const idx = content.indexOf(marker);
  const nextLang = langs[i + 1];
  const nextIdx = nextLang ? content.indexOf('"' + nextLang + '":') : content.lastIndexOf('};');
  const slice = content.slice(idx, nextIdx);
  console.log(lang, 'idx:', idx, 'slice length:', slice.length, 'last 50 chars:', JSON.stringify(slice.slice(-50)));
}
