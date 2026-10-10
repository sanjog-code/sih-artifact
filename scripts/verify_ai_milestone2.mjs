import { generateForecast } from '../apps/web/src/lib/ai/forecast.ts';
import { solveCapacitatedVrp } from '../apps/web/src/lib/ai/vrp-solver.ts';
import { assessProduceQuality } from '../apps/web/src/lib/ai/produce-grading.ts';
import { calculateShelfLifeDecay } from '../apps/web/src/lib/ai/shelf-life.ts';
import {
  ForecastResponseSchema,
  RouteOptimizeResponseSchema,
  ProduceGradingResponseSchema,
  ShelfLifeResponseSchema,
} from '../packages/shared/src/schemas/ai.ts';

console.log('================================================================');
console.log('  MILESTONE 2: AI / ML PIPELINES & SERVING VERIFICATION SUITE');
console.log('================================================================\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passCount++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failCount++;
  }
}

// -----------------------------------------------------------------------------
// 1. Price & Demand Forecast Model Verification
// -----------------------------------------------------------------------------
console.log('[TEST GROUP 1] Mandi Price & Demand Forecasting');

// Tier 1: Exact Mandi Match
const t1Start = performance.now();
const resT1 = generateForecast({
  commodity: 'Potato',
  state: 'Uttar Pradesh',
  district: 'Agra',
  market: 'Agra',
});
const t1Elapsed = performance.now() - t1Start;
assert(resT1.success === true, 'Tier 1 response indicates success');
assert(resT1.fallbackLevel === 'EXACT_MARKET', `Tier 1 fallbackLevel is EXACT_MARKET (got ${resT1.fallbackLevel})`);
assert(resT1.testMaeKg === 0.64, `Potato verified test MAE is ₹0.64/kg (got ₹${resT1.testMaeKg})`);
assert(resT1.confidenceScore >= 0.90, `Tier 1 confidence score is >= 0.90 (got ${resT1.confidenceScore})`);
assert(t1Elapsed < 5.0, `In-memory forecast latency is < 5ms (measured ${t1Elapsed.toFixed(2)}ms)`);
const parsedT1 = ForecastResponseSchema.safeParse(resT1);
assert(parsedT1.success, 'Tier 1 response matches Zod ForecastResponseSchema strictly');

// Tier 2: District Aggregate
const resT2 = generateForecast({
  commodity: 'Wheat',
  state: 'Madhya Pradesh',
  district: 'Ujjain',
});
assert(resT2.fallbackLevel === 'DISTRICT_AGGREGATE', `Tier 2 fallbackLevel is DISTRICT_AGGREGATE (got ${resT2.fallbackLevel})`);
assert(resT2.testMaeKg === 0.33, `Wheat verified test MAE is ₹0.33/kg (got ₹${resT2.testMaeKg})`);
assert(resT2.mspFloor === 22.75, `Wheat statutory MSP floor is ₹22.75/kg (got ₹${resT2.mspFloor})`);
assert(resT2.predictedModalPrice >= resT2.mspFloor, 'Wheat predicted price honors statutory MSP floor');

// Tier 3: State Aggregate
const resT3 = generateForecast({
  commodity: 'Onion',
  state: 'Maharashtra',
  district: 'NonExistentDistrict123',
});
assert(resT3.fallbackLevel === 'STATE_AGGREGATE', `Tier 3 fallbackLevel is STATE_AGGREGATE (got ${resT3.fallbackLevel})`);
assert(resT3.testMaeKg === 2.76, `Onion verified test MAE is ₹2.76/kg (got ₹${resT3.testMaeKg})`);

// Tier 4: Commodity Baseline
const resT4 = generateForecast({
  commodity: 'Tomato',
  state: 'NonExistentStateXYZ',
});
assert(resT4.fallbackLevel === 'COMMODITY_BASELINE', `Tier 4 fallbackLevel is COMMODITY_BASELINE (got ${resT4.fallbackLevel})`);
assert(resT4.testMaeKg === 4.04, `Tomato verified test MAE is ₹4.04/kg (got ₹${resT4.testMaeKg})`);

// Tier 5: Agricultural Class Fallback with MSP Floors
const resT5 = generateForecast({
  commodity: 'Mustard',
  state: 'Rajasthan',
  district: 'Jaipur',
});
assert(resT5.fallbackLevel === 'NATIONAL_BASELINE', `Tier 5 fallbackLevel is NATIONAL_BASELINE (got ${resT5.fallbackLevel})`);
assert(resT5.mspFloor === 56.50, `Mustard statutory MSP floor is ₹56.50/kg (got ₹${resT5.mspFloor})`);
assert(resT5.predictedModalPrice >= 56.50, 'Mustard predicted price is >= MSP floor ₹56.50/kg');
assert(resT5.fairPriceRange.min > 0 && resT5.fairPriceRange.max > resT5.fairPriceRange.min, 'Fair price range is valid');

// Rice MAE check
const resRice = generateForecast({ commodity: 'Rice' });
assert(resRice.testMaeKg === 4.45, `Rice verified test MAE is ₹4.45/kg (got ₹${resRice.testMaeKg})`);

// -----------------------------------------------------------------------------
// 2. Capacitated VRP Solver Verification
// -----------------------------------------------------------------------------
console.log('\n[TEST GROUP 2] Capacitated Vehicle Routing Problem (Clarke-Wright + 2-Opt)');

// Single-Vehicle Tour
const singleTourRes = solveCapacitatedVrp({
  vehicleClass: 'VAN', // 1000 kg capacity
  origin: { name: 'Jaipur Hub', lat: 26.9124, lng: 75.7873 },
  waypoints: [
    { id: 'S1', name: 'Cluster A', lat: 26.8712, lng: 75.2341, payloadKg: 200 },
    { id: 'S2', name: 'Cluster B', lat: 26.8945, lng: 75.3124, payloadKg: 250 },
    { id: 'S3', name: 'Cluster C', lat: 27.1723, lng: 75.7231, payloadKg: 180 },
  ],
});
assert(singleTourRes.success === true, 'VRP single-tour returns success');
assert(singleTourRes.isMultiVehicle === false, 'Single vehicle handles total payload 630kg <= 1000kg');
assert(singleTourRes.routes.length === 1, 'Exactly 1 vehicle route returned');
assert(singleTourRes.distanceSavedKm > 0, `Route optimization saves distance vs baseline (${singleTourRes.distanceSavedKm} km saved)`);
assert(singleTourRes.fuelSavedLiters > 0, `Fuel saved calculated correctly (${singleTourRes.fuelSavedLiters} L)`);
assert(singleTourRes.co2AvertedKg > 0, `CO2 emissions averted calculated (${singleTourRes.co2AvertedKg} kg CO2)`);
const parsedVrp1 = RouteOptimizeResponseSchema.safeParse(singleTourRes);
assert(parsedVrp1.success, 'VRP single-tour matches RouteOptimizeResponseSchema strictly');

// Multi-Vehicle Tour (Overload Partitioning)
const multiTourRes = solveCapacitatedVrp({
  vehicleClass: 'VAN', // 1000 kg capacity
  origin: { name: 'Jaipur Hub', lat: 26.9124, lng: 75.7873 },
  waypoints: [
    { id: 'S1', name: 'Cluster A', lat: 26.8712, lng: 75.2341, payloadKg: 600 },
    { id: 'S2', name: 'Cluster B', lat: 26.8945, lng: 75.3124, payloadKg: 700 },
    { id: 'S3', name: 'Cluster C', lat: 27.1723, lng: 75.7231, payloadKg: 500 },
  ],
});
assert(multiTourRes.isMultiVehicle === true, 'VRP partitions into multiple vehicles when payload (1800kg) > capacity (1000kg)');
assert(multiTourRes.routes.length >= 2, `Multi-vehicle generates >= 2 routes (got ${multiTourRes.routes.length})`);
for (const r of multiTourRes.routes) {
  assert(r.payloadKg <= 1000, `Vehicle ${r.vehicleId} payload (${r.payloadKg}kg) adheres to 1000kg capacity limit`);
}
const parsedVrp2 = RouteOptimizeResponseSchema.safeParse(multiTourRes);
assert(parsedVrp2.success, 'VRP multi-tour matches RouteOptimizeResponseSchema strictly');

// Custom Distance Matrix Execution
const matrixRes = solveCapacitatedVrp({
  vehicleClass: 'CAR', // 200 kg capacity
  distanceMatrix: [
    [0, 10, 20],
    [10, 0, 8],
    [20, 8, 0],
  ],
  waypoints: [
    { id: 'M1', name: 'Stop 1', lat: 0, lng: 0, payloadKg: 90 },
    { id: 'M2', name: 'Stop 2', lat: 0, lng: 0, payloadKg: 80 },
  ],
});
assert(matrixRes.success === true, 'VRP accepts and solves with custom distance matrix');
assert(matrixRes.totalDistanceKm <= matrixRes.baselineDistanceKm, 'Optimized distance is <= baseline distance');

// -----------------------------------------------------------------------------
// 3. Produce Quality Grading Verification (AGMARK Standard)
// -----------------------------------------------------------------------------
console.log('\n[TEST GROUP 3] Produce Quality Grading (AGMARK Heuristics)');

// Grade A1 (Pristine / Minimal defect)
const gradeA1Res = assessProduceQuality({
  commodity: 'Tomato',
  defects: [{ type: 'discoloration', severity: 0.1, areaPct: 1.0 }],
  lightingScore: 1.0,
});
assert(gradeA1Res.grade === 'Grade A1', `Pristine produce classified as Grade A1 (got ${gradeA1Res.grade})`);
assert(gradeA1Res.qualityScore >= 88, `Grade A1 score is >= 88 (got ${gradeA1Res.qualityScore})`);
assert(gradeA1Res.suggestedDiscountPercent === 0, 'Grade A1 has 0% suggested discount');
const parsedGrade1 = ProduceGradingResponseSchema.safeParse(gradeA1Res);
assert(parsedGrade1.success, 'Grade A1 matches ProduceGradingResponseSchema strictly');

// Grade A2 (Standard wholesale)
const gradeA2Res = assessProduceQuality({
  commodity: 'Potato',
  defects: [
    { type: 'bruising', severity: 0.25, areaPct: 2.5 },
    { type: 'foreign_matter', severity: 0.2, areaPct: 2.0 },
  ],
});
assert(gradeA2Res.grade === 'Grade A2', `Moderate defects classified as Grade A2 (got ${gradeA2Res.grade})`);
assert(gradeA2Res.qualityScore >= 75 && gradeA2Res.qualityScore < 88, `Grade A2 score in range [75, 88) (got ${gradeA2Res.qualityScore})`);
assert(gradeA2Res.suggestedDiscountPercent > 0 && gradeA2Res.suggestedDiscountPercent <= 10, 'Grade A2 has discount in [1%, 10%]');

// Reject (Fungal decay or severe spoilage)
const gradeRejectRes = assessProduceQuality({
  commodity: 'Tomato',
  defects: [
    { type: 'fungal_decay', severity: 0.8, areaPct: 12.0 },
  ],
});
assert(gradeRejectRes.grade === 'Reject', `Fungal decay leads to Reject (got ${gradeRejectRes.grade})`);
assert(gradeRejectRes.suggestedDiscountPercent === 100, 'Reject has 100% discount / liquidation recommendation');

// -----------------------------------------------------------------------------
// 4. Storage Shelf-Life Decay Verification (Arrhenius & VPD Kinetics)
// -----------------------------------------------------------------------------
console.log('\n[TEST GROUP 4] Storage Shelf-Life Decay (Arrhenius & VPD Kinetics)');

// Tomato at Room Temperature (25°C, 65% RH)
const shelfTomatoWarm = calculateShelfLifeDecay({
  commodity: 'Tomato',
  currentQualityScore: 100,
  storageDays: 3,
  ambientTemperatureC: 25,
  relativeHumidityPct: 65,
});
assert(shelfTomatoWarm.success === true, 'Shelf-life calculation succeeds');
assert(shelfTomatoWarm.remainingShelfLifeDays > 0, `Remaining shelf life > 0 (${shelfTomatoWarm.remainingShelfLifeDays} days)`);
assert(shelfTomatoWarm.currentQualityRetainedPct < 100, `Quality decays over 3 days at 25°C (retained: ${shelfTomatoWarm.currentQualityRetainedPct}%)`);
assert(shelfTomatoWarm.retentionCurve.length > 0, 'Retention projection curve generated');
const parsedShelf1 = ShelfLifeResponseSchema.safeParse(shelfTomatoWarm);
assert(parsedShelf1.success, 'Shelf-life result matches ShelfLifeResponseSchema strictly');

// Cold Storage Benefit Comparison (4°C vs 25°C)
const shelfTomatoCold = calculateShelfLifeDecay({
  commodity: 'Tomato',
  currentQualityScore: 100,
  storageDays: 3,
  ambientTemperatureC: 4,
  relativeHumidityPct: 90,
  isColdStorage: true,
});
assert(shelfTomatoCold.remainingShelfLifeDays > shelfTomatoWarm.remainingShelfLifeDays,
  `Cold storage preserves longer shelf-life (${shelfTomatoCold.remainingShelfLifeDays} days cold vs ${shelfTomatoWarm.remainingShelfLifeDays} days ambient)`);
assert(shelfTomatoCold.currentQualityRetainedPct > shelfTomatoWarm.currentQualityRetainedPct,
  `Cold storage retains higher quality (${shelfTomatoCold.currentQualityRetainedPct}% cold vs ${shelfTomatoWarm.currentQualityRetainedPct}% ambient)`);

// Dynamic Markdown Triggering
const shelfAged = calculateShelfLifeDecay({
  commodity: 'Tomato',
  currentQualityScore: 100,
  storageDays: 7,
  ambientTemperatureC: 28,
  relativeHumidityPct: 50,
});
assert(shelfAged.dynamicMarkdownPercent > 0 && shelfAged.dynamicMarkdownPercent <= 35,
  `Aging produce triggers dynamic markdown discount (${shelfAged.dynamicMarkdownPercent}%)`);
assert(['EXPEDITE_SALE', 'DISPOSAL_RISK', 'MONITOR'].includes(shelfAged.riskLevel),
  `Elevated storage time flags increased risk level: ${shelfAged.riskLevel}`);

// Dry Grain Preservation (Wheat)
const shelfWheat = calculateShelfLifeDecay({
  commodity: 'Wheat',
  currentQualityScore: 100,
  storageDays: 60,
  ambientTemperatureC: 20,
  relativeHumidityPct: 55,
});
assert(shelfWheat.remainingShelfLifeDays > 100,
  `Dry grain has long preservation life (${shelfWheat.remainingShelfLifeDays} days remaining after 60 days)`);
assert(shelfWheat.riskLevel === 'OPTIMAL', 'Wheat remains in OPTIMAL condition');

// -----------------------------------------------------------------------------
// Summary
// -----------------------------------------------------------------------------
console.log('\n================================================================');
console.log(`  VERIFICATION COMPLETE: ${passCount} PASSED, ${failCount} FAILED`);
console.log('================================================================');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('All Milestone 2 AI & ML Pipelines & Serving Endpoints Verified 100% Successfully!\n');
}
