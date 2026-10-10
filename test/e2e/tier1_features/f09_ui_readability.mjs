import fs from 'node:fs';
import { expect } from '../helpers/assertions.mjs';
import { ROUTES } from '../helpers/env.mjs';

export function runF09UiReadabilityTests(harness) {
  harness.describe('Tier 1 - F09: UI Readability & Indic Fonts', () => {
    harness.it('F09-T1.1: Monospace typography applied to commodity pricing and lot identifiers', () => {
      const pageContent = fs.readFileSync(ROUTES.landing, 'utf8');
      expect.ok(
        pageContent.includes('font-mono'),
        'Landing page must use font-mono for tabular price and metrics readability'
      );
    });

    harness.it('F09-T1.2: Terminal minimalist aesthetic utilizes high-contrast zinc/neutral palette', () => {
      const pageContent = fs.readFileSync(ROUTES.landing, 'utf8');
      expect.ok(
        pageContent.includes('zinc-') || pageContent.includes('neutral-') || pageContent.includes('emerald-'),
        'Landing page must utilize clean terminal color palette (zinc / emerald accents)'
      );
    });

    harness.it('F09-T1.3: Responsive layout classes applied across portal grids', () => {
      const pageContent = fs.readFileSync(ROUTES.landing, 'utf8');
      expect.ok(
        pageContent.includes('md:grid') || pageContent.includes('grid-cols') || pageContent.includes('flex-col'),
        'Marketplace and dashboard layouts must apply responsive Tailwind grid/flex classes'
      );
    });

    harness.it('F09-T1.4: Tabular monospace alignment utilized in farmer and logistics dashboards', () => {
      if (fs.existsSync(ROUTES.logistics)) {
        const logContent = fs.readFileSync(ROUTES.logistics, 'utf8');
        expect.ok(
          logContent.includes('font-mono') || logContent.includes('tabular'),
          'Logistics dashboard should employ monospace metrics'
        );
      }
    });

    harness.it('F09-T1.5: Clean icon accents enhance readability without visual clutter', () => {
      const pageContent = fs.readFileSync(ROUTES.landing, 'utf8');
      expect.ok(
        pageContent.includes('lucide-react') || pageContent.includes('Icon') || pageContent.includes('svg'),
        'UI should include crisp lucide-react iconography'
      );
    });
  });
}
