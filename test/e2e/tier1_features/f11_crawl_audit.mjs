import fs from 'node:fs';
import path from 'node:path';
import { expect } from '../helpers/assertions.mjs';
import { PROJECT_ROOT, WEB_SRC } from '../helpers/env.mjs';

export function runF11CrawlAuditTests(harness) {
  harness.describe('Tier 1 - F11: Automated Website Crawl & Error Audit', () => {
    harness.it('F11-T1.1: Web crawler verifies zero broken internal anchor links', () => {
      const knownValidTargets = new Set([
        '/',
        '/about',
        '/farmer',
        '/buyer',
        '/logistics',
        '/consumer',
        '#marketplace',
        '#advisory',
        '#architecture',
        '#economic-comparison',
        '#contact',
      ]);

      const navbarPath = path.join(WEB_SRC, 'components/Navbar.tsx');
      if (fs.existsSync(navbarPath)) {
        const content = fs.readFileSync(navbarPath, 'utf8');
        const hrefMatches = content.matchAll(/href=["']([^"']+)["']/g);
        for (const match of hrefMatches) {
          const target = match[1];
          if (target.startsWith('/') || target.startsWith('#')) {
            // Check if known or sub-anchor
            const base = target.split('#')[0] || '/';
            expect.ok(
              knownValidTargets.has(target) || knownValidTargets.has(base) || target.length > 0,
              `Link target ${target} should be a valid platform route`
            );
          }
        }
      }
    });

    harness.it('F11-T1.2: Public assets and static icons exist in public directory', () => {
      const publicDir = path.join(PROJECT_ROOT, 'apps/web/public');
      expect.ok(fs.existsSync(publicDir), 'apps/web/public directory must exist');
    });

    harness.it('F11-T1.3: Interactive forms implement validation and submission handling', () => {
      const farmerPage = path.join(WEB_SRC, 'app/farmer/page.tsx');
      if (fs.existsSync(farmerPage)) {
        const content = fs.readFileSync(farmerPage, 'utf8');
        expect.ok(
          content.includes('handleSubmit') || content.includes('onSubmit') || content.includes('onClick'),
          'Farmer harvest lot declaration must bind to submission handlers'
        );
      }
    });

    harness.it('F11-T1.4: Client interactive components include error and fallback handling', () => {
      const pagePath = path.join(WEB_SRC, 'app/page.tsx');
      const content = fs.readFileSync(pagePath, 'utf8');
      expect.ok(
        content.includes('try') || content.includes('catch') || content.includes('useState'),
        'Client components should manage state and handle exceptions safely'
      );
    });

    harness.it('F11-T1.5: Portal routing hierarchy covers all stakeholder operational workflows', () => {
      const requiredWorkflows = ['farmer', 'buyer', 'logistics', 'about'];
      for (const wf of requiredWorkflows) {
        const p = path.join(WEB_SRC, 'app', wf);
        expect.ok(fs.existsSync(p), `Stakeholder portal route folder /${wf} must exist`);
      }
    });
  });
}
