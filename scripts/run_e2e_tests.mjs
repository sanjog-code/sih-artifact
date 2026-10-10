#!/usr/bin/env node

/**
 * FarmLink Comprehensive E2E Test Runner
 *
 * Executable: node scripts/run_e2e_tests.mjs (or npm run test:e2e)
 * Verifies all 4 tiers (Tiers 1-4) across all 12 core platform features.
 */

import { executeAllTests } from '../test/e2e/index.mjs';

async function main() {
  console.log('='.repeat(80));
  console.log('  FARMLINK COMPREHENSIVE E2E VERIFICATION RUNNER (TIERS 1 - 4)');
  console.log('='.repeat(80));
  console.log(`  Timestamp  : ${new Date().toISOString()}`);
  console.log(`  Node.js    : ${process.version}`);
  console.log(`  Platform   : ${process.platform} (${process.arch})`);
  console.log('='.repeat(80));
  console.log();

  const { harness, durationMs } = await executeAllTests();

  console.log('--- TEST EXECUTION REPORT ---');
  for (const suite of harness.suites) {
    const statusIcon = suite.failed === 0 ? '✓' : '✗';
    console.log(`\n${statusIcon} [${suite.name}] (${suite.passed}/${suite.tests.length} passed, ${suite.duration.toFixed(1)}ms)`);
    for (const test of suite.tests) {
      if (test.passed) {
        console.log(`    ✓ ${test.name} (${test.duration.toFixed(1)}ms)`);
      } else {
        console.log(`    ✗ ${test.name} (${test.duration.toFixed(1)}ms)`);
        console.log(`      Error: ${test.error?.message}`);
      }
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('  EXECUTIVE SUMMARY & COVERAGE CERTIFICATION');
  console.log('='.repeat(80));

  // Breakdown by tiers
  const tier1Suites = harness.suites.filter((s) => s.name.startsWith('Tier 1'));
  const tier2Suites = harness.suites.filter((s) => s.name.startsWith('Tier 2'));
  const tier3Suites = harness.suites.filter((s) => s.name.startsWith('Tier 3'));
  const tier4Suites = harness.suites.filter((s) => s.name.startsWith('Tier 4'));

  const countTier = (suites) => ({
    total: suites.reduce((acc, s) => acc + s.tests.length, 0),
    passed: suites.reduce((acc, s) => acc + s.passed, 0),
    failed: suites.reduce((acc, s) => acc + s.failed, 0),
  });

  const t1 = countTier(tier1Suites);
  const t2 = countTier(tier2Suites);
  const t3 = countTier(tier3Suites);
  const t4 = countTier(tier4Suites);

  console.log(`  Tier 1 (Functional Coverage)       : ${t1.passed} / ${t1.total} passed (min requirement: 55)`);
  console.log(`  Tier 2 (Boundaries & Corners)      : ${t2.passed} / ${t2.total} passed (min requirement: 55)`);
  console.log(`  Tier 3 (Cross-Feature Pairs)       : ${t3.passed} / ${t3.total} passed (min requirement: 12)`);
  console.log(`  Tier 4 (Real-World Scenarios)      : ${t4.passed} / ${t4.total} passed (min requirement: 6)`);
  console.log('-'.repeat(80));
  console.log(`  Total Test Cases Executed          : ${harness.totalTests} (min requirement: >= 128)`);
  console.log(`  Total Passed                       : ${harness.passed}`);
  console.log(`  Total Failed                       : ${harness.failed}`);
  console.log(`  Execution Duration                 : ${durationMs.toFixed(2)} ms`);
  console.log(`  Overall Suite Status               : ${harness.failed === 0 ? 'ALL TESTS PASSED (PASS)' : 'TESTS FAILED (FAIL)'}`);
  console.log('='.repeat(80));

  if (harness.failed > 0) {
    console.error(`\n❌ Test run failed with ${harness.failed} failing assertion(s).`);
    for (const err of harness.errors) {
      console.error(`\n[${err.suite}] ${err.test}`);
      console.error(err.error?.stack || err.error?.message);
    }
    process.exit(1);
  } else {
    console.log('\n✅ All E2E test assertions passed with exit code 0.');
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('Fatal unhandled error in E2E test runner:', err);
  process.exit(1);
});
