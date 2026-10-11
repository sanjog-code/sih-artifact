import {
  AI_MANDATORY_DISCLAIMER,
  AnalyticsNarrativeResponseSchema,
  ConsumerRecommendationResponseSchema,
  ListingCopilotRequestSchema,
  ListingCopilotResponseSchema,
  MatchExplanationRequestSchema,
  MatchExplanationResponseSchema,
  OnboardingAssistantRequestSchema,
  OnboardingAssistantResponseSchema,
  ProcurementCopilotRequestSchema,
  ProcurementCopilotResponseSchema,
  SupportTriageResponseSchema,
  TraceabilityExtractorResponseSchema,
} from '../src/schemas/gemini';

describe('FarmLink Premier — Google Gemini AI Layer Zod Schemas', () => {
  describe('1. Multilingual Onboarding Assistant', () => {
    it('validates onboarding request and response with mandatory disclaimer', () => {
      const validReq = OnboardingAssistantRequestSchema.parse({
        userRole: 'farmer',
        language: 'hi',
        userInput: 'Mera naam Ramesh hai, Nashik se hu aur tamatar ki kheti karta hu.',
      });
      expect(validReq.userRole).toBe('farmer');

      const validRes = OnboardingAssistantResponseSchema.parse({
        conversationalReply: 'नमस्ते रमेश जी! फार्मलिंक पर आपका स्वागत है।',
        extractedProfile: {
          name: 'Ramesh',
          state: 'Maharashtra',
          district: 'Nashik',
          commodities: ['Tomato'],
          scale: 'Medium',
          profileCompletenessPct: 75,
        },
        suggestedNextPrompt: 'Aap kitne acres mein tamatar ugate hain?',
        onboardingStage: 'SCALE_INPUT',
        readyToSubmit: false,
      });

      expect(validRes.isAiAssisted).toBe(true);
      expect(validRes.disclaimer).toBe(AI_MANDATORY_DISCLAIMER);
      expect(validRes.extractedProfile.commodities).toContain('Tomato');
    });
  });

  describe('2. B2B Procurement Copilot', () => {
    it('validates RFQ structuring and supplier comparison output', () => {
      const validReq = ProcurementCopilotRequestSchema.parse({
        buyerPlan: 'pro',
        unstructuredRequirement: 'Need 20 tons of hybrid onions Grade A for export packaging by next Monday',
        deliveryPincode: '422001',
      });
      expect(validReq.buyerPlan).toBe('pro');

      const validRes = ProcurementCopilotResponseSchema.parse({
        structuredRfq: {
          commodity: 'Onion',
          variety: 'Commercial Red Hybrid',
          targetGrade: 'Grade A1',
          quantityTons: 20,
          packagingPreference: '50kg mesh bags',
          deliveryTimelineDays: 5,
          estimatedBudgetRangeInr: {
            minPerKg: 18,
            maxPerKg: 24,
          },
        },
        supplierComparison: [
          {
            supplierName: 'Nashik Agro FPO',
            clusterLocation: 'Lasalgaon, Nashik',
            distanceKm: 24.5,
            matchScorePct: 94,
            historicalFillRatePct: 98,
            onTimeDeliveryPct: 96,
            estimatedLeadDays: 2,
            strengths: ['Immediate stock availability', 'Cold-chain staging yard'],
            riskFactors: [],
          },
        ],
        negotiationSummary: 'Top match offers 94% alignment within 25km radius.',
        requiresHumanReview: true,
      });

      expect(validRes.requiresHumanReview).toBe(true);
      expect(validRes.supplierComparison[0]?.matchScorePct).toBe(94);
    });
  });

  describe('3. Supply-Demand Match Explanations', () => {
    it('validates multi-factor transparent match explanations', () => {
      const validReq = MatchExplanationRequestSchema.parse({
        listingDetails: {
          listingId: 'lst_101',
          commodity: 'Wheat',
          variety: 'Sharbati',
          grade: 'Grade A1',
          pricePerKg: 32,
          quantityKg: 5000,
          location: 'Sehore, MP',
        },
        requirementDetails: {
          requirementId: 'req_202',
          commodity: 'Wheat',
          preferredGrade: 'Grade A1',
          targetPricePerKg: 34,
          requiredQuantityKg: 4000,
          destinationLocation: 'Bhopal, MP',
        },
      });
      expect(validReq.listingDetails.commodity).toBe('Wheat');

      const validRes = MatchExplanationResponseSchema.parse({
        overallMatchScorePct: 92,
        rating: 'EXCELLENT',
        factors: {
          locationProximity: {
            factorName: 'Location Proximity',
            scorePct: 95,
            status: 'STRONG_ALIGNMENT',
            explanation: 'Under 40km between Sehore and Bhopal.',
          },
          gradeCompatibility: {
            factorName: 'Quality Grade',
            scorePct: 100,
            status: 'STRONG_ALIGNMENT',
            explanation: 'Both sides specified Grade A1.',
          },
          priceTolerance: {
            factorName: 'Price Alignment',
            scorePct: 90,
            status: 'STRONG_ALIGNMENT',
            explanation: 'Farmer price (₹32) is below buyer target (₹34).',
          },
          fulfillmentVolume: {
            factorName: 'Volume Coverage',
            scorePct: 100,
            status: 'STRONG_ALIGNMENT',
            explanation: 'Listing has 5,000kg, which fulfills 4,000kg requirement.',
          },
        },
        narrativeExplanation: 'Excellent alignment across grade, price, and logistics.',
        recommendedAction: 'Direct dispatch via regional corridor recommended.',
        frictionPoints: [],
      });

      expect(validRes.overallMatchScorePct).toBe(92);
      expect(validRes.factors.locationProximity.status).toBe('STRONG_ALIGNMENT');
    });
  });

  describe('4. Product Listing Copilot', () => {
    it('validates produce listing draft and requires farmer confirmation', () => {
      const validReq = ListingCopilotRequestSchema.parse({
        farmerNotes: 'Harvested 50 quintal organic mustard seed, cleaned and stored in dry bags',
        farmerTier: 'premier_pro',
      });
      expect(validReq.farmerTier).toBe('premier_pro');

      const validRes = ListingCopilotResponseSchema.parse({
        draftListing: {
          commodity: 'Mustard',
          variety: 'Pusa Bold / Organic',
          suggestedGrade: 'Grade A1',
          estimatedQuantityKg: 5000,
          unit: 'quintal',
          standardPackaging: '50kg HDPE laminated gunny bags',
          indicativePricePerKg: 54,
          minOrderQuantityKg: 500,
          searchTags: ['Mustard', 'Oilseed', 'Pusa Bold', 'High Oil Content'],
          description: 'Sun-dried clean mustard seed with moisture < 8%.',
          storageAdvice: 'Keep in dry ventilated storage off the floor.',
        },
        qualityChecklist: ['Verify moisture below 8%', 'Check bag seal integrity'],
        requiresFarmerConfirmation: true,
      });

      expect(validRes.requiresFarmerConfirmation).toBe(true);
      expect(validRes.draftListing.estimatedQuantityKg).toBe(5000);
    });
  });

  describe('Extension Schemas', () => {
    it('validates analytics narrative, traceability extractor, and support triage', () => {
      const narrative = AnalyticsNarrativeResponseSchema.parse({
        executiveSummary: 'Weekly marketplace GMV reached ₹12.5M with 98% fulfillment.',
        keyInsights: ['Tomato arrivals surged in Nashik', 'Mustard prices stabilized'],
        operationalRisks: ['Rainfall warning in coastal Andhra'],
      });
      expect(narrative.isAiAssisted).toBe(true);

      const traceability = TraceabilityExtractorResponseSchema.parse({
        batchNumber: 'BATCH-2026-TOM-001',
        harvestDate: '2026-10-10',
        farmDistrict: 'Kolar',
        moistureContentPct: 11.2,
        pesticideResidueStatus: 'TESTED_BELOW_MRL',
        coldChainRecommendedTempC: 12,
        narrative: 'Tested negative for organophosphates.',
      });
      expect(traceability.pesticideResidueStatus).toBe('TESTED_BELOW_MRL');

      const triage = SupportTriageResponseSchema.parse({
        category: 'PAYMENT_ESCROW',
        urgency: 'HIGH',
        suggestedAgentReply: 'We are verifying the T+1 nodal settlement for Order #102.',
        recommendedAction: 'Check RBI Nodal escrow ledger transaction status.',
      });
      expect(triage.category).toBe('PAYMENT_ESCROW');
    });
  });
});
