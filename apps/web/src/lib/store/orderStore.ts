'use client';

import { useSyncExternalStore } from 'react';

export type OrderStatus =
  | 'ORDER_PLACED'
  | 'PICKUP_SCHEDULED'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'ESCROW_RELEASED'
  | 'DISPUTED'
  | 'CONFIRMED'
  | 'PENDING'
  | 'ESCROW_LOCKED'
  | 'DISPATCHED';

export interface OrderItem {
  id: string; // e.g. "ORD-FL-2841"
  lotId?: string;
  items: string; // e.g. "250 kg Fresh Tomato"
  commodity: string;
  quantityKg: number;
  unitPrice: number;
  totalPrice: number;
  buyerType: 'CONSUMER' | 'BULK_BUYER';
  buyerName?: string;
  buyerPhone?: string;
  shippingAddress?: string;
  pincode?: string;
  deliveryCoordinates?: { lat: number; lng: number };
  farmAddress?: string;
  farmCoordinates?: { lat: number; lng: number };
  status: OrderStatus;
  escrowLocked: boolean;
  escrowTxHash?: string;
  platformCommissionRate?: number; // e.g. 0.05 (5%) down to 0.02 (2%)
  platformCommissionAmount?: number; // e.g. ₹500
  farmerPayoutAmount?: number; // e.g. ₹9,500
  createdAt: string;
  deliveryDate?: string;
  trackingId?: string;
}

export const INITIAL_ORDER_SEED: OrderItem[] = [
  {
    id: 'ORD-FL-2841',
    lotId: 'LOT-RJ-8401',
    items: '250 kg Fresh Tomato',
    commodity: 'Tomato',
    quantityKg: 250,
    unitPrice: 28,
    totalPrice: 7000,
    buyerType: 'CONSUMER',
    buyerName: 'Anita Sharma',
    shippingAddress: 'Sector 4, Vaishali Nagar, Jaipur',
    pincode: '302021',
    deliveryCoordinates: { lat: 26.9048, lng: 75.7483 },
    farmAddress: 'Khasra 412, Jaitpura Farm, Phulera Tehsil',
    farmCoordinates: { lat: 26.8722, lng: 75.2415 },
    status: 'DISPATCHED',
    escrowLocked: true,
    escrowTxHash: 'ESCROW-TX-99410-LOCKED',
    platformCommissionRate: 0.04,
    platformCommissionAmount: 280,
    farmerPayoutAmount: 6720,
    createdAt: 'Today, 09:15 AM',
    deliveryDate: 'Tomorrow Morning',
    trackingId: 'TRK-RJ-4412',
  },
  {
    id: 'ORD-FL-2839',
    lotId: 'LOT-MP-9302',
    items: '1,000 kg Sharbati Wheat',
    commodity: 'Wheat',
    quantityKg: 1000,
    unitPrice: 26,
    totalPrice: 26000,
    buyerType: 'BULK_BUYER',
    buyerName: 'ITC Agri Procurement',
    shippingAddress: 'Central Warehouse, Indore Highway',
    pincode: '452010',
    deliveryCoordinates: { lat: 22.7196, lng: 75.8577 },
    farmAddress: 'Dewas Highway Agrarian Locus, Ujjain',
    farmCoordinates: { lat: 23.1765, lng: 75.7885 },
    status: 'DELIVERED',
    escrowLocked: true,
    escrowTxHash: 'ESCROW-TX-99388-SETTLED',
    platformCommissionRate: 0.03,
    platformCommissionAmount: 780,
    farmerPayoutAmount: 25220,
    createdAt: '2 days ago',
    deliveryDate: 'Yesterday, 04:00 PM',
    trackingId: 'TRK-MP-8109',
  },
  {
    id: 'ORD-FL-2830',
    lotId: 'LOT-MH-6204',
    items: '500 kg Premium Soybean',
    commodity: 'Soybean',
    quantityKg: 500,
    unitPrice: 49,
    totalPrice: 24500,
    buyerType: 'CONSUMER',
    buyerName: 'Vikram Deshmukh',
    shippingAddress: 'Agro Retail Mart, Nagpur',
    status: 'DELIVERED',
    escrowLocked: true,
    escrowTxHash: 'ESCROW-TX-99212-SETTLED',
    platformCommissionRate: 0.04,
    platformCommissionAmount: 980,
    farmerPayoutAmount: 23520,
    createdAt: '5 days ago',
    deliveryDate: '4 days ago',
    trackingId: 'TRK-MH-1205',
  },
];

const STORAGE_KEY = 'farmlink_orders';
let memoryStore: OrderItem[] = [...INITIAL_ORDER_SEED];
let isInitialized = false;
const listeners = new Set<() => void>();

function syncFromStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ORDER_SEED));
      memoryStore = [...INITIAL_ORDER_SEED];
      return;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      memoryStore = parsed;
    } else {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ORDER_SEED));
      memoryStore = [...INITIAL_ORDER_SEED];
    }
  } catch {
    // preserve existing memoryStore
  }
}

function safeGetLocalStorage(): OrderItem[] {
  if (!isInitialized && typeof window !== 'undefined') {
    isInitialized = true;
    syncFromStorage();
  }
  return memoryStore;
}

function safeSetLocalStorage(items: OrderItem[]): void {
  memoryStore = items;
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      window.dispatchEvent(
        new CustomEvent('farmlink_store_updated', {
          detail: { store: 'order' },
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
    if (custom.detail?.store === 'order') {
      notify();
    }
  });
}

export const orderStore = {
  getOrders(): OrderItem[] {
    return safeGetLocalStorage();
  },

  getOrderById(id: string): OrderItem | undefined {
    const all = safeGetLocalStorage();
    return all.find((order) => order.id.toLowerCase() === id.toLowerCase());
  },

  placeOrder(order: Partial<OrderItem>): OrderItem {
    const current = safeGetLocalStorage();
    const qtyKg = Number(order.quantityKg || 10);
    const unitPrice = Number(order.unitPrice || 28);
    const totalPrice = Number(order.totalPrice || qtyKg * unitPrice);
    const commodity = order.commodity || 'Fresh Produce';
    const commRate = order.platformCommissionRate ?? 0.04;
    const commAmount = order.platformCommissionAmount ?? Math.round(totalPrice * commRate);
    const farmerPayout = order.farmerPayoutAmount ?? (totalPrice - commAmount);

    const newOrder: OrderItem = {
      id: order.id || `ORD-FL-${Math.floor(1000 + Math.random() * 9000)}`,
      lotId: order.lotId,
      items: order.items || `${qtyKg} kg ${commodity}`,
      commodity,
      quantityKg: qtyKg,
      unitPrice,
      totalPrice,
      buyerType: order.buyerType || 'CONSUMER',
      buyerName: order.buyerName || 'Verified Consumer',
      buyerPhone: order.buyerPhone || '+91 98765 43210',
      shippingAddress: order.shippingAddress || 'Direct Doorstep Delivery',
      pincode: order.pincode,
      deliveryCoordinates: order.deliveryCoordinates,
      farmAddress: order.farmAddress,
      farmCoordinates: order.farmCoordinates,
      status: order.status || 'ESCROW_LOCKED',
      escrowLocked: order.escrowLocked ?? true,
      escrowTxHash: order.escrowTxHash || `ESCROW-${Date.now().toString().slice(-6)}-LOCKED`,
      platformCommissionRate: commRate,
      platformCommissionAmount: commAmount,
      farmerPayoutAmount: farmerPayout,
      createdAt: order.createdAt || 'Just now',
      deliveryDate: order.deliveryDate || 'Scheduled within 24h',
      trackingId: order.trackingId || `TRK-FL-${Math.floor(1000 + Math.random() * 9000)}`,
    };

    const updated = [newOrder, ...current];
    safeSetLocalStorage(updated);
    return newOrder;
  },

  updateOrderStatus(orderId: string, status: OrderStatus): boolean {
    const current = safeGetLocalStorage();
    let found = false;
    const updated = current.map((order) => {
      if (order.id.toLowerCase() === orderId.toLowerCase()) {
        found = true;
        return { ...order, status };
      }
      return order;
    });
    if (found) {
      safeSetLocalStorage(updated);
    }
    return found;
  },

  resetToSeed(): void {
    safeSetLocalStorage([...INITIAL_ORDER_SEED]);
  },

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

export function useOrderStore() {
  const orders = useSyncExternalStore(
    orderStore.subscribe,
    orderStore.getOrders,
    () => INITIAL_ORDER_SEED
  );

  return {
    orders,
    getOrders: orderStore.getOrders,
    getOrderById: orderStore.getOrderById,
    placeOrder: orderStore.placeOrder,
    updateOrderStatus: orderStore.updateOrderStatus,
    resetToSeed: orderStore.resetToSeed,
  };
}
