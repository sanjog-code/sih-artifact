import fs from 'fs';

async function main() {
  const langs = [
    'en', 'hi', 'pa', 'mr', 'te', 'ta', 'bn', 'gu', 'kn', 'ml',
    'or', 'as', 'ur', 'sa', 'ne', 'sd', 'ks', 'kok', 'mni', 'brx',
    'mai', 'sat', 'doi'
  ];

  let code = `import { LanguageCode } from './LanguageContext';
import { FarmerSellTranslations } from './farmerSellTypes';

export const farmerSellTranslations: Record<LanguageCode, FarmerSellTranslations> = {
`;

  for (const lang of langs) {
    const mod = await import(`./i18n-sell/${lang}.mjs`);
    const jsonStr = JSON.stringify(mod[lang], null, 2);
    const indented = jsonStr.split('\n').map(line => '  ' + line).join('\n');
    code += `  "${lang}": ${indented.trim()},\n`;
  }

  code += `};

export function getFarmerSellTranslations(lang: LanguageCode): FarmerSellTranslations {
  return farmerSellTranslations[lang] || farmerSellTranslations.en;
}
`;

  fs.writeFileSync('src/context/farmerSellTranslations.ts', code);
  console.log('Successfully wrote src/context/farmerSellTranslations.ts! File size:', fs.statSync('src/context/farmerSellTranslations.ts').size);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
