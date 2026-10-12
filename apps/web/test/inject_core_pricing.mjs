import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { coreAdditionalPricing } from './core_additional_pricing.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const langPath = path.resolve(__dirname, '../src/context/LanguageContext.tsx');
let content = fs.readFileSync(langPath, 'utf8');

const coreLangs = ['en', 'hi', 'pa', 'mr', 'te', 'ta'];

for (const lang of coreLangs) {
  const marker = `${lang}: {`;
  const langIdx = content.indexOf(marker);
  if (langIdx === -1) {
    throw new Error(`Could not find marker for ${lang}: {`);
  }

  // Find pricing: { inside this language block
  const pricingMarker = 'pricing: {';
  const pricingIdx = content.indexOf(pricingMarker, langIdx);
  if (pricingIdx === -1) {
    throw new Error(`Could not find pricing: { in ${lang}`);
  }

  // Find the closing brace of pricing: {
  // It precedes buyerTabs: {
  const buyerTabsMarker = 'buyerTabs: {';
  const buyerTabsIdx = content.indexOf(buyerTabsMarker, pricingIdx);
  if (buyerTabsIdx === -1) {
    throw new Error(`Could not find buyerTabs: { after pricing in ${lang}`);
  }

  // The closing brace for pricing is right before buyerTabs: {
  // Let's find the last '},' before buyerTabs: {
  const searchChunk = content.slice(pricingIdx, buyerTabsIdx);
  const lastClosingBraceIdx = searchChunk.lastIndexOf('},');
  if (lastClosingBraceIdx === -1) {
    throw new Error(`Could not find closing brace for pricing in ${lang}`);
  }

  const insertionPoint = pricingIdx + lastClosingBraceIdx;

  // Format additional entries
  const additional = coreAdditionalPricing[lang];
  const formattedEntries = Object.entries(additional)
    .map(([key, val]) => `      ${key}: ${JSON.stringify(val)},`)
    .join('\n');

  const insertText = '\n' + formattedEntries + '\n    ';

  content = content.slice(0, insertionPoint) + insertText + content.slice(insertionPoint);
  console.log(`Injected additional pricing keys for ${lang}`);
}

fs.writeFileSync(langPath, content, 'utf8');
console.log('Successfully updated LanguageContext.tsx with all core pricing additions!');
