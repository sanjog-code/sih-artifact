import { expect } from '../helpers/assertions.mjs';
import { getRouteInventory, auditNavbarLinks, auditLayoutHygiene } from '../helpers/route_verifier.mjs';

export function runF01NavigationTests(harness) {
  harness.describe('Tier 1 - F01: Navigation & Portal Unification', () => {
    harness.it('F01-T1.1: Core portal route files are present in the app router', () => {
      const inventory = getRouteInventory();
      expect.greaterOrEqual(inventory.length, 5, 'Should inventory at least 5 portal routes');
      const landing = inventory.find((r) => r.path === '/');
      expect.ok(landing && landing.exists, 'Root route / must exist');
      const about = inventory.find((r) => r.path === '/about');
      expect.ok(about && about.exists, 'About route /about must exist');
      const farmer = inventory.find((r) => r.path === '/farmer');
      expect.ok(farmer && farmer.exists, 'Farmer route /farmer must exist');
      const buyer = inventory.find((r) => r.path === '/buyer');
      expect.ok(buyer && buyer.exists, 'Buyer route /buyer must exist');
      const logistics = inventory.find((r) => r.path === '/logistics');
      expect.ok(logistics && logistics.exists, 'Logistics route /logistics must exist');
    });

    harness.it('F01-T1.2: Navbar contains navigation links to specialized hubs', () => {
      const navAudit = auditNavbarLinks();
      expect.ok(navAudit.exists, 'Navbar.tsx component must exist');
      expect.greaterOrEqual(navAudit.detected.length, 4, 'Navbar should link to at least 4 key destinations');
    });

    harness.it('F01-T1.3: Mobile drawer and responsive navigation toggles are implemented', () => {
      const navAudit = auditNavbarLinks();
      expect.ok(navAudit.hasMobileDrawer, 'Navbar must implement mobile drawer toggle state');
      expect.ok(navAudit.hasLanguageSelector, 'Navbar must include language switching UI');
    });

    harness.it('F01-T1.4: App layout hygiene and LanguageProvider wrapping', () => {
      const layoutAudit = auditLayoutHygiene();
      expect.ok(layoutAudit.exists, 'layout.tsx must exist');
      expect.ok(layoutAudit.wrapsLanguageProvider, 'Root layout must wrap children with LanguageProvider');
      expect.ok(layoutAudit.hasGeistFonts, 'Root layout must configure Geist typography');
    });

    harness.it('F01-T1.5: Route components contain primary UI headers and role badges', () => {
      const inventory = getRouteInventory();
      for (const r of inventory) {
        if (r.exists) {
          expect.greaterThan(r.content.length, 100, `Route ${r.path} content should not be empty`);
          expect.ok(
            r.content.includes('export default') || r.content.includes('export function'),
            `Route ${r.path} must export a component`
          );
        }
      }
    });
  });
}
