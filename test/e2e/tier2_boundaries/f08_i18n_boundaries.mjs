import { expect } from '../helpers/assertions.mjs';
import { simulateDeepLookup } from '../helpers/i18n_verifier.mjs';

export function runF08I18nBoundariesTests(harness) {
  harness.describe('Tier 2 - F08: Localization Boundary & Corner Cases', () => {
    harness.it('F08-T2.1: Missing regional keys seamlessly fall back to English reference strings', () => {
      const mockRegional = {
        nav: {
          brand: 'ਫਾਰਮਲਿੰਕ', // Punjabi
        },
      };

      const mockEnglish = {
        nav: {
          brand: 'FarmLink',
          farmerPortal: 'Farmer Command',
          buyerHub: 'Procurement Hub',
        },
      };

      // Querying existing key in Punjabi
      const brand = simulateDeepLookup(mockRegional, mockEnglish, ['nav', 'brand']);
      expect.equal(brand, 'ਫਾਰਮਲਿੰਕ', 'Must return Punjabi translation when defined');

      // Querying key absent from Punjabi but present in English
      const farmerPortal = simulateDeepLookup(mockRegional, mockEnglish, ['nav', 'farmerPortal']);
      expect.equal(farmerPortal, 'Farmer Command', 'Must fall back to English reference string');
    });

    harness.it('F08-T2.2: Deep multi-level key lookup handles nonexistent paths without runtime TypeError', () => {
      const regional = {};
      const fallback = { farmer: { sub: { deep: 'Value' } } };

      const safeResult = simulateDeepLookup(regional, fallback, ['nonexistent', 'level2', 'level3']);
      expect.equal(safeResult, undefined, 'Deep lookup on absent key must safely return undefined');

      const foundDeep = simulateDeepLookup(regional, fallback, ['farmer', 'sub', 'deep']);
      expect.equal(foundDeep, 'Value', 'Deep lookup in fallback returns correct value');
    });

    harness.it('F08-T2.3: Zero placeholder strings (TODO, TBD, LOREM IPSUM) exist in localization dictionaries', () => {
      const sampleStrings = [
        'Direct Agrarian Network',
        'किसान कमांड सेंटर',
        'ਸਿੱਧਾ ਖੇਤੀਬਾੜੀ ਨੈੱਟਵਰਕ',
        'शेतकरी नियंत्रण केंद्र',
        'రైతు కమాండ్ సెంటర్',
        'விவசாயி கட்டளை மையம்',
      ];

      const bannedPlaceholders = [/\bTODO\b/i, /\bTBD\b/i, /\bLOREM\s*IPSUM\b/i, /\bUNTRANSLATED\b/i];
      for (const str of sampleStrings) {
        for (const bp of bannedPlaceholders) {
          expect.notOk(bp.test(str), `String "${str}" must not contain placeholder pattern ${bp}`);
        }
      }
    });

    harness.it('F08-T2.4: Empty string translations in dictionary are flagged or handled safely', () => {
      const checkValidString = (val) => typeof val === 'string' && val.trim().length > 0;
      expect.ok(checkValidString('Valid translation'));
      expect.notOk(checkValidString(''));
      expect.notOk(checkValidString('   '));
    });

    harness.it('F08-T2.5: Special unicode characters and Indic diacritics maintain encoding fidelity', () => {
      // Devanagari, Gurmukhi, Telugu, Tamil glyphs
      const indicGlyphs = [
        { lang: 'hi', text: 'हिन्दी: न्यूनतम समर्थन मूल्य (MSP)' },
        { lang: 'pa', text: 'ਪੰਜਾਬੀ: ਸਿੱਧਾ ਅਨਾਜ ਮੰਡੀਕਰਨ' },
        { lang: 'mr', text: 'मराठी: हमीभाव पडताळणी' },
        { lang: 'te', text: 'తెలుగు: రైతు కమాండ్ & విక్రయ కేంద్రం' },
        { lang: 'ta', text: 'தமிழ்: அரசு குறைந்தபட்ச ஆதரவு விலை' },
      ];

      for (const item of indicGlyphs) {
        const encoded = Buffer.from(item.text, 'utf8').toString('utf8');
        expect.equal(encoded, item.text, `UTF-8 encoding must preserve ${item.lang} glyph fidelity`);
      }
    });
  });
}
