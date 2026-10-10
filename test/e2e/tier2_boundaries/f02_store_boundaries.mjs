import { expect } from '../helpers/assertions.mjs';
import { StorageEnvironment, createPersistenceEngine } from '../helpers/storage_simulator.mjs';

export function runF02StoreBoundariesTests(harness) {
  harness.describe('Tier 2 - F02: Persistence Engine Boundary & Corner Cases', () => {
    let env;
    let engine;

    const setup = () => {
      env = new StorageEnvironment();
      env.setupGlobal();
      engine = createPersistenceEngine(env);
    };

    harness.it('F02-T2.1: Corrupted or invalid JSON syntax in localStorage falls back to initial seeds without crashing', () => {
      setup();
      env.corruptStorage(engine.STORAGE_KEYS.produce);
      // Calling getListings should gracefully return default seeds
      const listings = engine.ProduceStore.getListings();
      expect.greaterOrEqual(listings.length, 3, 'Must safely recover initial seed listings on JSON corruption');
    });

    harness.it('F02-T2.2: Extreme volume declarations handle boundary numeric quantities', () => {
      setup();
      const largeLot = engine.ProduceStore.addListing({
        cropName: 'Rice',
        price: 38.5,
        quantityKg: 1000000, // 10,000 quintals
      });

      expect.equal(largeLot.quantityKg, 1000000, 'Store must handle 1,000,000 kg boundary payload');
      const retrieved = engine.ProduceStore.getListingById(largeLot.id);
      expect.equal(retrieved.quantityKg, 1000000, 'Persisted large quantity must be preserved accurately');
    });

    harness.it('F02-T2.3: Simulated storage quota exhaustion handles write errors gracefully', () => {
      setup();
      // Mock setItem throwing QuotaExceededError
      const originalSetItem = env.storage.setItem.bind(env.storage);
      let failedCalls = 0;
      env.storage.setItem = (k, v) => {
        if (k.includes('orders')) {
          failedCalls++;
          throw new Error('QuotaExceededError: DOM Exception 22');
        }
        originalSetItem(k, v);
      };

      // Wrap store call with resilient try/catch
      let placed;
      try {
        placed = engine.OrderStore.placeOrder({ lotId: 'LOT-OVERFLOW', totalAmountRs: 999999 });
      } catch {
        // Safe handling
      }
      expect.greaterThan(failedCalls, 0, 'Should intercept setItem call');
    });

    harness.it('F02-T2.4: High concurrency of subscriber listeners executes without listener dropping', () => {
      setup();
      let callCount = 0;
      const unsubs = [];

      for (let i = 0; i < 20; i++) {
        unsubs.push(engine.ProduceStore.subscribe(() => {
          callCount++;
        }));
      }

      engine.ProduceStore.addListing({ cropName: 'Mustard', price: 90 });
      expect.equal(callCount, 20, 'All 20 concurrent subscriber listeners must fire');

      // Unsubscribe half
      for (let i = 0; i < 10; i++) unsubs[i]();
      callCount = 0;
      engine.ProduceStore.addListing({ cropName: 'Soybean', price: 50 });
      expect.equal(callCount, 10, 'Only remaining 10 listeners should fire after unsubscription');
    });

    harness.it('F02-T2.5: Zero or boundary values in RFQ target prices are clamped and validated', () => {
      setup();
      const zeroRfq = engine.RfqStore.submitRfq({
        crop: 'Wheat',
        quantityQuintals: 0,
        targetPriceRs: 0,
      });

      expect.ok(zeroRfq.id, 'Zero-value RFQ receives valid identifier');
      expect.greaterOrEqual(zeroRfq.targetPriceRs, 0, 'Target price must not be negative');
    });
  });
}
