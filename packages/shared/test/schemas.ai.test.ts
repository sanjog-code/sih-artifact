import {
  ForecastRequestSchema,
  ForecastResponseSchema,
  RouteOptimizeRequestSchema,
  RouteOptimizeResponseSchema,
  ProduceGradingRequestSchema,
  ProduceGradingResponseSchema,
  ShelfLifeRequestSchema,
  ShelfLifeResponseSchema,
  VEHICLE_CAPACITIES_KG,
} from '../src/schemas/ai';

describe('AI Zod Schemas (@farmlink/shared)', () => {
  describe('Forecast Schemas', () => {
    it('validates a valid forecast request', () => {
      const parsed = ForecastRequestSchema.safeParse({
        commodity: 'Potato',
        state: 'UP',
        district: 'Agra',
        market: 'Agra APMC',
        storageDays: 3,
      });
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.commodity).toBe('Potato');
        expect(parsed.data.storageDays).toBe(3);
      }
    });

    it('validates minimal forecast request with defaults', () => {
      const parsed = ForecastRequestSchema.safeParse({ commodity: 'Wheat' });
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.storageDays).toBe(0);
      }
    });

    it('rejects empty commodity', () => {
      const parsed = ForecastRequestSchema.safeParse({ commodity: '' });
      expect(parsed.success).toBe(false);
    });

    it('validates a complete forecast response conforming to contract', () => {
      const validResponse = {
        success: true,
        commodity: 'Wheat',
        state: 'MP',
        district: 'Ujjain',
        market: 'Ujjain Mandi',
        currentModalPrice: 24.5,
        predictedModalPrice: 25.1,
        predictedChangePercent: 2.45,
        confidenceScore: 0.94,
        testMaeQuintal: 32.69,
        testMaeKg: 0.33,
        mspFloor: 22.75,
        demandSignal: 'HIGH_DEMAND' as const,
        fairPriceRange: { min: 23.59, max: 26.61 },
        factors: ['APMC arrival trend steady', 'MSP floor verified at 22.75'],
        fallbackLevel: 'EXACT_MARKET' as const,
        priceChange: 0.6,
        mspProtected: false,
      };

      const parsed = ForecastResponseSchema.safeParse(validResponse);
      expect(parsed.success).toBe(true);
    });
  });

  describe('Route Optimization Schemas', () => {
    it('validates vehicle capacities constants', () => {
      expect(VEHICLE_CAPACITIES_KG.TWO_WHEELER).toBe(50);
      expect(VEHICLE_CAPACITIES_KG.CAR).toBe(200);
      expect(VEHICLE_CAPACITIES_KG.VAN).toBe(1000);
      expect(VEHICLE_CAPACITIES_KG.TRUCK).toBe(10000);
    });

    it('validates route optimize request with waypoints and custom matrix', () => {
      const parsed = RouteOptimizeRequestSchema.safeParse({
        vehicleClass: 'VAN',
        waypoints: [
          { id: 'W-1', name: 'Stop 1', lat: 26.9, lng: 75.8, payloadKg: 250 },
          { id: 'W-2', name: 'Stop 2', lat: 27.1, lng: 75.6, payloadKg: 400 },
        ],
        distanceMatrix: [
          [0, 15, 25],
          [15, 0, 12],
          [25, 12, 0],
        ],
      });
      expect(parsed.success).toBe(true);
    });

    it('validates route optimize response', () => {
      const validResponse = {
        success: true,
        vehicleClass: 'VAN' as const,
        capacityLimitKg: 1000,
        totalPayloadKg: 650,
        capacityUtilizationPercent: 65.0,
        routes: [
          {
            vehicleId: 1,
            stops: [
              {
                id: 'W-1',
                name: 'Stop 1',
                lat: 26.9,
                lng: 75.8,
                payloadKg: 250,
                cumulativeLoadKg: 250,
                distanceToNextKm: 12.0,
                durationToNextMinutes: 32,
              },
            ],
            distanceKm: 42.5,
            durationMinutes: 75,
            payloadKg: 650,
          },
        ],
        totalDistanceKm: 42.5,
        baselineDistanceKm: 80.0,
        distanceSavedKm: 37.5,
        fuelSavedLiters: 4.5,
        co2AvertedKg: 12.06,
        isMultiVehicle: false,
      };

      const parsed = RouteOptimizeResponseSchema.safeParse(validResponse);
      expect(parsed.success).toBe(true);
    });
  });

  describe('Produce Quality Grading Schemas', () => {
    it('validates grading request and response', () => {
      const req = ProduceGradingRequestSchema.safeParse({
        commodity: 'Tomato',
        defects: [
          { type: 'bruising', severity: 0.2, areaPct: 1.5 },
          { type: 'discoloration', severity: 0.1, areaPct: 0.8 },
        ],
        lightingScore: 0.95,
      });
      expect(req.success).toBe(true);

      const res = ProduceGradingResponseSchema.safeParse({
        success: true,
        commodity: 'Tomato',
        qualityScore: 91.2,
        grade: 'Grade A1',
        defectSummary: ['Minor bruising on 1.5% surface'],
        suggestedDiscountPercent: 0,
        metrics: {
          totalDefectAreaPct: 2.3,
          primaryDefect: 'bruising',
          agmarkStandardMet: true,
          cleanlinessScore: 92.0,
        },
      });
      expect(res.success).toBe(true);
    });
  });

  describe('Storage Shelf-Life Schemas', () => {
    it('validates shelf-life decay request and response', () => {
      const req = ShelfLifeRequestSchema.safeParse({
        commodity: 'Potato',
        currentQualityScore: 95,
        storageDays: 14,
        ambientTemperatureC: 18,
        relativeHumidityPct: 80,
      });
      expect(req.success).toBe(true);

      const res = ShelfLifeResponseSchema.safeParse({
        success: true,
        commodity: 'Potato',
        remainingShelfLifeDays: 110.5,
        currentQualityRetainedPct: 88.4,
        decayRatePerDay: 0.0062,
        dynamicMarkdownPercent: 0,
        riskLevel: 'OPTIMAL',
        retentionCurve: [
          { day: 0, retainedQualityPct: 88.4, recommendedDiscountPct: 0 },
          { day: 10, retainedQualityPct: 83.1, recommendedDiscountPct: 2.5 },
        ],
        recommendations: ['Optimal storage condition documented.'],
      });
      expect(res.success).toBe(true);
    });
  });
});
