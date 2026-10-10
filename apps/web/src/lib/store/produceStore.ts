'use client';

import { useSyncExternalStore } from 'react';

export type ProduceCategory = 'vegetables' | 'oilseeds' | 'grains' | 'pulses' | 'fruits';
export type ProduceGrade = 'A1' | 'A2' | 'B' | 'C';
export type ProduceLotStatus = 'ACTIVE' | 'IN_WAREHOUSE' | 'SOLD' | 'DISPATCHED' | 'ESCROW_LOCKED';

export interface ProduceLotItem {
  id: string;
  nameKey: 'cropTomato' | 'cropMustard' | 'cropWheat' | 'cropSoybean' | string;
  cropName: string;
  category: ProduceCategory;
  grade: ProduceGrade;
  price: number; // ₹ per kg
  quantity: string; // e.g. "4,200 kg"
  quantityKg: number; // numeric kg
  location: string;
  cluster: string;
  harvestDate: string;
  status: ProduceLotStatus;
  farmerId?: string;
  farmerName?: string;
  description?: string;
}

export const INITIAL_PRODUCE_SEED: ProduceLotItem[] = [
  {
    id: 'LOT-RJ-8401',
    nameKey: 'cropTomato',
    cropName: 'Tomato',
    category: 'vegetables',
    grade: 'A1',
    price: 27,
    quantity: '4,200 kg',
    quantityKg: 4200,
    location: 'Phulera Depot #3',
    cluster: 'Jaitpura Farmer Cooperative',
    harvestDate: 'Today, 06:30 AM',
    status: 'ACTIVE',
    farmerName: 'Rameshwar Jat',
  },
  {
    id: 'LOT-MH-6204',
    nameKey: 'cropSoybean',
    cropName: 'Soybean',
    category: 'pulses',
    grade: 'A1',
    price: 49,
    quantity: '12,000 kg',
    quantityKg: 12000,
    location: 'Nagpur East Agro Hub',
    cluster: 'Vidarbha Farmer Collective',
    harvestDate: 'Oct 01, 2026',
    status: 'ACTIVE',
    farmerName: 'Sunil Patil',
  },
  {
    id: 'LOT-MP-9302',
    nameKey: 'cropWheat',
    cropName: 'Wheat',
    category: 'grains',
    grade: 'A2',
    price: 26,
    quantity: '32,000 kg',
    quantityKg: 32000,
    location: 'Ujjain Central Silo',
    cluster: 'Malwa Sharbati Cluster',
    harvestDate: 'Sep 28, 2026',
    status: 'ACTIVE',
    farmerName: 'Bhawani Singh',
  },
  {
    id: 'LOT-PB-7703',
    nameKey: 'cropMustard',
    cropName: 'Mustard',
    category: 'oilseeds',
    grade: 'A1',
    price: 88,
    quantity: '18,500 kg',
    quantityKg: 18500,
    location: 'Jaipur North WDRA Hub',
    cluster: 'Phulera Mustard Producers',
    harvestDate: 'Oct 04, 2026',
    status: 'ACTIVE',
    farmerName: 'Harpreet Dhillon',
  },
  {
    id: 'LOT-RJ-8402',
    nameKey: 'cropMustard',
    cropName: 'Mustard',
    category: 'oilseeds',
    grade: 'A1',
    price: 88,
    quantity: '18,500 kg',
    quantityKg: 18500,
    location: 'Jaipur North WDRA Hub',
    cluster: 'Phulera Mustard Producers',
    harvestDate: 'Oct 04, 2026',
    status: 'ACTIVE',
    farmerName: 'Kailash Meena',
  },
];

const STORAGE_KEY = 'farmlink_produce_listings';
let memoryStore: ProduceLotItem[] = [...INITIAL_PRODUCE_SEED];
let isInitialized = false;
const listeners = new Set<() => void>();

function syncFromStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PRODUCE_SEED));
      memoryStore = [...INITIAL_PRODUCE_SEED];
      return;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      memoryStore = parsed;
    } else {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PRODUCE_SEED));
      memoryStore = [...INITIAL_PRODUCE_SEED];
    }
  } catch {
    // preserve existing memoryStore
  }
}

function safeGetLocalStorage(): ProduceLotItem[] {
  if (!isInitialized && typeof window !== 'undefined') {
    isInitialized = true;
    syncFromStorage();
  }
  return memoryStore;
}

function safeSetLocalStorage(items: ProduceLotItem[]): void {
  memoryStore = items;
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      window.dispatchEvent(
        new CustomEvent('farmlink_store_updated', {
          detail: { store: 'produce' },
        })
      );
    } catch {
      // ignore quota or disabled errors
    }
  }
  notify();
}

function notify(): void {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // ignore subscriber error
    }
  });
}

// Global storage listener for cross-tab synchronisation
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY || e.key === null) {
      syncFromStorage();
      notify();
    }
  });

  window.addEventListener('farmlink_store_updated', (e: Event) => {
    const custom = e as CustomEvent;
    if (custom.detail?.store === 'produce') {
      notify();
    }
  });
}

export const produceStore = {
  getListings(): ProduceLotItem[] {
    return safeGetLocalStorage();
  },

  getListingById(id: string): ProduceLotItem | undefined {
    const all = safeGetLocalStorage();
    return all.find((item) => item.id.toLowerCase() === id.toLowerCase());
  },

  addListing(lot: Partial<ProduceLotItem>): ProduceLotItem {
    const current = safeGetLocalStorage();
    const qtyKg = Number(lot.quantityKg ?? 1000);
    const newLot: ProduceLotItem = {
      id: lot.id || `LOT-GEN-${Date.now().toString().slice(-4)}`,
      nameKey: lot.nameKey || (lot.cropName ? `crop${lot.cropName}` : 'cropTomato'),
      cropName: lot.cropName || 'Tomato',
      category: lot.category || 'vegetables',
      grade: lot.grade || 'A1',
      price: Number(lot.price || 28),
      quantity: lot.quantity || `${qtyKg.toLocaleString('en-IN')} kg`,
      quantityKg: qtyKg,
      location: lot.location || 'Local Regional Depot',
      cluster: lot.cluster || 'Verified Farmer Producer Org',
      harvestDate: lot.harvestDate || 'Just now',
      status: lot.status || 'ACTIVE',
      farmerId: lot.farmerId || 'FARMER-ME',
      farmerName: lot.farmerName || 'Registered Farmer',
      description: lot.description,
    };

    const updated = [newLot, ...current];
    safeSetLocalStorage(updated);
    return newLot;
  },

  updateListingQuantity(id: string, newQuantityKg: number): boolean {
    const current = safeGetLocalStorage();
    let found = false;
    const updated = current.map((item) => {
      if (item.id.toLowerCase() === id.toLowerCase()) {
        found = true;
        const clamped = Math.max(0, newQuantityKg);
        return {
          ...item,
          quantityKg: clamped,
          quantity: `${clamped.toLocaleString('en-IN')} kg`,
          status: (clamped === 0 ? 'SOLD' : item.status) as ProduceLotStatus,
        };
      }
      return item;
    });
    if (found) {
      safeSetLocalStorage(updated);
    }
    return found;
  },

  decrementQuantity(id: string, amountKg: number): boolean {
    const current = safeGetLocalStorage();
    let found = false;
    const updated = current.map((item) => {
      if (item.id.toLowerCase() === id.toLowerCase()) {
        found = true;
        const remaining = Math.max(0, item.quantityKg - amountKg);
        return {
          ...item,
          quantityKg: remaining,
          quantity: `${remaining.toLocaleString('en-IN')} kg`,
          status: (remaining === 0 ? 'SOLD' : item.status) as ProduceLotStatus,
        };
      }
      return item;
    });
    if (found) {
      safeSetLocalStorage(updated);
    }
    return found;
  },

  updateLotStatus(id: string, status: ProduceLotStatus): boolean {
    const current = safeGetLocalStorage();
    let found = false;
    const updated = current.map((item) => {
      if (item.id.toLowerCase() === id.toLowerCase()) {
        found = true;
        return { ...item, status };
      }
      return item;
    });
    if (found) {
      safeSetLocalStorage(updated);
    }
    return found;
  },

  resetToSeed(): void {
    safeSetLocalStorage([...INITIAL_PRODUCE_SEED]);
  },

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

export function useProduceStore() {
  const listings = useSyncExternalStore(
    produceStore.subscribe,
    produceStore.getListings,
    () => INITIAL_PRODUCE_SEED
  );

  return {
    listings,
    getListings: produceStore.getListings,
    getListingById: produceStore.getListingById,
    addListing: produceStore.addListing,
    updateListingQuantity: produceStore.updateListingQuantity,
    decrementQuantity: produceStore.decrementQuantity,
    updateLotStatus: produceStore.updateLotStatus,
    resetToSeed: produceStore.resetToSeed,
  };
}
