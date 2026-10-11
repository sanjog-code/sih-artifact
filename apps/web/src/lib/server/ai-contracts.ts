import { AI_MANDATORY_DISCLAIMER } from './monetization-domain';

export { AI_MANDATORY_DISCLAIMER };

export interface OnboardingAssistantRequest {
  userRole: 'farmer' | 'buyer' | 'consumer';
  language?: 'en' | 'hi' | 'pa' | 'mr' | 'te' | 'ta';
  userInput: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  currentProfileDraft?: {
    name?: string;
    state?: string;
    district?: string;
    commodities?: string[];
    scale?: string;
  };
}

export function validateOnboardingRequest(data: unknown): { success: true; data: OnboardingAssistantRequest } | { success: false; error: string } {
  if (!data || typeof data !== 'object') return { success: false, error: 'Invalid payload' };
  const d = data as Record<string, unknown>;
  if (!d.userInput || typeof d.userInput !== 'string' || d.userInput.trim().length === 0) {
    return { success: false, error: 'User input is required' };
  }
  const userRole = (d.userRole as 'farmer' | 'buyer' | 'consumer') || 'farmer';
  return {
    success: true,
    data: {
      userRole,
      language: (d.language as OnboardingAssistantRequest['language']) || 'en',
      userInput: d.userInput.trim(),
      conversationHistory: Array.isArray(d.conversationHistory) ? (d.conversationHistory as Array<{ role: 'user' | 'assistant'; content: string }>) : [],
      currentProfileDraft: (d.currentProfileDraft as OnboardingAssistantRequest['currentProfileDraft']) || {},
    },
  };
}

export interface ProcurementCopilotRequest {
  buyerPlan?: 'starter' | 'growth' | 'pro' | 'enterprise';
  unstructuredRequirement: string;
  deliveryPincode?: string;
  targetDeliveryDate?: string;
  maxBudgetInr?: number;
}

export function validateProcurementRequest(data: unknown): { success: true; data: ProcurementCopilotRequest } | { success: false; error: string } {
  if (!data || typeof data !== 'object') return { success: false, error: 'Invalid payload' };
  const d = data as Record<string, unknown>;
  if (!d.unstructuredRequirement || typeof d.unstructuredRequirement !== 'string' || d.unstructuredRequirement.trim().length < 5) {
    return { success: false, error: 'Requirement must be at least 5 characters' };
  }
  return {
    success: true,
    data: {
      buyerPlan: (d.buyerPlan as ProcurementCopilotRequest['buyerPlan']) || 'starter',
      unstructuredRequirement: d.unstructuredRequirement.trim(),
      deliveryPincode: typeof d.deliveryPincode === 'string' ? d.deliveryPincode : undefined,
      targetDeliveryDate: typeof d.targetDeliveryDate === 'string' ? d.targetDeliveryDate : undefined,
      maxBudgetInr: typeof d.maxBudgetInr === 'number' ? d.maxBudgetInr : undefined,
    },
  };
}

export interface MatchExplanationRequest {
  listingDetails: {
    listingId: string;
    commodity: string;
    variety?: string;
    grade: string;
    pricePerKg: number;
    quantityKg: number;
    location: string;
  };
  requirementDetails: {
    requirementId: string;
    commodity: string;
    preferredGrade: string;
    targetPricePerKg: number;
    requiredQuantityKg: number;
    destinationLocation: string;
  };
}

export function validateMatchRequest(data: unknown): { success: true; data: MatchExplanationRequest } | { success: false; error: string } {
  if (!data || typeof data !== 'object') return { success: false, error: 'Invalid payload' };
  const d = data as Record<string, unknown>;
  if (!d.listingDetails || !d.requirementDetails) return { success: false, error: 'Both listing and requirement details required' };
  return {
    success: true,
    data: d as unknown as MatchExplanationRequest,
  };
}

export interface ListingCopilotRequest {
  farmerNotes: string;
  farmerTier?: 'basic' | 'premier' | 'premier_pro' | 'premier_elite';
  language?: 'en' | 'hi' | 'pa' | 'mr' | 'te' | 'ta';
  photoUrls?: string[];
}

export function validateListingRequest(data: unknown): { success: true; data: ListingCopilotRequest } | { success: false; error: string } {
  if (!data || typeof data !== 'object') return { success: false, error: 'Invalid payload' };
  const d = data as Record<string, unknown>;
  if (!d.farmerNotes || typeof d.farmerNotes !== 'string' || d.farmerNotes.trim().length < 3) {
    return { success: false, error: 'Produce notes must be at least 3 characters' };
  }
  return {
    success: true,
    data: {
      farmerNotes: d.farmerNotes.trim(),
      farmerTier: (d.farmerTier as ListingCopilotRequest['farmerTier']) || 'basic',
      language: (d.language as ListingCopilotRequest['language']) || 'en',
      photoUrls: Array.isArray(d.photoUrls) ? (d.photoUrls as string[]) : [],
    },
  };
}
