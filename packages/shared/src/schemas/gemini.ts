/**
 * FarmLink Premier — Google Gemini AI Assistance Layer Schemas
 *
 * Strict Zod validation for inputs and outputs.
 * EVERY AI output is strictly assistant/copilot output, marked with isAiAssisted: true
 * and an explicit disclaimer.
 * NEVER allow AI to make binding financial, certification, or legal decisions.
 */

import { z } from 'zod';

export const AI_MANDATORY_DISCLAIMER =
  'AI-assisted information. Confirm important agricultural, commercial, quality-certification, and financial decisions with authorized personnel.';

// ============================================================================
// 1. Multilingual Onboarding Assistant
// ============================================================================

export const OnboardingAssistantRequestSchema = z.object({
  userRole: z.enum(['farmer', 'buyer', 'consumer']),
  language: z.enum(['en', 'hi', 'pa', 'mr', 'te', 'ta']).default('en'),
  userInput: z.string().min(1, 'User input is required'),
  conversationHistory: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      })
    )
    .optional()
    .default([]),
  currentProfileDraft: z
    .object({
      name: z.string().optional(),
      state: z.string().optional(),
      district: z.string().optional(),
      commodities: z.array(z.string()).optional(),
      scale: z.string().optional(),
    })
    .optional(),
});
export type OnboardingAssistantRequest = z.infer<typeof OnboardingAssistantRequestSchema>;

export const OnboardingAssistantResponseSchema = z.object({
  isAiAssisted: z.literal(true).default(true),
  disclaimer: z.string().default(AI_MANDATORY_DISCLAIMER),
  conversationalReply: z.string(),
  extractedProfile: z.object({
    name: z.string().nullable().optional(),
    state: z.string().nullable().optional(),
    district: z.string().nullable().optional(),
    commodities: z.array(z.string()).default([]),
    scale: z.string().nullable().optional(),
    profileCompletenessPct: z.number().min(0).max(100),
  }),
  suggestedNextPrompt: z.string(),
  onboardingStage: z.enum(['GREETING', 'LOCATION_SETUP', 'COMMODITY_SELECTION', 'SCALE_INPUT', 'READY_TO_CONFIRM']),
  readyToSubmit: z.boolean().default(false),
});
export type OnboardingAssistantResponse = z.infer<typeof OnboardingAssistantResponseSchema>;

// ============================================================================
// 2. B2B Procurement Copilot
// ============================================================================

export const ProcurementCopilotRequestSchema = z.object({
  buyerPlan: z.enum(['starter', 'growth', 'pro', 'enterprise']).default('starter'),
  unstructuredRequirement: z.string().min(5, 'Procurement requirement must be at least 5 characters'),
  deliveryPincode: z.string().optional(),
  targetDeliveryDate: z.string().optional(),
  maxBudgetInr: z.number().positive().optional(),
});
export type ProcurementCopilotRequest = z.infer<typeof ProcurementCopilotRequestSchema>;

export const SupplierCandidateEvaluationSchema = z.object({
  supplierName: z.string(),
  clusterLocation: z.string(),
  distanceKm: z.number().nonnegative(),
  matchScorePct: z.number().min(0).max(100),
  historicalFillRatePct: z.number().min(0).max(100),
  onTimeDeliveryPct: z.number().min(0).max(100),
  estimatedLeadDays: z.number().nonnegative(),
  strengths: z.array(z.string()),
  riskFactors: z.array(z.string()),
});
export type SupplierCandidateEvaluation = z.infer<typeof SupplierCandidateEvaluationSchema>;

export const ProcurementCopilotResponseSchema = z.object({
  isAiAssisted: z.literal(true).default(true),
  disclaimer: z.string().default(AI_MANDATORY_DISCLAIMER),
  structuredRfq: z.object({
    commodity: z.string(),
    variety: z.string().default('Commercial Standard'),
    targetGrade: z.enum(['Grade A1', 'Grade A2', 'Grade B', 'Grade C', 'Standard Commercial']),
    quantityTons: z.number().positive(),
    packagingPreference: z.string(),
    deliveryTimelineDays: z.number().positive(),
    estimatedBudgetRangeInr: z.object({
      minPerKg: z.number().nonnegative(),
      maxPerKg: z.number().nonnegative(),
    }),
  }),
  supplierComparison: z.array(SupplierCandidateEvaluationSchema),
  negotiationSummary: z.string(),
  requiresHumanReview: z.literal(true).default(true),
});
export type ProcurementCopilotResponse = z.infer<typeof ProcurementCopilotResponseSchema>;

// ============================================================================
// 3. Supply-Demand Match Explanation
// ============================================================================

export const MatchExplanationRequestSchema = z.object({
  listingDetails: z.object({
    listingId: z.string(),
    commodity: z.string(),
    variety: z.string().optional(),
    grade: z.string(),
    pricePerKg: z.number().positive(),
    quantityKg: z.number().positive(),
    location: z.string(),
  }),
  requirementDetails: z.object({
    requirementId: z.string(),
    commodity: z.string(),
    preferredGrade: z.string(),
    targetPricePerKg: z.number().positive(),
    requiredQuantityKg: z.number().positive(),
    destinationLocation: z.string(),
  }),
});
export type MatchExplanationRequest = z.infer<typeof MatchExplanationRequestSchema>;

export const MatchFactorDetailSchema = z.object({
  factorName: z.string(),
  scorePct: z.number().min(0).max(100),
  status: z.enum(['STRONG_ALIGNMENT', 'ACCEPTABLE', 'SLIGHT_VARIANCE', 'MISALIGNED']),
  explanation: z.string(),
});
export type MatchFactorDetail = z.infer<typeof MatchFactorDetailSchema>;

export const MatchExplanationResponseSchema = z.object({
  isAiAssisted: z.literal(true).default(true),
  disclaimer: z.string().default(AI_MANDATORY_DISCLAIMER),
  overallMatchScorePct: z.number().min(0).max(100),
  rating: z.enum(['EXCELLENT', 'GOOD', 'MODERATE', 'WEAK']),
  factors: z.object({
    locationProximity: MatchFactorDetailSchema,
    gradeCompatibility: MatchFactorDetailSchema,
    priceTolerance: MatchFactorDetailSchema,
    fulfillmentVolume: MatchFactorDetailSchema,
  }),
  narrativeExplanation: z.string(),
  recommendedAction: z.string(),
  frictionPoints: z.array(z.string()).default([]),
});
export type MatchExplanationResponse = z.infer<typeof MatchExplanationResponseSchema>;

// ============================================================================
// 4. Product Listing Copilot
// ============================================================================

export const ListingCopilotRequestSchema = z.object({
  farmerNotes: z.string().min(3, 'Produce notes must be at least 3 characters'),
  farmerTier: z.enum(['basic', 'premier', 'premier_pro', 'premier_elite']).default('basic'),
  language: z.enum(['en', 'hi', 'pa', 'mr', 'te', 'ta']).default('en'),
  photoUrls: z.array(z.string()).optional().default([]),
});
export type ListingCopilotRequest = z.infer<typeof ListingCopilotRequestSchema>;

export const ListingCopilotResponseSchema = z.object({
  isAiAssisted: z.literal(true).default(true),
  disclaimer: z.string().default(AI_MANDATORY_DISCLAIMER),
  draftListing: z.object({
    commodity: z.string(),
    variety: z.string(),
    suggestedGrade: z.enum(['Grade A1', 'Grade A2', 'Grade B', 'Grade C', 'Ungraded']),
    estimatedQuantityKg: z.number().positive(),
    unit: z.enum(['kg', 'quintal', 'ton']).default('quintal'),
    standardPackaging: z.string(),
    indicativePricePerKg: z.number().positive(),
    minOrderQuantityKg: z.number().positive(),
    searchTags: z.array(z.string()),
    description: z.string(),
    storageAdvice: z.string(),
  }),
  qualityChecklist: z.array(z.string()),
  requiresFarmerConfirmation: z.literal(true).default(true),
});
export type ListingCopilotResponse = z.infer<typeof ListingCopilotResponseSchema>;

// ============================================================================
// 5. Extensions (Analytics Narrative, Traceability Extractor, Recommendations, Triage)
// ============================================================================

export const AnalyticsNarrativeRequestSchema = z.object({
  grossMerchandiseValueInr: z.number().nonnegative(),
  activeListingsCount: z.number().int().nonnegative(),
  completedOrdersCount: z.number().int().nonnegative(),
  topCommodities: z.array(z.object({ name: z.string(), volumeTons: z.number() })),
  avgDeliveryHours: z.number().nonnegative(),
});
export type AnalyticsNarrativeRequest = z.infer<typeof AnalyticsNarrativeRequestSchema>;

export const AnalyticsNarrativeResponseSchema = z.object({
  isAiAssisted: z.literal(true).default(true),
  disclaimer: z.string().default(AI_MANDATORY_DISCLAIMER),
  executiveSummary: z.string(),
  keyInsights: z.array(z.string()),
  operationalRisks: z.array(z.string()),
});
export type AnalyticsNarrativeResponse = z.infer<typeof AnalyticsNarrativeResponseSchema>;

export const TraceabilityExtractorRequestSchema = z.object({
  rawHarvestNotes: z.string().min(5),
});
export type TraceabilityExtractorRequest = z.infer<typeof TraceabilityExtractorRequestSchema>;

export const TraceabilityExtractorResponseSchema = z.object({
  isAiAssisted: z.literal(true).default(true),
  disclaimer: z.string().default(AI_MANDATORY_DISCLAIMER),
  batchNumber: z.string(),
  harvestDate: z.string(),
  farmDistrict: z.string(),
  moistureContentPct: z.number().min(0).max(100).nullable(),
  pesticideResidueStatus: z.enum(['TESTED_BELOW_MRL', 'ORGANIC_PRACTICE', 'PENDING_LAB_REPORT', 'UNKNOWN']),
  coldChainRecommendedTempC: z.number(),
  narrative: z.string(),
});
export type TraceabilityExtractorResponse = z.infer<typeof TraceabilityExtractorResponseSchema>;

export const ConsumerRecommendationRequestSchema = z.object({
  dietaryPreference: z.string().optional(),
  familySize: z.number().int().positive().default(4),
  season: z.enum(['RABI', 'KHARIF', 'ZAID', 'ALL_SEASON']).default('ALL_SEASON'),
});
export type ConsumerRecommendationRequest = z.infer<typeof ConsumerRecommendationRequestSchema>;

export const ConsumerRecommendationResponseSchema = z.object({
  isAiAssisted: z.literal(true).default(true),
  disclaimer: z.string().default(AI_MANDATORY_DISCLAIMER),
  recommendedItems: z.array(
    z.object({
      commodity: z.string(),
      recommendedKg: z.number().positive(),
      freshnessWindowDays: z.number().positive(),
      culinaryUse: z.string(),
    })
  ),
  freshnessTip: z.string(),
});
export type ConsumerRecommendationResponse = z.infer<typeof ConsumerRecommendationResponseSchema>;

export const SupportTriageRequestSchema = z.object({
  ticketMessage: z.string().min(5),
  userRole: z.enum(['farmer', 'buyer', 'consumer']),
});
export type SupportTriageRequest = z.infer<typeof SupportTriageRequestSchema>;

export const SupportTriageResponseSchema = z.object({
  isAiAssisted: z.literal(true).default(true),
  disclaimer: z.string().default(AI_MANDATORY_DISCLAIMER),
  category: z.enum(['PAYMENT_ESCROW', 'LOGISTICS_DELAY', 'PRODUCE_QUALITY', 'ACCOUNT_ACCESS', 'GENERAL']),
  urgency: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  suggestedAgentReply: z.string(),
  recommendedAction: z.string(),
});
export type SupportTriageResponse = z.infer<typeof SupportTriageResponseSchema>;
