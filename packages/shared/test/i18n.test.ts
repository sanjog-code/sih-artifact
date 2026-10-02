import { en, hi } from '../src/i18n';

describe('i18n dictionaries', () => {
  it('Hindi dictionary covers every English key (fallback-safe)', () => {
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
    walk(en, hi, '');
    expect(missing).toEqual([]);
  });

  it('translates a known key', () => {
    expect(hi.nav.home).toBe('होम');
    expect(en.insight.disclaimer).toBe('Recommendation only, not a price guarantee.');
  });
});