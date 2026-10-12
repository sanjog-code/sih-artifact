import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { pricingTranslations } from './generate_all_pricing.mjs';
import { pricingOrAsUrSa } from './pricing_or_as_ur_sa.mjs';
import { pricingNeSdKsKok } from './pricing_ne_sd_ks_kok.mjs';
import { pricingMniBrxMaiSatDoi } from './pricing_mni_brx_mai_sat_doi.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const extraPath = path.resolve(__dirname, '../src/context/extraTranslations.ts');

const allPricing = {
  ...pricingTranslations,
  ...pricingOrAsUrSa,
  ...pricingNeSdKsKok,
  ...pricingMniBrxMaiSatDoi,
};

const regional17 = [
  'bn', 'gu', 'kn', 'ml', 'or', 'as',
  'ur', 'sa', 'ne', 'sd', 'ks', 'kok',
  'mni', 'brx', 'mai', 'sat', 'doi'
];

console.log('Checking all 17 keys are present in allPricing:');
for (const l of regional17) {
  if (!allPricing[l]) {
    throw new Error(`Missing pricing for ${l}`);
  }
}
console.log('All 17 regional languages present!');

let content = fs.readFileSync(extraPath, 'utf8');

// For each language in reverse order (or forward with careful replacement):
// Each block has the form:
//   "bn": {
//     "nav": { ... },
//     ...
//     "logisticsManifest": { ... }
//   },
//
// We want to insert `"pricing": <JSON>,` inside `"lang": { ... }`.
// Specifically, right after `"lang": {` we can insert `"pricing": ...,\n    `.

for (const lang of regional17) {
  const marker = `"${lang}": {`;
  const idx = content.indexOf(marker);
  if (idx === -1) {
    throw new Error(`Could not find marker for "${lang}": { in extraTranslations.ts`);
  }

  // Format pricing object with proper indentation
  const pricingObj = allPricing[lang];
  const formattedPricing = JSON.stringify(pricingObj, null, 6)
    .replace(/^\{/, '{\n')
    .split('\n')
    .map((line, i) => (i === 0 ? line : '    ' + line))
    .join('\n');

  const insertText = `\n    "pricing": ${formattedPricing},`;
  const insertionPoint = idx + marker.length;

  content = content.slice(0, insertionPoint) + insertText + content.slice(insertionPoint);
  console.log(`Injected pricing for ${lang}`);
}

fs.writeFileSync(extraPath, content, 'utf8');
console.log('Successfully injected pricing into all 17 languages in extraTranslations.ts!');
