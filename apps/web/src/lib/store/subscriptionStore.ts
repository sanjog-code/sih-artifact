'use client';

import { useSyncExternalStore } from 'react';

// ---------------------------------------------------------------------------
// Tier Definitions & Pricing Contract
// ---------------------------------------------------------------------------

export type FarmerTier = 'basic' | 'premier' | 'premier_pro' | 'premier_elite';
export type BusinessTier = 'starter' | 'growth' | 'pro' | 'enterprise';
export type ConsumerTier = 'basic' | 'premier' | 'plus';
export type BillingCycle = 'monthly' | 'annual';

export interface FarmerPlanConfig {
  id: FarmerTier;
  name: string;
  commissionRate: number; // e.g. 0.05 for 5%
  monthlyPrice: number; // Always 0 (free monthly)
  minVolumeKg: number;
  perks: string[];
}

export interface BusinessPlanConfig {
  id: BusinessTier;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  targetCustomer: string;
  perks: string[];
}

export interface ConsumerPlanConfig {
  id: ConsumerTier;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  perks: string[];
}

export const FARMER_PLANS: Record<FarmerTier, FarmerPlanConfig> = {
  basic: {
    id: 'basic',
    name: 'Basic',
    commissionRate: 0.05,
    monthlyPrice: 0,
    minVolumeKg: 0,
    perks: [
      'Standard produce lot declaration & listing',
      'Direct fair price benchmarking & MSP floor guard',
      'Automated RBI nodal escrow settlement (T+1)',
      'Basic SMS dispatch alerts',
    ],
  },
  premier: {
    id: 'premier',
    name: 'Premier',
    commissionRate: 0.04,
    monthlyPrice: 0,
    minVolumeKg: 5000,
    perks: [
      'Everything in Basic with reduced 4% platform commission',
      'Real-time regional buyer demand telemetry & alerts',
      'Priority lot aggregation at accredited WDRA depots',
      'Optical quality assay certificate badge',
    ],
  },
  premier_pro: {
    id: 'premier_pro',
    name: 'Premier Pro',
    commissionRate: 0.03,
    monthlyPrice: 0,
    minVolumeKg: 20000,
    perks: [
      'Everything in Premier with reduced 3% platform commission',
      'Advanced Mandi Price Forecasting & optimal harvest timing AI',
      'Enhanced promotional placement across B2B Buyer Desks',
      'Direct logistics truck matching & route dispatch prioritization',
    ],
  },
  premier_elite: {
    id: 'premier_elite',
    name: 'Premier Elite',
    commissionRate: 0.02,
    monthlyPrice: 0,
    minVolumeKg: 50000,
    perks: [
      'Lowest 2% platform commission on completed escrow sales',
      'Dedicated FPO cluster advisor & corporate procurement routing',
      'Instant contract locking for multi-quintal institutional RFQs',
      'Consolidated GST, e-Waybill & tax audit reporting exports',
    ],
  },
};

export const BUSINESS_PLANS: Record<BusinessTier, BusinessPlanConfig> = {
  starter: {
    id: 'starter',
    name: 'Business Starter',
    monthlyPrice: 4999,
    annualPrice: 49990,
    targetCustomer: 'Small restaurants, retail marts & local grocers',
    perks: [
      'Bulk procurement dashboard & verified farmer directory',
      'Supplier discovery, variety comparison & price tracking',
      'Instant purchase order creation & dispatch tracking',
      'Standard business support & GST invoicing',
    ],
  },
  growth: {
    id: 'growth',
    name: 'Business Growth',
    monthlyPrice: 9999,
    annualPrice: 99990,
    targetCustomer: 'Growing regional wholesalers & food processors',
    perks: [
      'Everything in Starter with multi-farmer sourcing coordination',
      'Automated recurring procurement schedules (weekly / bi-weekly)',
      'Advanced purchasing analytics & supplier performance scorecards',
      'Multi-lot consolidated logistics routing & priority support',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Business Pro',
    monthlyPrice: 19999,
    annualPrice: 199990,
    targetCustomer: 'Large distributors, hotel chains & multi-outlet retailers',
    perks: [
      'Everything in Growth plus multi-warehouse/outlet destination allocation',
      'Consolidated institutional audit reports & batch laboratory testing',
      'Custom RFQ negotiation workflows & automated counter-bidding',
      'Dedicated key account manager & 4-hour SLA response',
    ],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    monthlyPrice: 49999,
    annualPrice: 499990,
    targetCustomer: 'Large supermarket chains, exporters & industrial processors',
    perks: [
      'Multi-state depot procurement & custom ERP / SAP API integrations',
      'Configurable enterprise approval hierarchies & credit lines',
      'Guaranteed cold-chain freight capacity & dedicated fleet routing',
      'Contractual custom service-level agreements & 24/7 priority concierge',
    ],
  },
};

export const CONSUMER_PLANS: Record<ConsumerTier, ConsumerPlanConfig> = {
  basic: {
    id: 'basic',
    name: 'Consumer Basic',
    monthlyPrice: 0,
    annualPrice: 0,
    perks: [
      'Browse farm-fresh catalog directly from accredited growers',
      'Place zero-middleman orders with secure escrow lock',
      'Standard GPS dispatch and route tracking',
      'Access transparent farm origin & harvest date details',
    ],
  },
  premier: {
    id: 'premier',
    name: 'Consumer Premier',
    monthlyPrice: 99,
    annualPrice: 999,
    perks: [
      'Flat ₹40 delivery discount on eligible orders',
      'Personalized harvest arrival alerts & recommendations',
      'Full AGMARK lot quality passport & nutritional assay download',
      'Convenient repeat ordering & premier offers',
      'Priority dispatch slot selection (morning 6 AM - 8 AM)',
    ],
  },
  plus: {
    id: 'plus',
    name: 'Consumer Plus',
    monthlyPrice: 199,
    annualPrice: 1999,
    perks: [
      'Everything in Premier',
      '100% free delivery on all orders over ₹399',
      'VIP early-access harvest drops (reserve lots before open market)',
      'Dedicated farm-to-table consumer concierge & priority support',
      'Enhanced promotional offers & seasonal farmer harvest boxes',
    ],
  },
};

// ---------------------------------------------------------------------------
// Subscription State Model
// ---------------------------------------------------------------------------

export interface SubscriptionState {
  farmer: {
    activeTier: FarmerTier;
    totalSalesVolumeKg: number;
    totalGmvRupees: number;
    totalCommissionSaved: number;
  };
  business: {
    activeTier: BusinessTier;
    billingCycle: BillingCycle;
    subscriptionStartDate: string;
    isPaid: boolean;
    txHash?: string;
  };
  consumer: {
    activeTier: ConsumerTier;
    billingCycle: BillingCycle;
    subscriptionStartDate: string;
    isPaid: boolean;
    txHash?: string;
  };
  recurringSchedules: {
    id: string;
    commodity: string;
    volumeKg: number;
    frequency: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
    nextDispatchDate: string;
    status: 'ACTIVE' | 'PAUSED';
  }[];
}

const DEFAULT_SUBSCRIPTION_STATE: SubscriptionState = {
  farmer: {
    activeTier: 'basic',
    totalSalesVolumeKg: 8500,
    totalGmvRupees: 238000,
    totalCommissionSaved: 2380,
  },
  business: {
    activeTier: 'starter',
    billingCycle: 'monthly',
    subscriptionStartDate: 'Oct 01, 2026',
    isPaid: true,
    txHash: 'SUB-BIZ-89042-VERIFIED',
  },
  consumer: {
    activeTier: 'basic',
    billingCycle: 'monthly',
    subscriptionStartDate: 'Oct 05, 2026',
    isPaid: true,
    txHash: 'SUB-CON-10928-ACTIVE',
  },
  recurringSchedules: [
    {
      id: 'REC-SCH-01',
      commodity: 'Tomato (Hybrid)',
      volumeKg: 1000,
      frequency: 'WEEKLY',
      nextDispatchDate: 'Every Monday, 07:00 AM',
      status: 'ACTIVE',
    },
    {
      id: 'REC-SCH-02',
      commodity: 'Wheat (Sharbati)',
      volumeKg: 2500,
      frequency: 'BIWEEKLY',
      nextDispatchDate: '1st & 15th of month',
      status: 'ACTIVE',
    },
  ],
};

const STORAGE_KEY = 'farmlink_subscriptions';
let memoryState: SubscriptionState = { ...DEFAULT_SUBSCRIPTION_STATE };
let isInitialized = false;
const listeners = new Set<() => void>();

function syncFromStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SUBSCRIPTION_STATE));
      memoryState = { ...DEFAULT_SUBSCRIPTION_STATE };
      return;
    }
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && parsed.farmer && parsed.business && parsed.consumer) {
      memoryState = parsed;
    } else {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SUBSCRIPTION_STATE));
      memoryState = { ...DEFAULT_SUBSCRIPTION_STATE };
    }
  } catch {
    // preserve current memoryState
  }
}

function safeGetLocalStorage(): SubscriptionState {
  if (!isInitialized && typeof window !== 'undefined') {
    isInitialized = true;
    syncFromStorage();
  }
  return memoryState;
}

function safeSetLocalStorage(nextState: SubscriptionState): void {
  memoryState = nextState;
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
      window.dispatchEvent(
        new CustomEvent('farmlink_store_updated', {
          detail: { store: 'subscription' },
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
    if (custom.detail?.store === 'subscription') {
      notify();
    }
  });
}

// ---------------------------------------------------------------------------
// Store Implementation & Public API
// ---------------------------------------------------------------------------

export const subscriptionStore = {
  getState(): SubscriptionState {
    return safeGetLocalStorage();
  },

  /**
   * Updates Farmer Premier Tier.
   * Basic marketplace access remains 100% free with commission reduced from 5% down to 2%.
   */
  setFarmerTier(tier: FarmerTier): void {
    const current = safeGetLocalStorage();
    const updated: SubscriptionState = {
      ...current,
      farmer: {
        ...current.farmer,
        activeTier: tier,
      },
    };
    safeSetLocalStorage(updated);
  },

  /**
   * Upgrades or updates B2B Business Premier Subscription.
   */
  setBusinessPlan(tier: BusinessTier, billingCycle: BillingCycle = 'monthly'): void {
    const current = safeGetLocalStorage();
    const txHash = `SUB-BIZ-${Date.now().toString().slice(-6)}-PAID`;
    const updated: SubscriptionState = {
      ...current,
      business: {
        activeTier: tier,
        billingCycle,
        subscriptionStartDate: 'Today',
        isPaid: true,
        txHash,
      },
    };
    safeSetLocalStorage(updated);
  },

  /**
   * Upgrades or updates Consumer Premier Membership.
   */
  setConsumerPlan(tier: ConsumerTier, billingCycle: BillingCycle = 'monthly'): void {
    const current = safeGetLocalStorage();
    const txHash = `SUB-CON-${Date.now().toString().slice(-6)}-PAID`;
    const updated: SubscriptionState = {
      ...current,
      consumer: {
        activeTier: tier,
        billingCycle,
        subscriptionStartDate: 'Today',
        isPaid: true,
        txHash,
      },
    };
    safeSetLocalStorage(updated);
  },

  /**
   * Adds a recurring procurement schedule (unlocked for Business Growth / Pro / Enterprise).
   */
  addRecurringSchedule(schedule: {
    commodity: string;
    volumeKg: number;
    frequency: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
    nextDispatchDate: string;
  }): void {
    const current = safeGetLocalStorage();
    const newSchedule = {
      id: `REC-SCH-${Date.now().toString().slice(-4)}`,
      commodity: schedule.commodity,
      volumeKg: schedule.volumeKg,
      frequency: schedule.frequency,
      nextDispatchDate: schedule.nextDispatchDate,
      status: 'ACTIVE' as const,
    };
    const updated: SubscriptionState = {
      ...current,
      recurringSchedules: [newSchedule, ...current.recurringSchedules],
    };
    safeSetLocalStorage(updated);
  },

  /**
   * Helper: Calculates commission deduction for a completed sale.
   */
  calculateFarmerCommission(totalSaleAmount: number, farmerTier?: FarmerTier): {
    commissionRate: number;
    commissionAmount: number;
    farmerReceives: number;
    planName: string;
  } {
    const tier = farmerTier || safeGetLocalStorage().farmer.activeTier;
    const plan = FARMER_PLANS[tier] || FARMER_PLANS.basic;
    const commissionAmount = Math.round(totalSaleAmount * plan.commissionRate);
    const farmerReceives = totalSaleAmount - commissionAmount;

    return {
      commissionRate: plan.commissionRate,
      commissionAmount,
      farmerReceives,
      planName: plan.name,
    };
  },

  /**
   * Helper: Calculates consumer delivery benefit.
   */
  calculateConsumerDeliveryFee(
    subtotal: number,
    baseDeliveryFee = 35,
    consumerTier?: ConsumerTier
  ): {
    finalFee: number;
    discountApplied: number;
    isFree: boolean;
    benefitNote?: string;
  } {
    const tier = consumerTier || safeGetLocalStorage().consumer.activeTier;

    if (tier === 'plus') {
      // Plus: 100% Free delivery on orders > ₹399
      if (subtotal >= 399) {
        return {
          finalFee: 0,
          discountApplied: baseDeliveryFee,
          isFree: true,
          benefitNote: 'Consumer Plus Benefit: 100% Free Delivery on orders over ₹399',
        };
      }
      const discount = Math.min(baseDeliveryFee, 40);
      return {
        finalFee: Math.max(0, baseDeliveryFee - discount),
        discountApplied: discount,
        isFree: baseDeliveryFee <= discount,
        benefitNote: 'Consumer Plus Benefit: ₹40 Delivery Discount Applied',
      };
    }

    if (tier === 'premier') {
      // Premier: Flat ₹40 discount on delivery
      const discount = Math.min(baseDeliveryFee, 40);
      return {
        finalFee: Math.max(0, baseDeliveryFee - discount),
        discountApplied: discount,
        isFree: baseDeliveryFee <= discount,
        benefitNote: 'Consumer Premier Benefit: ₹40 Delivery Discount Applied',
      };
    }

    return {
      finalFee: baseDeliveryFee,
      discountApplied: 0,
      isFree: false,
    };
  },

  resetToSeed(): void {
    safeSetLocalStorage({ ...DEFAULT_SUBSCRIPTION_STATE });
  },

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

export function useSubscriptionStore() {
  const state = useSyncExternalStore(
    subscriptionStore.subscribe,
    subscriptionStore.getState,
    () => DEFAULT_SUBSCRIPTION_STATE
  );

  return {
    state,
    farmerTier: state.farmer.activeTier,
    farmerConfig: FARMER_PLANS[state.farmer.activeTier],
    businessTier: state.business.activeTier,
    businessConfig: BUSINESS_PLANS[state.business.activeTier],
    consumerTier: state.consumer.activeTier,
    consumerConfig: CONSUMER_PLANS[state.consumer.activeTier],
    recurringSchedules: state.recurringSchedules,
    setFarmerTier: subscriptionStore.setFarmerTier,
    setBusinessPlan: subscriptionStore.setBusinessPlan,
    setConsumerPlan: subscriptionStore.setConsumerPlan,
    addRecurringSchedule: subscriptionStore.addRecurringSchedule,
    calculateFarmerCommission: subscriptionStore.calculateFarmerCommission,
    calculateConsumerDeliveryFee: subscriptionStore.calculateConsumerDeliveryFee,
    resetToSeed: subscriptionStore.resetToSeed,
  };
}
