'use client';

import { useSyncExternalStore } from 'react';

export type RfqStatus = 'PENDING' | 'ACCEPTED' | 'COUNTERED' | 'ESCROW_LOCKED' | 'REJECTED' | 'SETTLED';

export interface RfqItem {
  id: string; // e.g. "RFQ-7101"
  lotId?: string;
  crop: string;
  sellerCluster: string;
  volumeKg: number;
  askingRate: number;
  bidRate: number;
  status: RfqStatus;
  escrowLocked?: boolean;
  escrowAmount?: number;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  buyerName?: string;
  frequencyPerWeek?: number;
  cadence?: string;
}

export const INITIAL_RFQ_SEED: RfqItem[] = [
  {
    id: 'RFQ-7101',
    lotId: 'LOT-PB-7703',
    crop: 'Mustard / Rapeseed',
    sellerCluster: 'Phulera Mustard Producers',
    volumeKg: 10000,
    askingRate: 88,
    bidRate: 86.5,
    status: 'ACCEPTED',
    escrowLocked: true,
    escrowAmount: 865000,
    createdAt: 'Yesterday, 02:40 PM',
    buyerName: 'Adani Wilmar Agri Procurement',
  },
  {
    id: 'RFQ-7102',
    lotId: 'LOT-MP-9302',
    crop: 'Wheat Sharbati',
    sellerCluster: 'Malwa Sharbati Cluster',
    volumeKg: 15000,
    askingRate: 26,
    bidRate: 25.0,
    status: 'PENDING',
    escrowLocked: false,
    createdAt: 'Today, 07:45 AM',
    buyerName: 'Cargill India Foods',
  },
];

const STORAGE_KEY = 'farmlink_buyer_rfqs';
let memoryStore: RfqItem[] = [...INITIAL_RFQ_SEED];
let isInitialized = false;
const listeners = new Set<() => void>();

function syncFromStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_RFQ_SEED));
      memoryStore = [...INITIAL_RFQ_SEED];
      return;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      memoryStore = parsed;
    } else {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_RFQ_SEED));
      memoryStore = [...INITIAL_RFQ_SEED];
    }
  } catch {
    // preserve existing memoryStore
  }
}

function safeGetLocalStorage(): RfqItem[] {
  if (!isInitialized && typeof window !== 'undefined') {
    isInitialized = true;
    syncFromStorage();
  }
  return memoryStore;
}

function safeSetLocalStorage(items: RfqItem[]): void {
  memoryStore = items;
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      window.dispatchEvent(
        new CustomEvent('farmlink_store_updated', {
          detail: { store: 'rfq' },
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
    if (custom.detail?.store === 'rfq') {
      notify();
    }
  });
}

export const rfqStore = {
  getRfqs(): RfqItem[] {
    return safeGetLocalStorage();
  },

  getRfqById(id: string): RfqItem | undefined {
    const all = safeGetLocalStorage();
    return all.find((rfq) => rfq.id.toLowerCase() === id.toLowerCase());
  },

  submitRfq(rfq: Partial<RfqItem>): RfqItem {
    const current = safeGetLocalStorage();
    const volumeKg = Number(rfq.volumeKg || 1000);
    const bidRate = Number(rfq.bidRate || 25);
    const askingRate = Number(rfq.askingRate || 28);

    const newRfq: RfqItem = {
      id: rfq.id || `RFQ-${7100 + current.length + 1}`,
      lotId: rfq.lotId,
      crop: rfq.crop || 'Tomato',
      sellerCluster: rfq.sellerCluster || 'Verified Grower Cluster',
      volumeKg,
      askingRate,
      bidRate,
      status: rfq.status || 'PENDING',
      escrowLocked: rfq.escrowLocked ?? false,
      escrowAmount: volumeKg * bidRate,
      notes: rfq.notes,
      createdAt: rfq.createdAt || 'Just now',
      buyerName: rfq.buyerName || 'Verified Institutional Buyer',
      frequencyPerWeek: rfq.frequencyPerWeek,
      cadence: rfq.cadence,
    };

    const updated = [newRfq, ...current];
    safeSetLocalStorage(updated);
    return newRfq;
  },

  updateStatus(id: string, status: RfqStatus, notes?: string): boolean {
    const current = safeGetLocalStorage();
    let found = false;
    const updated = current.map((rfq) => {
      if (rfq.id.toLowerCase() === id.toLowerCase()) {
        found = true;
        const escrowLocked = status === 'ESCROW_LOCKED' || status === 'ACCEPTED' ? true : rfq.escrowLocked;
        return {
          ...rfq,
          status,
          escrowLocked,
          notes: notes !== undefined ? notes : rfq.notes,
          updatedAt: 'Just now',
        };
      }
      return rfq;
    });
    if (found) {
      safeSetLocalStorage(updated);
    }
    return found;
  },

  lockEscrow(id: string): boolean {
    return this.updateStatus(id, 'ESCROW_LOCKED', 'Funds locked into verified tri-party escrow contract');
  },

  resetToSeed(): void {
    safeSetLocalStorage([...INITIAL_RFQ_SEED]);
  },

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

export function useRfqStore() {
  const rfqs = useSyncExternalStore(
    rfqStore.subscribe,
    rfqStore.getRfqs,
    () => INITIAL_RFQ_SEED
  );

  return {
    rfqs,
    getRfqs: rfqStore.getRfqs,
    getRfqById: rfqStore.getRfqById,
    submitRfq: rfqStore.submitRfq,
    updateStatus: rfqStore.updateStatus,
    lockEscrow: rfqStore.lockEscrow,
    resetToSeed: rfqStore.resetToSeed,
  };
}
