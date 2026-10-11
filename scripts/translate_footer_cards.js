const fs = require('fs');
const https = require('https');

// The 24 newly identified card, nav, and footer strings
const itemsToTranslate = [
  { key: 'agmarkStandards', en: 'AGMARK Quality Standards' },
  { key: 'directBankSettlement', en: 'Direct Bank Settlement' },
  { key: 'platformPortals', en: 'Platform Portals' },
  { key: 'pricingPlans', en: 'Pricing & Plans' },
  { key: 'supportHelp', en: 'Support & Help' },
  { key: 'tollFreeHelpline', en: 'Toll-Free Helpline' },
  { key: 'grievanceDesk', en: 'Grievance Desk' },
  { key: 'operatingHours', en: 'Mon - Sat: 9:00 AM - 6:00 PM IST' },
  { key: 'registeredEntity', en: 'Registered Entity' },
  { key: 'registeredOffice', en: 'Registered Office' },
  { key: 'nodalGrievanceOfficer', en: 'Nodal Grievance Officer' },
  { key: 'refundPolicy', en: 'Refund Policy' },
  { key: 'cookiePolicy', en: 'Cookie Policy' },
  { key: 'ageRestricted', en: 'Age Restricted: 18+ Only' },
  { key: 'allRightsReserved', en: 'All rights reserved.' },
  { key: 'active', en: 'Active' },
  { key: 'showFewerLanguages', en: '▲ Show Fewer Languages' },
  { key: 'moreOfficialLanguages', en: '▼ More Official Languages ({count})' },
  { key: 'fruits', en: 'Fruits' },
  { key: 'liveSynced', en: 'Live Synced' },
  { key: 'adminOps', en: 'Admin Ops' },
  { key: 'farmerDesk', en: 'Farmer Desk' },
  { key: 'exploreTrustPillars', en: 'Explore Trust Pillars' },
  { key: 'contactIntegrationDesk', en: 'Contact Integration Desk' }
];

const langs = [
  { code: 'hi', api: 'hi' },
  { code: 'pa', api: 'pa' },
  { code: 'mr', api: 'mr' },
  { code: 'te', api: 'te' },
  { code: 'ta', api: 'ta' },
  { code: 'bn', api: 'bn' },
  { code: 'gu', api: 'gu' },
  { code: 'kn', api: 'kn' },
  { code: 'ml', api: 'ml' },
  { code: 'or', api: 'or' },
  { code: 'as', api: 'as' },
  { code: 'ur', api: 'ur' },
  { code: 'sa', api: 'sa' },
  { code: 'ne', api: 'ne' },
  { code: 'sd', api: 'sd' },
  { code: 'ks', api: 'ur' },
  { code: 'kok', api: 'kok' },
  { code: 'mni', api: 'mni-Mtei' },
  { code: 'brx', api: 'as' },
  { code: 'mai', api: 'mai' },
  { code: 'sat', api: 'sat' },
  { code: 'doi', api: 'doi' }
];

async function translate(text, targetLang) {
  return new Promise((resolve) => {
    const url = 'https://api.mymemory.translated.net/get?q=' + encodeURIComponent(text) + '&langpair=en|' + targetLang;
    const req = https.get(url, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try {
          const p = JSON.parse(d);
          const t = p.responseData && p.responseData.translatedText;
          if (t && !t.includes('MYMEMORY WARNING') && t !== text) {
            resolve(t);
            return;
          }
        } catch {}
        resolve(text);
      });
    });
    req.on('error', () => resolve(text));
    req.setTimeout(5000, () => {
      req.destroy();
      resolve(text);
    });
  });
}

async function run() {
  console.log('Generating translations for 24 card and footer keys across 22 languages...');
  const result = {};

  for (const l of langs) {
    result[l.code] = {};
    for (const item of itemsToTranslate) {
      const trans = await translate(item.en, l.api);
      result[l.code][item.key] = trans;
      await new Promise(r => setTimeout(r, 80)); // Polite throttle
    }
    console.log(`Finished ${l.code}`);
  }

  fs.writeFileSync('./scripts/cards_and_footer_translations.json', JSON.stringify(result, null, 2), 'utf8');
  console.log('Saved ./scripts/cards_and_footer_translations.json');
}

run().catch(console.error);
