'use client';

import { useSyncExternalStore } from 'react';

export type OrderStatus = 'CONFIRMED' | 'ESCROW_LOCKED' | 'DISPATCHED' | 'DELIVERED';

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
  status: OrderStatus;
  escrowLocked: boolean;
  escrowTxHash?: string;
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
    status: 'DISPATCHED',
    escrowLocked: true,
    escrowTxHash: 'ESCROW-TX-99410-LOCKED',
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
    status: 'DELIVERED',
    escrowLocked: true,
    escrowTxHash: 'ESCROW-TX-99388-SETTLED',
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
      status: order.status || 'ESCROW_LOCKED',
      escrowLocked: order.escrowLocked ?? true,
      escrowTxHash: order.escrowTxHash || `ESCROW-${Date.now().toString().slice(-6)}-LOCKED`,
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
