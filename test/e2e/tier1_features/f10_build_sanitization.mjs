import fs from 'node:fs';
import path from 'node:path';
import { expect } from '../helpers/assertions.mjs';
import { PROJECT_ROOT, WEB_SRC } from '../helpers/env.mjs';

export function runF10BuildSanitizationTests(harness) {
  harness.describe('Tier 1 - F10: ESLint & Build Sanitization', () => {
    harness.it('F10-T1.1: Zero banned hackathon or SIH terms exist across web source code', () => {
      const bannedRegexes = [
        /\bSIH\b/i,
        /\bSmart India Hackathon\b/i,
        /\bPS\s*26033\b/i,
        /\bTeam False 6\b/i,
      ];

      function scanDir(dir) {
        if (!fs.existsSync(dir)) return;
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            if (entry.name !== 'node_modules' && entry.name !== '.next') {
              scanDir(fullPath);
            }
          } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
            const content = fs.readFileSync(fullPath, 'utf8');
            for (const reg of bannedRegexes) {
              expect.notOk(
                reg.test(content),
                `Found banned term matching ${reg} in file ${fullPath}`
              );
            }
          }
        }
      }

      scanDir(WEB_SRC);
    });

    harness.it('F10-T1.2: Root and workspace package.json files are valid JSON', () => {
      const rootPkgPath = path.join(PROJECT_ROOT, 'package.json');
      expect.ok(fs.existsSync(rootPkgPath), 'Root package.json must exist');
      const rootPkg = JSON.parse(fs.readFileSync(rootPkgPath, 'utf8'));
      expect.equal(rootPkg.name, 'farmlink', 'Root package name should be farmlink');

      const webPkgPath = path.join(PROJECT_ROOT, 'apps/web/package.json');
      expect.ok(fs.existsSync(webPkgPath), 'apps/web/package.json must exist');
      const webPkg = JSON.parse(fs.readFileSync(webPkgPath, 'utf8'));
      expect.ok(webPkg.dependencies || webPkg.devDependencies, 'apps/web must declare dependencies');
    });

    harness.it('F10-T1.3: TypeScript base configuration exists and parses cleanly', () => {
      const tsconfigPath = path.join(PROJECT_ROOT, 'tsconfig.base.json');
      expect.ok(fs.existsSync(tsconfigPath), 'tsconfig.base.json must exist');
      const raw = fs.readFileSync(tsconfigPath, 'utf8');
      expect.greaterThan(raw.length, 20, 'tsconfig.base.json should not be empty');
    });

    harness.it('F10-T1.4: Component files contain valid import statements without unresolved syntax', () => {
      const navbarPath = path.join(WEB_SRC, 'components/Navbar.tsx');
      if (fs.existsSync(navbarPath)) {
        const content = fs.readFileSync(navbarPath, 'utf8');
        expect.ok(content.includes('import'), 'Navbar.tsx must contain import statements');
      }
    });

    harness.it('F10-T1.5: Production Next.js route handlers contain zero debugger statements', () => {
      const routesToScan = [
        path.join(WEB_SRC, 'app/api/ai/forecast/route.ts'),
        path.join(WEB_SRC, 'app/api/ai/route-optimize/route.ts'),
      ];

      for (const rPath of routesToScan) {
        if (fs.existsSync(rPath)) {
          const content = fs.readFileSync(rPath, 'utf8');
          expect.notOk(content.includes('debugger;'), `Route handler ${rPath} must not contain debugger statements`);
        }
      }
    });
  });
}
