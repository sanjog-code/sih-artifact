'use client';

export * from './produceStore';
export * from './orderStore';
export * from './rfqStore';
export * from './warehouseStore';
export * from './subscriptionStore';
export * from './alertStore';
export * from './kycStore';

import { produceStore } from './produceStore';
import { orderStore } from './orderStore';
import { rfqStore } from './rfqStore';
import { warehouseStore } from './warehouseStore';
import { subscriptionStore } from './subscriptionStore';
import { alertStore } from './alertStore';
import { kycStore } from './kycStore';

// Named aliases conforming to PROJECT.md interface contract
export const ProduceStore = produceStore;
export const OrderStore = orderStore;
export const RfqStore = rfqStore;
export const WarehouseStore = warehouseStore;
export const SubscriptionStore = subscriptionStore;
export const AlertStore = alertStore;
export const KycStore = kycStore;

// ---------------------------------------------------------------------------
// Logistics Fleet Persistent Store
// ---------------------------------------------------------------------------
export interface LogisticsDispatchRecord {
  id: string; // e.g. "DISP-VAN-7401"
  vehicleType: string;
  driverName: string;
  driverPhone: string;
  dispatchedAt: string;
  totalDistanceKm: number;
  totalPayloadKg: number;
  capacityUtilizationPercent: number;
  status: 'DISPATCHED' | 'IN_TRANSIT' | 'COMPLETED';
}

const LOGISTICS_STORAGE_KEY = 'farmlink_logistics_dispatches';
let memoryLogistics: LogisticsDispatchRecord[] = [
  {
    id: 'DISP-VAN-7401',
    vehicleType: 'VAN',
    driverName: 'Mohan Lal Verma',
    driverPhone: '+91 98290 11442',
    dispatchedAt: 'Today, 08:00 AM',
    totalDistanceKm: 124.5,
    totalPayloadKg: 1350,
    capacityUtilizationPercent: 90.0,
    status: 'IN_TRANSIT',
  },
];

function safeGetLogistics(): LogisticsDispatchRecord[] {
  if (typeof window === 'undefined') return memoryLogistics;
  try {
    const raw = window.localStorage.getItem(LOGISTICS_STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(LOGISTICS_STORAGE_KEY, JSON.stringify(memoryLogistics));
      return memoryLogistics;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      memoryLogistics = parsed;
      return parsed;
    }
    return memoryLogistics;
  } catch {
    return memoryLogistics;
  }
}

function safeSetLogistics(items: LogisticsDispatchRecord[]) {
  memoryLogistics = items;
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(LOGISTICS_STORAGE_KEY, JSON.stringify(items));
      window.dispatchEvent(
        new CustomEvent('farmlink_store_updated', {
          detail: { store: 'logistics' },
        })
      );
    } catch {
      // ignore
    }
  }
}

export const logisticsStore = {
  getDispatches(): LogisticsDispatchRecord[] {
    return safeGetLogistics();
  },
  recordDispatch(record: Partial<LogisticsDispatchRecord>): LogisticsDispatchRecord {
    const current = safeGetLogistics();
    const newRecord: LogisticsDispatchRecord = {
      id: record.id || `DISP-${record.vehicleType || 'VAN'}-${Date.now().toString().slice(-4)}`,
      vehicleType: record.vehicleType || 'VAN',
      driverName: record.driverName || 'Verified Fleet Captain',
      driverPhone: record.driverPhone || '+91 98290 00000',
      dispatchedAt: record.dispatchedAt || 'Just now',
      totalDistanceKm: Number(record.totalDistanceKm || 120),
      totalPayloadKg: Number(record.totalPayloadKg || 1200),
      capacityUtilizationPercent: Number(record.capacityUtilizationPercent || 85),
      status: record.status || 'DISPATCHED',
    };
    const updated = [newRecord, ...current];
    safeSetLogistics(updated);
    return newRecord;
  },
};

export const LogisticsStore = logisticsStore;

/**
 * Resets all client stores back to original demo seeds.
 * Useful for automated tests and clean environment resets.
 */
export function resetAllStoresToSeed(): void {
  produceStore.resetToSeed();
  orderStore.resetToSeed();
  rfqStore.resetToSeed();
  warehouseStore.resetToSeed();
  subscriptionStore.resetToSeed();
  alertStore.reset();
  kycStore.reset();
  safeSetLogistics([
    {
      id: 'DISP-VAN-7401',
      vehicleType: 'VAN',
      driverName: 'Mohan Lal Verma',
      driverPhone: '+91 98290 11442',
      dispatchedAt: 'Today, 08:00 AM',
      totalDistanceKm: 124.5,
      totalPayloadKg: 1350,
      capacityUtilizationPercent: 90.0,
      status: 'IN_TRANSIT',
    },
  ]);
}
