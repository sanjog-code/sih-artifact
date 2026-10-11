'use client';

import { useSyncExternalStore } from 'react';

export type ProduceCategory = 'vegetables' | 'oilseeds' | 'grains' | 'pulses' | 'fruits';
export type ProduceGrade = 'A1' | 'A2' | 'B' | 'C';
export type ProduceLotStatus = 'ACTIVE' | 'PAUSED' | 'IN_WAREHOUSE' | 'SOLD' | 'DISPATCHED' | 'ESCROW_LOCKED';

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
  farmAddress?: string;
  farmCoordinates?: { lat: number; lng: number };
  pincode?: string;
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
    farmAddress: 'Khasra 412, Jaitpura Farm, Phulera Tehsil',
    pincode: '303338',
    farmCoordinates: { lat: 26.8722, lng: 75.2415 },
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
    farmAddress: 'Plot 18, Wardha Road Farm Cluster, Nagpur',
    pincode: '440015',
    farmCoordinates: { lat: 21.1458, lng: 79.0882 },
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
    farmAddress: 'Dewas Highway Agrarian Locus, Ujjain',
    pincode: '456010',
    farmCoordinates: { lat: 23.1765, lng: 75.7885 },
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
    farmAddress: 'Chomu Mandi Link Farm #4, Jaipur Rural',
    pincode: '303702',
    farmCoordinates: { lat: 27.1683, lng: 75.7208 },
  },
  {
    id: 'LOT-UP-5104',
    nameKey: 'cropPotato',
    cropName: 'Potato',
    category: 'vegetables',
    grade: 'A1',
    price: 22,
    quantity: '22,000 kg',
    quantityKg: 22000,
    location: 'Agra Cold Storage Vault #2',
    cluster: 'Taj Agrarian Producer Company',
    harvestDate: 'Oct 05, 2026',
    status: 'ACTIVE',
    farmerName: 'Kailash Meena',
    farmAddress: 'Fatehabad Road Farmland, Agra',
    pincode: '282001',
    farmCoordinates: { lat: 27.1767, lng: 78.0081 },
  },
  {
    id: 'LOT-MH-4205',
    nameKey: 'cropOnion',
    cropName: 'Onion',
    category: 'vegetables',
    grade: 'A1',
    price: 24,
    quantity: '15,000 kg',
    quantityKg: 15000,
    location: 'Nashik Agri Logistics Silo',
    cluster: 'Lasalgaon Onion Producers',
    harvestDate: 'Oct 06, 2026',
    status: 'ACTIVE',
    farmerName: 'Dnyaneshwar Shinde',
    farmAddress: 'Lasalgaon Mandi Locus, Nashik',
    pincode: '422306',
    farmCoordinates: { lat: 20.1452, lng: 74.2255 },
  },
  {
    id: 'LOT-RJ-2901',
    nameKey: 'cropChana',
    cropName: 'Chana',
    category: 'pulses',
    grade: 'A1',
    price: 62,
    quantity: '18,000 kg',
    quantityKg: 18000,
    location: 'Kota WDRA Silo #4',
    cluster: 'Hadoti Gram Producer Collective',
    harvestDate: 'Oct 07, 2026',
    status: 'ACTIVE',
    farmerName: 'Mukesh Choudhary',
    farmAddress: 'Ramganj Mandi Road, Kota',
    pincode: '324001',
    farmCoordinates: { lat: 25.2138, lng: 75.8648 },
  },
  {
    id: 'LOT-PB-3108',
    nameKey: 'cropPaddy',
    cropName: 'Paddy / Rice',
    category: 'grains',
    grade: 'A1',
    price: 32,
    quantity: '25,000 kg',
    quantityKg: 25000,
    location: 'Amritsar Regional Depot',
    cluster: 'Majha Agro Producers',
    harvestDate: 'Oct 05, 2026',
    status: 'ACTIVE',
    farmerName: 'Gurpreet Brar',
    farmAddress: 'GT Road Silo Complex, Amritsar',
    pincode: '143001',
    farmCoordinates: { lat: 31.634, lng: 74.8723 },
  },
  {
    id: 'LOT-GJ-7102',
    nameKey: 'cropGroundnut',
    cropName: 'Groundnut',
    category: 'oilseeds',
    grade: 'A1',
    price: 68,
    quantity: '14,000 kg',
    quantityKg: 14000,
    location: 'Junagadh Oilseed Terminal',
    cluster: 'Saurashtra Groundnut Cooperative',
    harvestDate: 'Oct 03, 2026',
    status: 'ACTIVE',
    farmerName: 'Bhavesh Patel',
    farmAddress: 'Dhoraji Highway Agro Center, Junagadh',
    pincode: '362001',
    farmCoordinates: { lat: 21.5222, lng: 70.4579 },
  },
  {
    id: 'LOT-HP-8803',
    nameKey: 'cropApple',
    cropName: 'Apple',
    category: 'fruits',
    grade: 'A1',
    price: 85,
    quantity: '8,500 kg',
    quantityKg: 8500,
    location: 'Shimla CA Storage Depot',
    cluster: 'Himachal Orchardists Collective',
    harvestDate: 'Oct 07, 2026',
    status: 'ACTIVE',
    farmerName: 'Surender Thakur',
    farmAddress: 'Kotkhai Apple Valley, Shimla',
    pincode: '171202',
    farmCoordinates: { lat: 31.1048, lng: 77.1734 },
  },
  {
    id: 'LOT-GJ-9402',
    nameKey: 'cropMango',
    cropName: 'Mango',
    category: 'fruits',
    grade: 'A1',
    price: 110,
    quantity: '6,200 kg',
    quantityKg: 6200,
    location: 'Talala Gir APMC Terminal',
    cluster: 'Gir Kesar Producers Cooperative',
    harvestDate: 'Oct 08, 2026',
    status: 'ACTIVE',
    farmerName: 'Mansukh Vala',
    farmAddress: 'Talala Foothill Orchard, Gir Somnath',
    pincode: '362150',
    farmCoordinates: { lat: 21.0543, lng: 70.5287 },
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

  deleteListing(id: string): boolean {
    const current = safeGetLocalStorage();
    const updated = current.filter((item) => item.id.toLowerCase() !== id.toLowerCase());
    if (updated.length !== current.length) {
      safeSetLocalStorage(updated);
      return true;
    }
    return false;
  },

  togglePauseListing(id: string): boolean {
    const current = safeGetLocalStorage();
    let found = false;
    const updated = current.map((item) => {
      if (item.id.toLowerCase() === id.toLowerCase()) {
        found = true;
        const newStatus = item.status === 'PAUSED' ? 'ACTIVE' : 'PAUSED';
        return { ...item, status: newStatus as ProduceLotStatus };
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
    deleteListing: produceStore.deleteListing,
    togglePauseListing: produceStore.togglePauseListing,
    resetToSeed: produceStore.resetToSeed,
  };
}
