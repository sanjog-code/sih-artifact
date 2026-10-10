'use client';

import { useSyncExternalStore } from 'react';

export type WarehouseReceiptStatus = 'DEPOSITED' | 'PLEDGED' | 'RELEASED';

export interface WarehouseReceipt {
  id: string; // e.g. "ENWR-RJ-901"
  lotId: string;
  commodity: string;
  quantityKg: number;
  grade: string;
  warehouseName: string;
  warehouseAccreditation: string;
  storageLocation: string;
  intakeDate: string;
  moisturePercent: number;
  pledged: boolean;
  pledgeAmountRs?: number;
  pledgeBank?: string;
  status: WarehouseReceiptStatus;
}

export const INITIAL_WAREHOUSE_SEED: WarehouseReceipt[] = [
  {
    id: 'ENWR-RJ-901',
    lotId: 'LOT-PB-7703',
    commodity: 'Mustard / Rapeseed',
    quantityKg: 18500,
    grade: 'Grade A1',
    warehouseName: 'Jaipur North WDRA Hub',
    warehouseAccreditation: 'WDRA-REG-2024-884',
    storageLocation: 'Silo 4B',
    intakeDate: 'Oct 04, 2026',
    moisturePercent: 7.2,
    pledged: true,
    pledgeAmountRs: 1200000,
    pledgeBank: 'State Bank of India (Agri Desk)',
    status: 'PLEDGED',
  },
  {
    id: 'ENWR-MP-902',
    lotId: 'LOT-MP-9302',
    commodity: 'Wheat Sharbati',
    quantityKg: 32000,
    grade: 'Grade A2',
    warehouseName: 'Ujjain Central Silo',
    warehouseAccreditation: 'WDRA-REG-2023-412',
    storageLocation: 'Vault 2A',
    intakeDate: 'Sep 28, 2026',
    moisturePercent: 9.8,
    pledged: false,
    status: 'DEPOSITED',
  },
];

const STORAGE_KEY = 'farmlink_warehouse_receipts';
let memoryStore: WarehouseReceipt[] = [...INITIAL_WAREHOUSE_SEED];
let isInitialized = false;
const listeners = new Set<() => void>();

function syncFromStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_WAREHOUSE_SEED));
      memoryStore = [...INITIAL_WAREHOUSE_SEED];
      return;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      memoryStore = parsed;
    } else {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_WAREHOUSE_SEED));
      memoryStore = [...INITIAL_WAREHOUSE_SEED];
    }
  } catch {
    // preserve existing memoryStore
  }
}

function safeGetLocalStorage(): WarehouseReceipt[] {
  if (!isInitialized && typeof window !== 'undefined') {
    isInitialized = true;
    syncFromStorage();
  }
  return memoryStore;
}

function safeSetLocalStorage(items: WarehouseReceipt[]): void {
  memoryStore = items;
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      window.dispatchEvent(
        new CustomEvent('farmlink_store_updated', {
          detail: { store: 'warehouse' },
        })
      );
    } catch {
      // ignore
    }
  }
  notify();
}

function notify(): void {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // ignore
    }
  });
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY || e.key === null) {
      syncFromStorage();
      notify();
    }
  });

  window.addEventListener('farmlink_store_updated', (e: Event) => {
    const custom = e as CustomEvent;
    if (custom.detail?.store === 'warehouse') {
      notify();
    }
  });
}

export const warehouseStore = {
  getReceipts(): WarehouseReceipt[] {
    return safeGetLocalStorage();
  },

  getReceiptById(id: string): WarehouseReceipt | undefined {
    const all = safeGetLocalStorage();
    return all.find((r) => r.id.toLowerCase() === id.toLowerCase());
  },

  recordIntake(receipt: Partial<WarehouseReceipt>): WarehouseReceipt {
    const current = safeGetLocalStorage();
    const newReceipt: WarehouseReceipt = {
      id: receipt.id || `ENWR-${Date.now().toString().slice(-4)}`,
      lotId: receipt.lotId || `LOT-GEN-${Date.now().toString().slice(-4)}`,
      commodity: receipt.commodity || 'Agricultural Produce',
      quantityKg: Number(receipt.quantityKg || 5000),
      grade: receipt.grade || 'Grade A1',
      warehouseName: receipt.warehouseName || 'Jaipur North WDRA Hub',
      warehouseAccreditation: receipt.warehouseAccreditation || 'WDRA-REG-2024-884',
      storageLocation: receipt.storageLocation || 'Bay #1',
      intakeDate: receipt.intakeDate || 'Today',
      moisturePercent: Number(receipt.moisturePercent || 8.5),
      pledged: receipt.pledged ?? false,
      pledgeAmountRs: receipt.pledgeAmountRs,
      pledgeBank: receipt.pledgeBank,
      status: receipt.status || 'DEPOSITED',
    };

    const updated = [newReceipt, ...current];
    safeSetLocalStorage(updated);
    return newReceipt;
  },

  pledgeReceipt(id: string, amountRs = 500000, bank = 'State Bank of India (Agri Desk)'): boolean {
    const current = safeGetLocalStorage();
    let found = false;
    const updated = current.map((r) => {
      if (r.id.toLowerCase() === id.toLowerCase()) {
        found = true;
        return {
          ...r,
          pledged: true,
          pledgeAmountRs: amountRs,
          pledgeBank: bank,
          status: 'PLEDGED' as WarehouseReceiptStatus,
        };
      }
      return r;
    });
    if (found) {
      safeSetLocalStorage(updated);
    }
    return found;
  },

  resetToSeed(): void {
    safeSetLocalStorage([...INITIAL_WAREHOUSE_SEED]);
  },

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

export function useWarehouseStore() {
  const receipts = useSyncExternalStore(
    warehouseStore.subscribe,
    warehouseStore.getReceipts,
    () => INITIAL_WAREHOUSE_SEED
  );

  return {
    receipts,
    getReceipts: warehouseStore.getReceipts,
    getReceiptById: warehouseStore.getReceiptById,
    recordIntake: warehouseStore.recordIntake,
    pledgeReceipt: warehouseStore.pledgeReceipt,
    resetToSeed: warehouseStore.resetToSeed,
  };
}
