import fs from 'fs';
import { extraTranslations } from '../src/context/extraTranslations.ts';
import { pillars_ur, pillars_sa, pillars_ks, pillars_kok } from './pillars_ur_sa_ks_kok.mjs';
import {
  pillars_mni,
  pillars_brx,
  pillars_mai,
  pillars_sat,
  pillars_doi,
} from './pillars_mni_brx_mai_sat_doi.mjs';
import { pillars_ne, pillars_sd } from './pillars_ne_sd.mjs';

const allPillars = {
  ur: pillars_ur,
  sa: pillars_sa,
  ks: pillars_ks,
  kok: pillars_kok,
  mni: pillars_mni,
  brx: pillars_brx,
  mai: pillars_mai,
  sat: pillars_sat,
  doi: pillars_doi,
  ne: pillars_ne,
  sd: pillars_sd,
};

console.log('Injecting translations for', Object.keys(allPillars).length, 'languages into extraTranslations.ts...');

// Backup first
fs.copyFileSync('src/context/extraTranslations.ts', 'src/context/extraTranslations.ts.bak');

for (const [lang, data] of Object.entries(allPillars)) {
  if (!extraTranslations[lang]) {
    console.error(`Language ${lang} not found in extraTranslations!`);
    continue;
  }

  extraTranslations[lang].architecture = {
    ...extraTranslations[lang].architecture,
    ...data.architecture,
  };

  extraTranslations[lang].comparison = {
    ...extraTranslations[lang].comparison,
    ...data.comparison,
  };

  extraTranslations[lang].portal = {
    ...extraTranslations[lang].portal,
    ...data.portal,
  };

  console.log(`Updated ${lang}: architecture (${Object.keys(extraTranslations[lang].architecture).length}), comparison (${Object.keys(extraTranslations[lang].comparison).length}), portal (${Object.keys(extraTranslations[lang].portal).length})`);
}

const serialized = `// Comprehensive 100% full-coverage translations for all 17 Eighth Schedule regional languages\nexport const extraTranslations = ${JSON.stringify(extraTranslations, null, 2)};\n`;

fs.writeFileSync('src/context/extraTranslations.ts', serialized, 'utf8');
console.log('Successfully written updated src/context/extraTranslations.ts!');
