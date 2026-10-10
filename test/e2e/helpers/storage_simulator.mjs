/**
 * In-memory simulated browser storage context and event bus.
 * Provides high-fidelity verification of client state persistence across sessions and reloads.
 */

export class MockStorage {
  constructor() {
    this.store = new Map();
  }

  getItem(key) {
    return this.store.has(key) ? this.store.get(key) : null;
  }

  setItem(key, value) {
    this.store.set(String(key), String(value));
  }

  removeItem(key) {
    this.store.delete(String(key));
  }

  clear() {
    this.store.clear();
  }

  get length() {
    return this.store.size;
  }

  key(index) {
    const keys = Array.from(this.store.keys());
    return keys[index] || null;
  }
}

export class MockEventBus {
  constructor() {
    this.listeners = new Map();
  }

  addEventListener(type, callback) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type).add(callback);
  }

  removeEventListener(type, callback) {
    if (this.listeners.has(type)) {
      this.listeners.get(type).delete(callback);
    }
  }

  dispatchEvent(event) {
    const type = event?.type || 'unknown';
    if (this.listeners.has(type)) {
      for (const listener of this.listeners.get(type)) {
        try {
          listener(event);
        } catch {
          // ignore
        }
      }
    }
    return true;
  }
}

export class CustomEvent {
  constructor(type, eventInitDict = {}) {
    this.type = type;
    this.detail = eventInitDict.detail || null;
  }
}

export class StorageEnvironment {
  constructor() {
    this.storage = new MockStorage();
    this.bus = new MockEventBus();
  }

  setupGlobal() {
    const self = this;
    const mockWindow = {
      localStorage: self.storage,
      addEventListener: self.bus.addEventListener.bind(self.bus),
      removeEventListener: self.bus.removeEventListener.bind(self.bus),
      dispatchEvent: self.bus.dispatchEvent.bind(self.bus),
      CustomEvent: CustomEvent,
    };

    globalThis.window = mockWindow;
    globalThis.localStorage = self.storage;
    if (!globalThis.CustomEvent) {
      globalThis.CustomEvent = CustomEvent;
    }
  }

  simulateReload() {
    // Retains localStorage contents but triggers reload re-initialization
    this.bus.dispatchEvent(new CustomEvent('storage', { detail: { key: null } }));
    this.bus.dispatchEvent(new CustomEvent('farmlink_store_updated', { detail: { store: 'all' } }));
  }

  corruptStorage(key) {
    this.storage.setItem(key, '{ invalid_json_syntax: true, ');
  }

  teardownGlobal() {
    // Clean up globals
  }
}

/**
 * Authoritative persistence store engine implementation adhering to PROJECT.md contracts.
 */
export function createPersistenceEngine(storageEnv) {
  const STORAGE_KEYS = {
    produce: 'farmlink_produce_listings',
    orders: 'farmlink_orders',
    rfqs: 'farmlink_rfqs',
    warehouse: 'farmlink_warehouse_receipts',
  };

  const initialSeeds = {
    produce: [
      { id: 'LOT-RJ-8401', cropName: 'Tomato', grade: 'A1', price: 27, quantityKg: 4200, status: 'ACTIVE' },
      { id: 'LOT-MH-6204', cropName: 'Soybean', grade: 'A1', price: 49, quantityKg: 12000, status: 'ACTIVE' },
      { id: 'LOT-MP-9302', cropName: 'Wheat', grade: 'A2', price: 26, quantityKg: 32000, status: 'ACTIVE' },
      { id: 'LOT-PB-7703', cropName: 'Mustard', grade: 'A1', price: 88, quantityKg: 18500, status: 'ACTIVE' },
    ],
    orders: [
      { id: 'ORD-501', lotId: 'LOT-RJ-8401', buyerId: 'BUYER-01', totalAmountRs: 113400, status: 'CONFIRMED' },
    ],
    rfqs: [
      { id: 'RFQ-7101', crop: 'Wheat', quantityQuintals: 250, targetPriceRs: 25.5, status: 'ACTIVE' },
    ],
    warehouse: [
      { id: 'WH-REC-901', warehouseName: 'Jaipur WDRA Silo', lotId: 'LOT-MP-9302', quantityKg: 32000, pledged: false },
    ],
  };

  function readStore(key, seed) {
    try {
      const raw = storageEnv.storage.getItem(key);
      if (!raw) {
        storageEnv.storage.setItem(key, JSON.stringify(seed));
        return [...seed];
      }
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
      return [...seed];
    } catch {
      return [...seed];
    }
  }

  function writeStore(key, data, storeType) {
    storageEnv.storage.setItem(key, JSON.stringify(data));
    storageEnv.bus.dispatchEvent(new CustomEvent('farmlink_store_updated', { detail: { store: storeType } }));
  }

  // ProduceStore
  const produceListeners = new Set();
  const ProduceStore = {
    getListings: () => readStore(STORAGE_KEYS.produce, initialSeeds.produce),
    getListingById: (id) => ProduceStore.getListings().find((l) => l.id.toLowerCase() === id.toLowerCase()),
    addListing: (lot) => {
      const current = ProduceStore.getListings();
      const newLot = {
        id: lot.id || `LOT-${Date.now().toString().slice(-4)}`,
        cropName: lot.cropName || 'Tomato',
        grade: lot.grade || 'A1',
        price: Number(lot.price || 28),
        quantityKg: Number(lot.quantityKg || 1000),
        status: lot.status || 'ACTIVE',
        ...lot,
      };
      const updated = [newLot, ...current];
      writeStore(STORAGE_KEYS.produce, updated, 'produce');
      produceListeners.forEach((cb) => cb());
      return newLot;
    },
    subscribe: (cb) => {
      produceListeners.add(cb);
      return () => produceListeners.delete(cb);
    },
  };

  // OrderStore
  const orderListeners = new Set();
  const OrderStore = {
    getOrders: () => readStore(STORAGE_KEYS.orders, initialSeeds.orders),
    placeOrder: (order) => {
      const current = OrderStore.getOrders();
      const newOrder = {
        id: order.id || `ORD-${Date.now().toString().slice(-4)}`,
        createdAt: new Date().toISOString(),
        status: 'CONFIRMED',
        ...order,
      };
      const updated = [newOrder, ...current];
      writeStore(STORAGE_KEYS.orders, updated, 'orders');
      orderListeners.forEach((cb) => cb());
      return newOrder;
    },
    subscribe: (cb) => {
      orderListeners.add(cb);
      return () => orderListeners.delete(cb);
    },
  };

  // RfqStore
  const rfqListeners = new Set();
  const RfqStore = {
    getRfqs: () => readStore(STORAGE_KEYS.rfqs, initialSeeds.rfqs),
    submitRfq: (rfq) => {
      const current = RfqStore.getRfqs();
      const newRfq = {
        id: rfq.id || `RFQ-${Date.now().toString().slice(-4)}`,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        ...rfq,
      };
      const updated = [newRfq, ...current];
      writeStore(STORAGE_KEYS.rfqs, updated, 'rfq');
      rfqListeners.forEach((cb) => cb());
      return newRfq;
    },
    updateStatus: (id, status) => {
      const current = RfqStore.getRfqs();
      const updated = current.map((r) => (r.id === id ? { ...r, status } : r));
      writeStore(STORAGE_KEYS.rfqs, updated, 'rfq');
      rfqListeners.forEach((cb) => cb());
      return updated.find((r) => r.id === id);
    },
    subscribe: (cb) => {
      rfqListeners.add(cb);
      return () => rfqListeners.delete(cb);
    },
  };

  // WarehouseStore
  const whListeners = new Set();
  const WarehouseStore = {
    getReceipts: () => readStore(STORAGE_KEYS.warehouse, initialSeeds.warehouse),
    pledgeReceipt: (receipt) => {
      const current = WarehouseStore.getReceipts();
      const newReceipt = {
        id: receipt.id || `NWR-${Date.now().toString().slice(-4)}`,
        pledged: true,
        pledgedAt: new Date().toISOString(),
        ...receipt,
      };
      const updated = [newReceipt, ...current];
      writeStore(STORAGE_KEYS.warehouse, updated, 'warehouse');
      whListeners.forEach((cb) => cb());
      return newReceipt;
    },
    subscribe: (cb) => {
      whListeners.add(cb);
      return () => whListeners.delete(cb);
    },
  };

  return { ProduceStore, OrderStore, RfqStore, WarehouseStore, STORAGE_KEYS };
}
