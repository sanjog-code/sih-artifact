/**
 * Minimalist, high-performance E2E assertion and test harness.
 */
import assert from 'node:assert';

export class TestHarness {
  constructor() {
    this.suites = [];
    this.currentSuite = null;
    this.totalTests = 0;
    this.passed = 0;
    this.failed = 0;
    this.errors = [];
    this.startTime = 0;
    this.endTime = 0;
  }

  describe(name, fn) {
    const suite = { name, tests: [], passed: 0, failed: 0, duration: 0 };
    this.suites.push(suite);
    this.currentSuite = suite;
    const start = performance.now();
    try {
      fn();
    } finally {
      suite.duration = performance.now() - start;
      this.currentSuite = null;
    }
  }

  async describeAsync(name, fn) {
    const suite = { name, tests: [], passed: 0, failed: 0, duration: 0 };
    this.suites.push(suite);
    this.currentSuite = suite;
    const start = performance.now();
    try {
      await fn();
    } finally {
      suite.duration = performance.now() - start;
      this.currentSuite = null;
    }
  }

  it(name, testFn) {
    this.totalTests++;
    const testRecord = { name, passed: false, error: null, duration: 0 };
    if (this.currentSuite) {
      this.currentSuite.tests.push(testRecord);
    }

    const start = performance.now();
    try {
      const result = testFn();
      if (result && typeof result.then === 'function') {
        throw new Error(`Test "${name}" returned a Promise. Use itAsync instead of it.`);
      }
      testRecord.passed = true;
      testRecord.duration = performance.now() - start;
      this.passed++;
      if (this.currentSuite) this.currentSuite.passed++;
    } catch (err) {
      testRecord.passed = false;
      testRecord.error = err;
      testRecord.duration = performance.now() - start;
      this.failed++;
      if (this.currentSuite) this.currentSuite.failed++;
      this.errors.push({ suite: this.currentSuite?.name || 'Root', test: name, error: err });
    }
  }

  async itAsync(name, testFn) {
    this.totalTests++;
    const testRecord = { name, passed: false, error: null, duration: 0 };
    if (this.currentSuite) {
      this.currentSuite.tests.push(testRecord);
    }

    const start = performance.now();
    try {
      await testFn();
      testRecord.passed = true;
      testRecord.duration = performance.now() - start;
      this.passed++;
      if (this.currentSuite) this.currentSuite.passed++;
    } catch (err) {
      testRecord.passed = false;
      testRecord.error = err;
      testRecord.duration = performance.now() - start;
      this.failed++;
      if (this.currentSuite) this.currentSuite.failed++;
      this.errors.push({ suite: this.currentSuite?.name || 'Root', test: name, error: err });
    }
  }
}

export const harness = new TestHarness();

export const expect = {
  equal: (actual, expected, msg) => assert.strictEqual(actual, expected, msg),
  deepEqual: (actual, expected, msg) => assert.deepStrictEqual(actual, expected, msg),
  ok: (val, msg) => assert.ok(val, msg),
  notOk: (val, msg) => assert.ok(!val, msg),
  match: (actual, regex, msg) => assert.match(String(actual), regex, msg),
  throws: (fn, errLike, msg) => assert.throws(fn, errLike, msg),
  closeTo: (actual, expected, delta = 0.01, msg) => {
    const diff = Math.abs(actual - expected);
    assert.ok(diff <= delta, `${msg || 'Value outside tolerance'}: expected ${expected} ± ${delta}, got ${actual}`);
  },
  greaterThan: (actual, threshold, msg) => {
    assert.ok(actual > threshold, `${msg || 'Value too small'}: expected ${actual} > ${threshold}`);
  },
  greaterOrEqual: (actual, threshold, msg) => {
    assert.ok(actual >= threshold, `${msg || 'Value too small'}: expected ${actual} >= ${threshold}`);
  },
  lessThan: (actual, threshold, msg) => {
    assert.ok(actual < threshold, `${msg || 'Value too large'}: expected ${actual} < ${threshold}`);
  },
  lessOrEqual: (actual, threshold, msg) => {
    assert.ok(actual <= threshold, `${msg || 'Value too large'}: expected ${actual} <= ${threshold}`);
  },
};
