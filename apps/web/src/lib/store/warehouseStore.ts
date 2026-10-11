'use client';

import { useSyncExternalStore } from 'react';

export type WarehouseReceiptStatus = 'DEPOSITED' | 'PLEDGED' | 'RELEASED';

export interface WarehouseSlotBooking {
  id: string; // e.g. "SLOT-WDRA-8801"
  depotName: string;
  depotLocation: string;
  dockNumber: string;
  farmerName: string;
  farmerPhone: string;
  commodity: string;
  estimatedVolumeKg: number;
  scheduledDate: string; // e.g. "2026-10-12"
  timeSlot: string; // e.g. "08:00 AM - 10:00 AM"
  status: 'CONFIRMED' | 'UNLOADING' | 'COMPLETED' | 'CANCELLED';
  eNwrPledgeEligible: boolean;
  createdAt: string;
}

export const INITIAL_SLOT_SEED: WarehouseSlotBooking[] = [
  {
    id: 'SLOT-WDRA-8801',
    depotName: 'Jaipur North WDRA Hub',
    depotLocation: 'Chomu Road, Jaipur',
    dockNumber: 'Dock Bay 2',
    farmerName: 'Rameshwar Lal Jat',
    farmerPhone: '+91 98290 44102',
    commodity: 'Wheat (Sharbati)',
    estimatedVolumeKg: 5000,
    scheduledDate: 'Tomorrow, Oct 12',
    timeSlot: '08:00 AM - 10:00 AM',
    status: 'CONFIRMED',
    eNwrPledgeEligible: true,
    createdAt: 'Today, 09:30 AM',
  },
  {
    id: 'SLOT-WDRA-8802',
    depotName: 'Phulera Depot #3',
    depotLocation: 'Sambhar Lake Agrarian Corridor',
    dockNumber: 'Cold Bay 1',
    farmerName: 'Baldev Singh',
    farmerPhone: '+91 98140 88219',
    commodity: 'Mustard Bold',
    estimatedVolumeKg: 8500,
    scheduledDate: 'Oct 13, 2026',
    timeSlot: '11:00 AM - 01:00 PM',
    status: 'CONFIRMED',
    eNwrPledgeEligible: true,
    createdAt: 'Yesterday',
  },
];

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

  bookSlot(slot: Omit<WarehouseSlotBooking, 'id' | 'createdAt' | 'status'>): WarehouseSlotBooking {
    const newSlot: WarehouseSlotBooking = {
      ...slot,
      id: `SLOT-WDRA-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'CONFIRMED',
      createdAt: 'Just now',
    };
    if (typeof window !== 'undefined') {
      try {
        const raw = window.localStorage.getItem('farmlink_warehouse_slots');
        const slots: WarehouseSlotBooking[] = raw ? JSON.parse(raw) : [...INITIAL_SLOT_SEED];
        const updated = [newSlot, ...slots];
        window.localStorage.setItem('farmlink_warehouse_slots', JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('farmlink_store_updated', { detail: { store: 'warehouse' } }));
      } catch {
        // ignore
      }
    }
    notify();
    return newSlot;
  },

  getSlots(): WarehouseSlotBooking[] {
    if (typeof window === 'undefined') return INITIAL_SLOT_SEED;
    try {
      const raw = window.localStorage.getItem('farmlink_warehouse_slots');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_SLOT_SEED;
  },

  updateSlotStatus(id: string, status: WarehouseSlotBooking['status']): void {
    if (typeof window !== 'undefined') {
      try {
        const raw = window.localStorage.getItem('farmlink_warehouse_slots');
        const slots: WarehouseSlotBooking[] = raw ? JSON.parse(raw) : [...INITIAL_SLOT_SEED];
        const updated = slots.map((s) => (s.id === id ? { ...s, status } : s));
        window.localStorage.setItem('farmlink_warehouse_slots', JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('farmlink_store_updated', { detail: { store: 'warehouse' } }));
      } catch {
        // ignore
      }
    }
    notify();
  },

  resetToSeed(): void {
    safeSetLocalStorage([...INITIAL_WAREHOUSE_SEED]);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem('farmlink_warehouse_slots', JSON.stringify(INITIAL_SLOT_SEED));
      } catch {
        // ignore
      }
    }
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

  const slots = useSyncExternalStore(
    warehouseStore.subscribe,
    warehouseStore.getSlots,
    () => INITIAL_SLOT_SEED
  );

  return {
    receipts,
    slots,
    getReceipts: warehouseStore.getReceipts,
    getReceiptById: warehouseStore.getReceiptById,
    recordIntake: warehouseStore.recordIntake,
    pledgeReceipt: warehouseStore.pledgeReceipt,
    bookSlot: warehouseStore.bookSlot,
    getSlots: warehouseStore.getSlots,
    updateSlotStatus: warehouseStore.updateSlotStatus,
    resetToSeed: warehouseStore.resetToSeed,
  };
}
