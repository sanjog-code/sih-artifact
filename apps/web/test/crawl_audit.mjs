import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🕷️ Running Crawl Audit & 23-Language Verification across all pages...\n');

// 1. Audit all 16 page routes exist
const routes = [
  'about', 'admin', 'buyer', 'checkout', 'consumer',
  'cookie-policy', 'escrow/voucher', 'farmer', 'invoice',
  'login', 'logistics', '', 'pricing', 'privacy',
  'refund-policy', 'terms'
];

for (const r of routes) {
  const pagePath = path.resolve(__dirname, '../src/app', r, 'page.tsx');
  assert(fs.existsSync(pagePath), `Page route ${r || '/'} must exist at ${pagePath}`);
}
console.log(`  ✅ All ${routes.length} application page routes verified on disk.`);

// 2. Audit 23 Languages Definition
const langCtxPath = path.resolve(__dirname, '../src/context/LanguageContext.tsx');
const langCtxContent = fs.readFileSync(langCtxPath, 'utf8');

const all23Langs = [
  'en', 'hi', 'pa', 'mr', 'te', 'ta',
  'bn', 'gu', 'kn', 'ml', 'or', 'as',
  'ur', 'sa', 'ne', 'sd', 'ks', 'kok',
  'mni', 'brx', 'mai', 'sat', 'doi'
];

for (const lang of all23Langs) {
  assert(langCtxContent.includes(`code: '${lang}'`), `Language code ${lang} missing from LANGUAGES list`);
}
console.log('  ✅ All 23 official Eighth Schedule language codes registered in LANGUAGES.');

// 3. Audit Pricing Integration
assert(langCtxContent.includes('pricing: {'), 'LanguageContext must define pricing dictionary');
const pricingPagePath = path.resolve(__dirname, '../src/app/pricing/page.tsx');
const pricingPageContent = fs.readFileSync(pricingPagePath, 'utf8');

assert(pricingPageContent.includes('useLanguage'), 'pricing/page.tsx must import and call useLanguage()');
assert(pricingPageContent.includes('tp?.heroTitle'), 'pricing/page.tsx must bind heroTitle to tp');
assert(pricingPageContent.includes('tp?.farmerTab'), 'pricing/page.tsx must bind farmerTab to tp');
assert(pricingPageContent.includes('tp?.businessTab'), 'pricing/page.tsx must bind businessTab to tp');
assert(pricingPageContent.includes('tp?.consumerTab'), 'pricing/page.tsx must bind consumerTab to tp');
assert(pricingPageContent.includes('tp?.calculatorTitle'), 'pricing/page.tsx must bind calculatorTitle to tp');
assert(pricingPageContent.includes('tp?.operatingPrinciplesTitle'), 'pricing/page.tsx must bind operatingPrinciplesTitle to tp');
console.log('  ✅ Pricing page verified: dynamically connected to useLanguage() with complete i18n bindings.');

// 4. Audit Buyer and Farmer Tab Localization
const buyerPagePath = path.resolve(__dirname, '../src/app/buyer/page.tsx');
const buyerPageContent = fs.readFileSync(buyerPagePath, 'utf8');
assert(buyerPageContent.includes('buyerTabs?.overview'), 'buyer/page.tsx tab navigation must use buyerTabs');

const farmerPagePath = path.resolve(__dirname, '../src/app/farmer/page.tsx');
const farmerPageContent = fs.readFileSync(farmerPagePath, 'utf8');
assert(farmerPageContent.includes('farmerTabs?.overview'), 'farmer/page.tsx tab navigation must use farmerTabs');
console.log('  ✅ Buyer Desk and Farmer Hub tab navigation verified with localized keys.');

// 5. Audit Navbar and Footer Language Badges
const navbarPath = path.resolve(__dirname, '../src/components/Navbar.tsx');
const navbarContent = fs.readFileSync(navbarPath, 'utf8');
assert(navbarContent.includes('(23)'), 'Navbar must announce (23) supported official languages');

const footerPath = path.resolve(__dirname, '../src/components/Footer.tsx');
const footerContent = fs.readFileSync(footerPath, 'utf8');
assert(footerContent.includes('23 Languages'), 'Footer must display 23 Languages badge');
console.log('  ✅ Navbar and Footer verified: display 23 official languages.');

console.log('\n🎉 CRAWL AUDIT AND 23-LANGUAGE VERIFICATION PASSED WITH 0 ERRORS!\n');
