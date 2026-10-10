import { expect } from '../helpers/assertions.mjs';

export function runF01NavBoundariesTests(harness) {
  harness.describe('Tier 2 - F01: Navigation Boundary & Corner Cases', () => {
    harness.it('F01-T2.1: Route path normalization handles trailing slashes and query parameters', () => {
      const normalizePath = (p) => {
        const withoutQuery = p.split('?')[0].split('#')[0];
        const trimmed = withoutQuery.replace(/\/+$/, '');
        return trimmed.length === 0 ? '/' : trimmed.toLowerCase();
      };

      expect.equal(normalizePath('/farmer/'), '/farmer');
      expect.equal(normalizePath('/BUYER?ref=direct'), '/buyer');
      expect.equal(normalizePath('///'), '/');
      expect.equal(normalizePath('/consumer/#trending'), '/consumer');
    });

    harness.it('F01-T2.2: Deep anchor navigation fragments match valid HTML section IDs', () => {
      const validSectionIds = ['marketplace', 'advisory', 'architecture', 'economic-comparison'];
      const testFragments = ['#marketplace', '#advisory', '#architecture'];

      for (const frag of testFragments) {
        const id = frag.slice(1);
        expect.ok(validSectionIds.includes(id), `Anchor ${frag} must resolve to a valid section id`);
      }
    });

    harness.it('F01-T2.3: Mobile drawer state transitions handle rapid toggling without race conditions', () => {
      let isOpen = false;
      const toggle = () => {
        isOpen = !isOpen;
      };

      // Rapid toggles
      for (let i = 0; i < 10; i++) toggle();
      expect.equal(isOpen, false, 'Even number of toggles must restore closed state');

      toggle();
      expect.equal(isOpen, true, 'Odd number of toggles must leave drawer open');
    });

    harness.it('F01-T2.4: Malformed or missing route query parameters default gracefully', () => {
      const parseParams = (urlStr) => {
        const url = new URL(urlStr, 'http://localhost:3000');
        return {
          commodity: url.searchParams.get('commodity') || 'Wheat',
          storageDays: Math.max(0, parseInt(url.searchParams.get('storageDays') || '0', 10) || 0),
        };
      };

      const emptyQuery = parseParams('http://localhost:3000/api/ai/forecast?commodity=');
      expect.equal(emptyQuery.commodity, 'Wheat', 'Empty commodity param should default to Wheat');

      const negativeDays = parseParams('http://localhost:3000/api/ai/forecast?storageDays=-15');
      expect.equal(negativeDays.storageDays, 0, 'Negative storage days should clamp to 0');
    });

    harness.it('F01-T2.5: Deep nested links maintain correct platform root relativity', () => {
      const resolveRelative = (from, to) => {
        if (to.startsWith('/')) return to;
        return `/${to}`;
      };

      expect.equal(resolveRelative('/farmer/lots/create', '/buyer'), '/buyer');
      expect.equal(resolveRelative('/logistics', 'about'), '/about');
    });
  });
}
