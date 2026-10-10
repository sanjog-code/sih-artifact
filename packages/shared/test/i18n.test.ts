import { en, hi, pa, mr, te, ta, t } from '../src/i18n';

describe('i18n dictionaries', () => {
  const walkCheck = (langName: string, dict: unknown) => {
    const missing: string[] = [];
    const walk = (a: unknown, b: unknown, path: string) => {
      if (typeof a !== 'object' || a === null) return;
      for (const [k, v] of Object.entries(a as Record<string, unknown>)) {
        const p = path ? `${path}.${k}` : k;
        const bv = (b as Record<string, unknown>)?.[k];
        if (typeof v === 'object' && v !== null) {
          if (typeof bv !== 'object' || bv === null) missing.push(p);
          else walk(v, bv, p);
        } else if (bv === undefined) {
          missing.push(p);
        }
      }
    };
    walk(en, dict, '');
    expect(missing).toEqual([]);
  };

  it('Hindi dictionary covers every English key', () => {
    walkCheck('hi', hi);
  });

  it('Punjabi dictionary covers every English key', () => {
    walkCheck('pa', pa);
  });

  it('Marathi dictionary covers every English key', () => {
    walkCheck('mr', mr);
  });

  it('Telugu dictionary covers every English key', () => {
    walkCheck('te', te);
  });

  it('Tamil dictionary covers every English key', () => {
    walkCheck('ta', ta);
  });

  it('translates known keys across all languages', () => {
    expect(hi.nav.home).toBe('होम');
    expect(pa.nav.home).toBe('ਮੁੱਖ ਪੰਨਾ');
    expect(mr.nav.home).toBe('मुख्यपृष्ठ');
    expect(te.nav.home).toBe('హోమ్');
    expect(ta.nav.home).toBe('முகப்பு');
    expect(en.insight.disclaimer).toBe('Recommendation only, not a price guarantee.');
  });

  it('translate function supports interpolation and fallback', () => {
    expect(t('hi', 'nav.home')).toBe('होम');
    expect(t('pa', 'common.kg')).toBe('ਕਿਲੋ');
    expect(t('en', 'nonexistent.key')).toBe('nonexistent.key');
  });
});