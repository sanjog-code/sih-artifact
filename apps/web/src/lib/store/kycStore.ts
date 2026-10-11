'use client';

import { useSyncExternalStore } from 'react';

export type KycStatus = 'UNVERIFIED' | 'PENNY_DROP_PENDING' | 'VERIFIED' | 'REJECTED';

export interface FarmerKycProfile {
  id: string; // e.g. "KYC-FM-4412"
  farmerName: string;
  phone: string;
  aadhaarLastFour: string;
  pmKisanBeneficiaryId?: string;
  bankAccountNo: string;
  ifscCode: string;
  bankName: string;
  accountHolderName: string;
  pennyDropStatus: 'SUCCESS' | 'FAILED' | 'PENDING';
  pennyDropRef?: string;
  kycStatus: KycStatus;
  submittedAt: string;
  verifiedAt?: string;
  rejectionReason?: string;
  riskScore: 'LOW' | 'MEDIUM' | 'HIGH';
}

export const INITIAL_KYC_SEED: FarmerKycProfile[] = [
  {
    id: 'KYC-FM-4412',
    farmerName: 'Rameshwar Lal Jat',
    phone: '+91 98290 44102',
    aadhaarLastFour: '8912',
    pmKisanBeneficiaryId: 'PMK-RJ-992014',
    bankAccountNo: '••••••••4812',
    ifscCode: 'SBIN0002410',
    bankName: 'State Bank of India',
    accountHolderName: 'Rameshwar Lal',
    pennyDropStatus: 'SUCCESS',
    pennyDropRef: 'RZP-PD-99281-PASS',
    kycStatus: 'VERIFIED',
    submittedAt: 'Oct 02, 2026',
    verifiedAt: 'Oct 02, 2026, 11:24 AM',
    riskScore: 'LOW',
  },
  {
    id: 'KYC-FM-5021',
    farmerName: 'Baldev Singh Gill',
    phone: '+91 98140 88219',
    aadhaarLastFour: '4108',
    bankAccountNo: '••••••••1109',
    ifscCode: 'PUNB0124000',
    bankName: 'Punjab National Bank',
    accountHolderName: 'Baldev S Gill',
    pennyDropStatus: 'PENDING',
    kycStatus: 'PENNY_DROP_PENDING',
    submittedAt: 'Today, 07:45 AM',
    riskScore: 'LOW',
  },
];

const STORAGE_KEY = 'farmlink_kyc_profiles';
let memoryKyc: FarmerKycProfile[] = [...INITIAL_KYC_SEED];
let isInitialized = false;
const listeners = new Set<() => void>();

function syncFromStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_KYC_SEED));
      memoryKyc = [...INITIAL_KYC_SEED];
      return;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      memoryKyc = parsed;
    } else {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_KYC_SEED));
      memoryKyc = [...INITIAL_KYC_SEED];
    }
  } catch {
    // preserve
  }
}

function safeGetKyc(): FarmerKycProfile[] {
  if (!isInitialized && typeof window !== 'undefined') {
    isInitialized = true;
    syncFromStorage();
  }
  return memoryKyc;
}

function safeSetKyc(items: FarmerKycProfile[]): void {
  memoryKyc = items;
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      window.dispatchEvent(
        new CustomEvent('farmlink_store_updated', {
          detail: { store: 'kyc' },
        })
      );
    } catch {
      // ignore
    }
  }
  listeners.forEach((l) => l());
}

export const kycStore = {
  subscribe(callback: () => void): () => void {
    listeners.add(callback);
    return () => listeners.delete(callback);
  },
  getSnapshot(): FarmerKycProfile[] {
    return safeGetKyc();
  },
  getCurrentFarmerKyc(): FarmerKycProfile {
    const list = safeGetKyc();
    return list[0] || INITIAL_KYC_SEED[0];
  },
  submitKyc(profile: Omit<FarmerKycProfile, 'id' | 'pennyDropStatus' | 'kycStatus' | 'submittedAt' | 'riskScore'>): FarmerKycProfile {
    const current = safeGetKyc();
    const newKyc: FarmerKycProfile = {
      ...profile,
      id: `KYC-FM-${Date.now().toString().slice(-4)}`,
      pennyDropStatus: 'SUCCESS', // Instant sandbox penny drop verification
      pennyDropRef: `CASHFREE-PD-${Date.now().toString().slice(-6)}-VERIFIED`,
      kycStatus: 'VERIFIED',
      submittedAt: 'Just now',
      verifiedAt: 'Just now',
      riskScore: 'LOW',
    };
    safeSetKyc([newKyc, ...current.filter((k) => k.id !== newKyc.id)]);
    return newKyc;
  },
  updateKycStatus(id: string, status: KycStatus, reason?: string): void {
    const current = safeGetKyc();
    const updated = current.map((k) =>
      k.id === id
        ? {
            ...k,
            kycStatus: status,
            verifiedAt: status === 'VERIFIED' ? 'Just now' : k.verifiedAt,
            rejectionReason: reason,
          }
        : k
    );
    safeSetKyc(updated);
  },
  reset(): void {
    safeSetKyc([...INITIAL_KYC_SEED]);
  },
};

export function useKycStore() {
  const kycList = useSyncExternalStore(
    kycStore.subscribe,
    kycStore.getSnapshot,
    () => INITIAL_KYC_SEED
  );

  return {
    kycList,
    currentFarmerKyc: kycList[0] || INITIAL_KYC_SEED[0],
    submitKyc: kycStore.submitKyc,
    updateKycStatus: kycStore.updateKycStatus,
    reset: kycStore.reset,
  };
}
