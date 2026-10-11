'use client';

import { useSyncExternalStore } from 'react';

export type AlertChannel = 'SMS' | 'WHATSAPP' | 'IN_APP';
export type AlertTriggerCondition = 'CROSSES_ABOVE' | 'DROPS_BELOW';

export interface PriceAlertRule {
  id: string;
  farmerPhone: string;
  commodity: string;
  targetPriceKg: number;
  condition: AlertTriggerCondition;
  channel: AlertChannel;
  active: boolean;
  createdAt: string;
  lastTriggeredAt?: string;
  triggerCount: number;
}

export const INITIAL_ALERTS_SEED: PriceAlertRule[] = [
  {
    id: 'ALT-WHEAT-26',
    farmerPhone: '+91 98290 44102',
    commodity: 'Wheat',
    targetPriceKg: 26.0,
    condition: 'CROSSES_ABOVE',
    channel: 'WHATSAPP',
    active: true,
    createdAt: 'Today, 08:30 AM',
    triggerCount: 0,
  },
  {
    id: 'ALT-TOMATO-30',
    farmerPhone: '+91 98290 44102',
    commodity: 'Tomato',
    targetPriceKg: 30.0,
    condition: 'CROSSES_ABOVE',
    channel: 'SMS',
    active: true,
    createdAt: 'Yesterday',
    lastTriggeredAt: 'Yesterday, 04:15 PM',
    triggerCount: 1,
  },
];

const STORAGE_KEY = 'farmlink_price_alerts';
let memoryAlerts: PriceAlertRule[] = [...INITIAL_ALERTS_SEED];
let isInitialized = false;
const listeners = new Set<() => void>();

function syncFromStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ALERTS_SEED));
      memoryAlerts = [...INITIAL_ALERTS_SEED];
      return;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      memoryAlerts = parsed;
    } else {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ALERTS_SEED));
      memoryAlerts = [...INITIAL_ALERTS_SEED];
    }
  } catch {
    // preserve
  }
}

function safeGetAlerts(): PriceAlertRule[] {
  if (!isInitialized && typeof window !== 'undefined') {
    isInitialized = true;
    syncFromStorage();
  }
  return memoryAlerts;
}

function safeSetAlerts(items: PriceAlertRule[]): void {
  memoryAlerts = items;
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      window.dispatchEvent(
        new CustomEvent('farmlink_store_updated', {
          detail: { store: 'alerts' },
        })
      );
    } catch {
      // ignore
    }
  }
  listeners.forEach((l) => l());
}

export const alertStore = {
  subscribe(callback: () => void): () => void {
    listeners.add(callback);
    return () => listeners.delete(callback);
  },
  getSnapshot(): PriceAlertRule[] {
    return safeGetAlerts();
  },
  addAlert(rule: Omit<PriceAlertRule, 'id' | 'createdAt' | 'triggerCount'>): PriceAlertRule {
    const current = safeGetAlerts();
    const newRule: PriceAlertRule = {
      ...rule,
      id: `ALT-${rule.commodity.toUpperCase()}-${Math.round(rule.targetPriceKg)}-${Date.now().toString().slice(-4)}`,
      createdAt: 'Just now',
      triggerCount: 0,
    };
    safeSetAlerts([newRule, ...current]);
    return newRule;
  },
  toggleAlert(id: string): void {
    const current = safeGetAlerts();
    const updated = current.map((a) => (a.id === id ? { ...a, active: !a.active } : a));
    safeSetAlerts(updated);
  },
  deleteAlert(id: string): void {
    const current = safeGetAlerts();
    safeSetAlerts(current.filter((a) => a.id !== id));
  },
  triggerAlert(id: string): void {
    const current = safeGetAlerts();
    const updated = current.map((a) =>
      a.id === id
        ? {
            ...a,
            lastTriggeredAt: 'Just now',
            triggerCount: a.triggerCount + 1,
          }
        : a
    );
    safeSetAlerts(updated);
  },
  reset(): void {
    safeSetAlerts([...INITIAL_ALERTS_SEED]);
  },
};

export function useAlertStore() {
  const alerts = useSyncExternalStore(
    alertStore.subscribe,
    alertStore.getSnapshot,
    () => INITIAL_ALERTS_SEED
  );

  return {
    alerts,
    addAlert: alertStore.addAlert,
    toggleAlert: alertStore.toggleAlert,
    deleteAlert: alertStore.deleteAlert,
    triggerAlert: alertStore.triggerAlert,
    reset: alertStore.reset,
  };
}
