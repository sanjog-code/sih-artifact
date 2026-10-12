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

console.log('Testing pricing in extraTranslations:');
for (let i = 0; i < langs.length; i++) {
  const lang = langs[i];
  const idx = content.indexOf(`"${lang}":`);
  const nextLang = langs[i + 1];
  const nextIdx = nextLang ? content.indexOf(`"${nextLang}":`) : content.length;
  const block = content.slice(idx, nextIdx);
  const hasPricing = block.includes('"pricing":');
  console.log(`${lang}: ${hasPricing}`);
}
