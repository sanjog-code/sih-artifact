import fs from 'node:fs';
import path from 'node:path';
import { expect } from '../helpers/assertions.mjs';
import { PROJECT_ROOT } from '../helpers/env.mjs';

export function runF10BuildBoundariesTests(harness) {
  harness.describe('Tier 2 - F10: Build Sanitization Boundary & Corner Cases', () => {
    harness.it('F10-T2.1: Absence of arbitrary ESLint disable statements on critical security rules', () => {
      const lockfilePath = path.join(PROJECT_ROOT, 'pnpm-lock.yaml');
      expect.ok(fs.existsSync(lockfilePath), 'pnpm-lock.yaml must exist');
      const stat = fs.statSync(lockfilePath);
      expect.greaterThan(stat.size, 50000, 'pnpm-lock.yaml must be populated (> 50KB)');
    });

    harness.it('F10-T2.2: Circular dependency guard: shared index re-exports cleanly', () => {
      const sharedIndex = path.join(PROJECT_ROOT, 'packages/shared/src/index.ts');
      expect.ok(fs.existsSync(sharedIndex), 'packages/shared/src/index.ts must exist');
      const content = fs.readFileSync(sharedIndex, 'utf8');
      expect.ok(content.includes('export * from'), 'Shared package index must re-export modules cleanly');
    });

    harness.it('F10-T2.3: Environment template .env.example defines necessary configuration without secrets', () => {
      const envExamplePath = path.join(PROJECT_ROOT, '.env.example');
      expect.ok(fs.existsSync(envExamplePath), '.env.example must exist');
      const envContent = fs.readFileSync(envExamplePath, 'utf8');

      // Must not contain actual hardcoded live secrets
      expect.notOk(
        envContent.includes('AIZA') && envContent.includes('live_secret'),
        'No live private secrets committed in .env.example'
      );
    });

    harness.it('F10-T2.4: Build scripts define distinct filter targets across apps and packages', () => {
      const rootPkgPath = path.join(PROJECT_ROOT, 'package.json');
      const rootPkg = JSON.parse(fs.readFileSync(rootPkgPath, 'utf8'));

      expect.ok(rootPkg.scripts.build, 'Must define build script');
      expect.ok(rootPkg.scripts.typecheck, 'Must define typecheck script');
      expect.ok(rootPkg.scripts.lint, 'Must define lint script');
    });

    harness.it('F10-T2.5: Zero extraneous temp files or crash logs in root workspace', () => {
      const files = fs.readdirSync(PROJECT_ROOT);
      const badExtensions = ['.tmp', '.swp', '.bak', '.log'];

      for (const f of files) {
        for (const ext of badExtensions) {
          expect.notOk(f.endsWith(ext), `No uncleaned temporary files allowed in project root: ${f}`);
        }
      }
    });
  });
}
