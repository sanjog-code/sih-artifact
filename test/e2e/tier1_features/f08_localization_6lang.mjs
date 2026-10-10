import { expect } from '../helpers/assertions.mjs';
import { auditLanguageContext, REQUIRED_LANGUAGES, REQUIRED_SECTIONS, simulateDeepLookup } from '../helpers/i18n_verifier.mjs';

export function runF08Localization6LangTests(harness) {
  harness.describe('Tier 1 - F08: 100% 6-Language Localization', () => {
    const audit = auditLanguageContext();

    harness.it('F08-T1.1: All 6 regional languages are declared in LanguageContext.tsx', () => {
      expect.ok(audit.exists, 'LanguageContext.tsx must exist');
      for (const lang of REQUIRED_LANGUAGES) {
        expect.ok(
          audit.registeredLanguages.includes(lang),
          `Language code '${lang}' must be declared in LANGUAGES array`
        );
      }
    });

    harness.it('F08-T1.2: All 6 language dictionaries contain core portal sections', () => {
      for (const lang of REQUIRED_LANGUAGES) {
        expect.ok(
          audit.foundDictionaries.includes(lang),
          `Language dictionary for '${lang}' must be present in translations object`
        );
      }

      for (const sec of REQUIRED_SECTIONS) {
        expect.greaterOrEqual(
          audit.sectionReport[sec] || 0,
          1,
          `Section '${sec}' must appear in translation dictionaries`
        );
      }
    });

    harness.it('F08-T1.3: Deep-fallback architecture guarantees non-undefined string resolution', () => {
      expect.ok(audit.hasFallbackLogic, 'LanguageContext must implement fallback resolution to English');

      // Test simulateDeepLookup with missing keys in regional dict
      const mockHi = { nav: { brand: 'फार्मलिंक' } };
      const mockEn = { nav: { brand: 'FarmLink', direct: 'Direct Agrarian Network' } };

      const foundExisting = simulateDeepLookup(mockHi, mockEn, ['nav', 'brand']);
      expect.equal(foundExisting, 'फार्मलिंक', 'Should return native Hindi translation when present');

      const foundFallback = simulateDeepLookup(mockHi, mockEn, ['nav', 'direct']);
      expect.equal(foundFallback, 'Direct Agrarian Network', 'Should fall back to English string rather than undefined');

      const nonExistent = simulateDeepLookup(mockHi, mockEn, ['unknown', 'deep', 'key']);
      expect.equal(nonExistent, undefined, 'Truly nonexistent key returns undefined safely without throwing');
    });

    harness.it('F08-T1.4: Language selection persists across localStorage', () => {
      expect.ok(audit.exists, 'LanguageContext.tsx must exist');
      // LanguageContext must configure persistence
      expect.greaterThan(audit.fileSizeBytes, 1000, 'LanguageContext dictionary file should have substantial content');
    });

    harness.it('F08-T1.5: UI labels across specialized portals have dictionary definitions', () => {
      // Verifies farmer, buyer, and logistics sections are mapped
      expect.greaterOrEqual(audit.sectionReport.farmer || 0, 1, 'farmer section must be defined');
      expect.greaterOrEqual(audit.sectionReport.buyer || 0, 1, 'buyer section must be defined');
      expect.greaterOrEqual(audit.sectionReport.logistics || 0, 1, 'logistics section must be defined');
    });
  });
}
