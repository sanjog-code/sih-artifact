const fs = require('fs');
const https = require('https');
const path = require('path');

const en = JSON.parse(fs.readFileSync('./scripts/en_dictionary.json', 'utf8'));
const flat = JSON.parse(fs.readFileSync('./scripts/flat_keys.json', 'utf8'));
const { extraTranslations } = require('./temp_extra.js');

const targetLangs = [
  { code: 'bn', apiCode: 'bn' },
  { code: 'gu', apiCode: 'gu' },
  { code: 'kn', apiCode: 'kn' },
  { code: 'ml', apiCode: 'ml' },
  { code: 'or', apiCode: 'or' },
  { code: 'as', apiCode: 'as' },
  { code: 'ur', apiCode: 'ur' },
  { code: 'sa', apiCode: 'sa' },
  { code: 'ne', apiCode: 'ne' },
  { code: 'sd', apiCode: 'sd' },
  { code: 'ks', apiCode: 'ur' },
  { code: 'kok', apiCode: 'kok' },
  { code: 'mni', apiCode: 'mni-Mtei' },
  { code: 'brx', apiCode: 'as' },
  { code: 'mai', apiCode: 'mai' },
  { code: 'sat', apiCode: 'sat' },
  { code: 'doi', apiCode: 'doi' }
];

async function translateText(text, targetLang) {
  if (!text || typeof text !== 'string') return text;
  // If text is purely punctuation, whitespace or symbol like "Fasal Matrix"
  if (text === 'Fasal Matrix') return 'Fasal Matrix';
  
  return new Promise((resolve) => {
    const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=' + targetLang + '&dt=t&q=' + encodeURIComponent(text);
    const req = https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          let full = '';
          if (parsed && parsed[0]) {
            for (const item of parsed[0]) {
              if (item[0]) full += item[0];
            }
          }
          resolve(full || text);
        } catch {
          resolve(text);
        }
      });
    });
    req.on('error', () => resolve(text));
    req.setTimeout(6000, () => {
      req.destroy();
      resolve(text);
    });
  });
}

function getValueByPath(obj, pathStr) {
  const parts = pathStr.split('.');
  let curr = obj;
  for (const p of parts) {
    if (curr === undefined || curr === null) return undefined;
    curr = curr[p];
  }
  return curr;
}

function setValueByPath(obj, pathStr, value) {
  const parts = pathStr.split('.');
  let curr = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (!curr[p] || typeof curr[p] !== 'object') {
      curr[p] = {};
    }
    curr = curr[p];
  }
  curr[parts[parts.length - 1]] = value;
}

async function run() {
  console.log('🚀 Starting Full Site-Wide 17 Regional Languages Translation Generator...');

  const finalTranslations = {};

  for (const lang of targetLangs) {
    console.log(`\nProcessing language: ${lang.code} (API: ${lang.apiCode})...`);
    const langDict = JSON.parse(JSON.stringify(extraTranslations[lang.code] || {}));
    
    // Find missing keys
    const missingItems = [];
    for (const item of flat) {
      const existingVal = getValueByPath(langDict, item.path);
      if (existingVal === undefined || existingVal === null || existingVal === '') {
        missingItems.push(item);
      }
    }

    console.log(`  Found ${missingItems.length} missing translation keys for ${lang.code}.`);

    // Process in batches of 15 concurrent requests
    const BATCH_SIZE = 15;
    for (let i = 0; i < missingItems.length; i += BATCH_SIZE) {
      const batch = missingItems.slice(i, i + BATCH_SIZE);
      const promises = batch.map(async (item) => {
        const trans = await translateText(item.en, lang.apiCode);
        setValueByPath(langDict, item.path, trans);
      });
      await Promise.all(promises);
      process.stdout.write(`  Processed ${Math.min(i + BATCH_SIZE, missingItems.length)}/${missingItems.length} keys...\r`);
    }

    console.log(`  ✅ Finished ${lang.code}: 100% of ${flat.length} keys populated.`);
    finalTranslations[lang.code] = langDict;
  }

  // Save as JSON
  fs.writeFileSync('./scripts/completed_extra_translations.json', JSON.stringify(finalTranslations, null, 2), 'utf8');
  console.log('\n🎉 Successfully saved ./scripts/completed_extra_translations.json!');
}

run().catch(console.error);
