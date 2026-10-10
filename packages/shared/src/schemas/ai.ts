import { z } from 'zod';

// ============================================================================
// 1. Price & Demand Forecasting Schemas
// ============================================================================

export const ForecastDemandSignalEnum = z.enum([
  'HIGH_DEMAND',
  'CLEARANCE_ADVISED',
  'STABLE',
]);
export type ForecastDemandSignal = z.infer<typeof ForecastDemandSignalEnum>;
export type AiDemandSignal = ForecastDemandSignal;

export const FallbackLevelEnum = z.enum([
  'EXACT_MARKET',
  'DISTRICT_AGGREGATE',
  'STATE_AGGREGATE',
  'COMMODITY_BASELINE',
  'NATIONAL_BASELINE',
]);
export type FallbackLevel = z.infer<typeof FallbackLevelEnum>;

export const ForecastRequestSchema = z.object({
  commodity: z.string().min(1, 'Commodity is required'),
  state: z.string().optional(),
  district: z.string().optional(),
  market: z.string().optional(),
  storageDays: z.coerce.number().min(0).max(365).optional().default(0),
});
export type ForecastRequest = z.infer<typeof ForecastRequestSchema>;

export const ForecastFairPriceRangeSchema = z.object({
  min: z.number().nonnegative(),
  max: z.number().nonnegative(),
});
export type ForecastFairPriceRange = z.infer<typeof ForecastFairPriceRangeSchema>;

export const ForecastModelMetricsSchema = z.object({
  algorithm: z.string(),
  datasetRecords: z.number().int().nonnegative(),
  testMaeQuintal: z.number().nonnegative(),
  testMaeKg: z.number().nonnegative(),
  status: z.string(),
});
export type ForecastModelMetrics = z.infer<typeof ForecastModelMetricsSchema>;

export const ForecastResponseSchema = z.object({
  success: z.boolean(),
  commodity: z.string(),
  state: z.string().optional(),
  district: z.string().optional(),
  market: z.string().optional(),
  currentModalPrice: z.number().nonnegative(),
  predictedModalPrice: z.number().nonnegative(),
  predictedChangePercent: z.number(),
  confidenceScore: z.number().min(0).max(1),
  testMaeQuintal: z.number().nonnegative(),
  testMaeKg: z.number().nonnegative(),
  mspFloor: z.number().nonnegative(),
  demandSignal: ForecastDemandSignalEnum,
  fairPriceRange: ForecastFairPriceRangeSchema,
  factors: z.array(z.string()),
  fallbackLevel: FallbackLevelEnum,
  priceChange: z.number().optional(),
  mspProtected: z.boolean().optional(),
  modelMetrics: ForecastModelMetricsSchema.optional(),
  timestamp: z.string().datetime().optional(),
});
export type ForecastResponse = z.infer<typeof ForecastResponseSchema>;

// ============================================================================
// 2. Capacitated Vehicle Routing Problem (VRP) Schemas
// ============================================================================

export const VehicleClassEnum = z.enum([
  'TWO_WHEELER',
  'CAR',
  'VAN',
  'TRUCK',
]);
export type VehicleClass = z.infer<typeof VehicleClassEnum>;

export const VEHICLE_CAPACITIES_KG: Record<VehicleClass, number> = {
  TWO_WHEELER: 50,
  CAR: 200,
  VAN: 1000,
  TRUCK: 10000,
};

export const WaypointTypeEnum = z.enum(['DEPOT', 'PICKUP', 'DROPOFF']);
export type WaypointType = z.infer<typeof WaypointTypeEnum>;

export const WaypointSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  payloadKg: z.number().nonnegative(),
  type: WaypointTypeEnum.optional().default('PICKUP'),
});
export type Waypoint = z.infer<typeof WaypointSchema>;

export const OriginSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});
export type Origin = z.infer<typeof OriginSchema>;

export const RouteOptimizeRequestSchema = z.object({
  waypoints: z.array(WaypointSchema).min(1, 'At least one waypoint required').optional(),
  stops: z.array(
    z.object({
      id: z.string().min(1),
      name: z.string().min(1),
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180).optional(),
      lon: z.number().min(-180).max(180).optional(),
      quantityKg: z.number().nonnegative().optional(),
      payloadKg: z.number().nonnegative().optional(),
      type: WaypointTypeEnum.optional(),
    })
  ).optional(),
  origin: OriginSchema.optional(),
  vehicleClass: VehicleClassEnum.optional().default('VAN'),
  vehicleType: VehicleClassEnum.optional(),
  distanceMatrix: z.array(z.array(z.number().nonnegative())).optional(),
  customCapacityKg: z.number().positive().max(100000).optional(),
});
export type RouteOptimizeRequest = z.infer<typeof RouteOptimizeRequestSchema>;

export const RouteStopSchema = z.object({
  id: z.string(),
  name: z.string(),
  lat: z.number(),
  lng: z.number(),
  payloadKg: z.number(),
  cumulativeLoadKg: z.number(),
  distanceToNextKm: z.number(),
  durationToNextMinutes: z.number().optional(),
});
export type RouteStop = z.infer<typeof RouteStopSchema>;

export const SingleVehicleRouteSchema = z.object({
  vehicleId: z.number().int().positive(),
  stops: z.array(RouteStopSchema),
  distanceKm: z.number().nonnegative(),
  durationMinutes: z.number().nonnegative(),
  payloadKg: z.number().nonnegative(),
});
export type SingleVehicleRoute = z.infer<typeof SingleVehicleRouteSchema>;

export const RouteOptimizeResponseSchema = z.object({
  success: z.boolean(),
  vehicleClass: VehicleClassEnum,
  capacityLimitKg: z.number().positive(),
  totalPayloadKg: z.number().nonnegative(),
  capacityUtilizationPercent: z.number().min(0),
  routes: z.array(SingleVehicleRouteSchema),
  totalDistanceKm: z.number().nonnegative(),
  baselineDistanceKm: z.number().nonnegative(),
  distanceSavedKm: z.number().nonnegative(),
  fuelSavedLiters: z.number().nonnegative(),
  co2AvertedKg: z.number().nonnegative(),
  isMultiVehicle: z.boolean(),
  unoptimizedDistanceKm: z.number().nonnegative().optional(),
  co2SavedKg: z.number().nonnegative().optional(),
  timestamp: z.string().datetime().optional(),
});
export type RouteOptimizeResponse = z.infer<typeof RouteOptimizeResponseSchema>;

// ============================================================================
// 3. Produce Quality Grading Schemas (AGMARK Standard)
// ============================================================================

export const AgmarkGradeEnum = z.enum([
  'Grade A1',
  'Grade A2',
  'Grade B',
  'Grade C',
  'Reject',
]);
export type AgmarkGrade = z.infer<typeof AgmarkGradeEnum>;

export const DefectTypeEnum = z.enum([
  'bruising',
  'discoloration',
  'shriveling',
  'foreign_matter',
  'fungal_decay',
  'physical_damage',
  'spoilage',
  'other',
]);
export type DefectType = z.infer<typeof DefectTypeEnum>;

export const DefectItemSchema = z.object({
  type: z.string().min(1),
  severity: z.number().min(0).max(1),
  areaPct: z.number().min(0).max(100),
});
export type DefectItem = z.infer<typeof DefectItemSchema>;

export const ProduceGradingRequestSchema = z.object({
  commodity: z.string().min(1, 'Commodity is required'),
  defects: z.array(DefectItemSchema).default([]),
  lightingScore: z.number().min(0).max(1).optional().default(1.0),
  sampleWeightGrams: z.number().positive().optional(),
});
export type ProduceGradingRequest = z.infer<typeof ProduceGradingRequestSchema>;

export const ProduceGradingMetricsSchema = z.object({
  totalDefectAreaPct: z.number().min(0).max(100),
  primaryDefect: z.string().optional(),
  agmarkStandardMet: z.boolean(),
  cleanlinessScore: z.number().min(0).max(100),
});
export type ProduceGradingMetrics = z.infer<typeof ProduceGradingMetricsSchema>;

export const ProduceGradingResponseSchema = z.object({
  success: z.boolean(),
  commodity: z.string(),
  qualityScore: z.number().min(0).max(100),
  grade: AgmarkGradeEnum,
  defectSummary: z.array(z.string()),
  suggestedDiscountPercent: z.number().min(0).max(100),
  metrics: ProduceGradingMetricsSchema.optional(),
  timestamp: z.string().datetime().optional(),
});
export type ProduceGradingResponse = z.infer<typeof ProduceGradingResponseSchema>;

// ============================================================================
// 4. Storage Shelf-Life Decay Schemas (Arrhenius & VPD Kinetics)
// ============================================================================

export const ShelfLifeRiskLevelEnum = z.enum([
  'OPTIMAL',
  'MONITOR',
  'EXPEDITE_SALE',
  'DISPOSAL_RISK',
]);
export type ShelfLifeRiskLevel = z.infer<typeof ShelfLifeRiskLevelEnum>;

export const ShelfLifeRequestSchema = z.object({
  commodity: z.string().min(1, 'Commodity is required'),
  currentQualityScore: z.coerce.number().min(0).max(100).default(100),
  storageDays: z.coerce.number().min(0).max(720).default(0),
  ambientTemperatureC: z.coerce.number().min(-10).max(55).default(25),
  relativeHumidityPct: z.coerce.number().min(1).max(100).default(70),
  isColdStorage: z.coerce.boolean().optional().default(false),
});
export type ShelfLifeRequest = z.infer<typeof ShelfLifeRequestSchema>;

export const RetentionPointSchema = z.object({
  day: z.number().int().nonnegative(),
  retainedQualityPct: z.number().min(0).max(100),
  recommendedDiscountPct: z.number().min(0).max(100),
});
export type RetentionPoint = z.infer<typeof RetentionPointSchema>;

export const ShelfLifeResponseSchema = z.object({
  success: z.boolean(),
  commodity: z.string(),
  remainingShelfLifeDays: z.number().min(0),
  currentQualityRetainedPct: z.number().min(0).max(100),
  decayRatePerDay: z.number().nonnegative(),
  dynamicMarkdownPercent: z.number().min(0).max(100),
  riskLevel: ShelfLifeRiskLevelEnum,
  retentionCurve: z.array(RetentionPointSchema).optional(),
  recommendations: z.array(z.string()).optional(),
  timestamp: z.string().datetime().optional(),
});
export type ShelfLifeResponse = z.infer<typeof ShelfLifeResponseSchema>;
