import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const extraPath = path.resolve(__dirname, '../src/context/extraTranslations.ts');
const content = fs.readFileSync(extraPath, 'utf8');

const langs = ['or', 'as', 'ur', 'sa', 'ne', 'sd', 'ks', 'kok', 'mni', 'brx', 'mai', 'sat', 'doi'];
for (const l of langs) {
  const marker = '"' + l + '":';
  const p = content.indexOf(marker);
  const sample = content.slice(p, p + 500);
  console.log('--- ' + l + ' ---');
  console.log(sample.split('\n').slice(0, 8).join('\n'));
}
