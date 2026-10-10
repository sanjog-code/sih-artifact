import { expect } from '../helpers/assertions.mjs';
import { StorageEnvironment, createPersistenceEngine } from '../helpers/storage_simulator.mjs';

export function runF02PersistenceTests(harness) {
  harness.describe('Tier 1 - F02: Reactive State Persistence Engine', () => {
    let env;
    let engine;

    const setup = () => {
      env = new StorageEnvironment();
      env.setupGlobal();
      engine = createPersistenceEngine(env);
    };

    harness.it('F02-T1.1: ProduceStore initializes with seed lots and persists new harvest declarations', () => {
      setup();
      const initialLots = engine.ProduceStore.getListings();
      expect.greaterOrEqual(initialLots.length, 3, 'ProduceStore should contain initial seed lots');

      const created = engine.ProduceStore.addListing({
        cropName: 'Wheat',
        grade: 'A1',
        price: 26.5,
        quantityKg: 5000,
      });

      expect.ok(created.id, 'Created lot must have an ID');
      const allAfter = engine.ProduceStore.getListings();
      expect.equal(allAfter.length, initialLots.length + 1, 'Listing count should increment by 1');
      expect.equal(allAfter[0].id, created.id, 'New lot should appear at the head of listings');

      // Verify persistence in raw storage
      const rawStored = JSON.parse(env.storage.getItem(engine.STORAGE_KEYS.produce));
      expect.equal(rawStored.length, allAfter.length, 'localStorage must reflect persisted listings');
    });

    harness.it('F02-T1.2: OrderStore records purchases and persists orders across sessions', () => {
      setup();
      const initialOrders = engine.OrderStore.getOrders();
      const newOrder = engine.OrderStore.placeOrder({
        lotId: 'LOT-RJ-8401',
        buyerName: 'National Agri Corp',
        totalAmountRs: 113400,
      });

      expect.ok(newOrder.id, 'New order must have an assigned ID');
      const ordersAfter = engine.OrderStore.getOrders();
      expect.equal(ordersAfter.length, initialOrders.length + 1, 'Order count should increment');

      const rawOrders = JSON.parse(env.storage.getItem(engine.STORAGE_KEYS.orders));
      expect.ok(rawOrders.some((o) => o.id === newOrder.id), 'Order must be persisted in localStorage');
    });

    harness.it('F02-T1.3: RfqStore submits bulk purchase offers and updates negotiation statuses', () => {
      setup();
      const rfq = engine.RfqStore.submitRfq({
        crop: 'Mustard',
        quantityQuintals: 150,
        targetPriceRs: 86.0,
      });

      expect.equal(rfq.status, 'ACTIVE', 'Initial RFQ status should be ACTIVE');
      const updated = engine.RfqStore.updateStatus(rfq.id, 'ACCEPTED');
      expect.equal(updated.status, 'ACCEPTED', 'Status should update to ACCEPTED');

      const currentRfqs = engine.RfqStore.getRfqs();
      const found = currentRfqs.find((r) => r.id === rfq.id);
      expect.equal(found.status, 'ACCEPTED', 'Persisted RFQ should have ACCEPTED status');
    });

    harness.it('F02-T1.4: WarehouseStore pledges e-NWR warehouse receipts', () => {
      setup();
      const receipt = engine.WarehouseStore.pledgeReceipt({
        id: 'NWR-TEST-101',
        warehouseName: 'Kota WDRA Certified Terminal',
        quantityKg: 20000,
      });

      expect.equal(receipt.pledged, true, 'Receipt must have pledged: true');
      const allReceipts = engine.WarehouseStore.getReceipts();
      expect.ok(allReceipts.some((r) => r.id === 'NWR-TEST-101' && r.pledged), 'Pledged receipt must persist in store');
    });

    harness.it('F02-T1.5: Subscriber callbacks fire synchronously upon store state mutations', () => {
      setup();
      let produceFired = false;
      let orderFired = false;

      const unsubProduce = engine.ProduceStore.subscribe(() => {
        produceFired = true;
      });
      const unsubOrder = engine.OrderStore.subscribe(() => {
        orderFired = true;
      });

      engine.ProduceStore.addListing({ cropName: 'Potato', price: 18 });
      expect.ok(produceFired, 'ProduceStore listener must trigger on addListing');

      engine.OrderStore.placeOrder({ lotId: 'LOT-POT-01', totalAmountRs: 5000 });
      expect.ok(orderFired, 'OrderStore listener must trigger on placeOrder');

      unsubProduce();
      unsubOrder();
    });
  });
}
