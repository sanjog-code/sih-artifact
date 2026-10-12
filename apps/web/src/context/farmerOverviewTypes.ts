import { LanguageCode } from './LanguageContext';

export interface FarmerOverviewTranslations {
  // Section 1: AI Selling Opportunity
  aiOppBadge: string;
  aiOppTitle: string;
  aiOppSubtitle: string;
  confidenceScore: string;
  oppHeadline: string;
  oppDescription: string;
  currentModal: string;
  projected72h: string;
  statutoryMsp: string;
  listHarvestLotBtn: string;
  viewDeclarationsBtn: string;

  // Section 2: Kisan Quick Controls
  quickControlsTitle: string;
  declareLotTitle: string;
  declareLotDesc: string;
  myDeclarationsTitle: string;
  myDeclarationsDesc: string;
  t1PayoutTitle: string;
  t1PayoutDesc: string;
  kisanHelplineLabel: string;

  // Section 3: Market Demand Advisory & Recommended Crops
  demandAdvisoryBadge: string;
  demandAdvisoryTitle: string;
  demandAdvisorySubtitle: string;
  recommendationsCount: string;
  expectedModalPriceLabel: string;
  cacpMspFloorLabel: string;
  optimalCycleLabel: string;
  storageOptionLabel: string;
  declareLotAction: string;

  // Specific Crops
  tomatoCategory: string;
  tomatoTrend: string;
  tomatoName: string;
  tomatoDriver: string;
  tomatoCycle: string;
  tomatoStorage: string;
  tomatoAction: string;

  wheatCategory: string;
  wheatTrend: string;
  wheatName: string;
  wheatDriver: string;
  wheatCycle: string;
  wheatStorage: string;
  wheatAction: string;

  mustardCategory: string;
  mustardTrend: string;
  mustardName: string;
  mustardDriver: string;
  mustardCycle: string;
  mustardStorage: string;
  mustardAction: string;

  soybeanCategory: string;
  soybeanTrend: string;
  soybeanName: string;
  soybeanDriver: string;
  soybeanCycle: string;
  soybeanStorage: string;
  soybeanAction: string;

  // Section 4: Weather & Spraying Advisory
  weatherTelemetryBadge: string;
  weatherTitle: string;
  weatherSubtitle: string;
  refreshWeather: string;
  sprayingWindowSafe: string;
  windowHoursSafe: string;
  temperatureLabel: string;
  windSpeedLabel: string;
  lowDriftRisk: string;
  highDriftRisk: string;
  precipitationLabel: string;
  dryFieldSurface: string;
  washoutHazard: string;
  harvestWindowLabel: string;
  harvestOptimal: string;
  harvestCaution: string;
  wdraIntakeReady: string;
  outlookTitle: string;
  maxMinLabel: string;
  rainProbLabel: string;

  // Section 5: Smart Listing Guide (Holding Simulator)
  smartGuideBadge: string;
  smartGuideTitle: string;
  smartGuideSubtitle: string;
  lotVolumeLabel: string;
  mspProtectedNote: string;
  holdingDurationLabel: string;
  holdingDaysValue: string;
  spotDayLabel: string;
  days30Label: string;
  days60Label: string;
  simulatedEconomicImpact: string;
  holdingProfitableSummary: string;
  holdingUnprofitableSummary: string;
  strategyATitle: string;
  strategyABadge: string;
  currentSpotPriceLabel: string;
  storageFeesLabel: string;
  storageFeesZero: string;
  moistureLossLabel: string;
  moistureLossZero: string;
  netImmediatePayoutLabel: string;
  strategyBTitle: string;
  strategyBBadge: string;
  projectedClearingRateLabel: string;
  vaultRentalLabel: string;
  moistureVarianceLabel: string;
  netProjectedRealizationLabel: string;

  // Section 6: Honest Mandi Comparison Engine
  calculatorBadge: string;
  calculatorTitle: string;
  calculatorSubtitle: string;
  tonnesBadge: string;
  commodityPriceLabel: string;
  harvestLotVolumeLabel: string;
  localKmLabel: string;
  distantKmLabel: string;
  distanceToMandiLabel: string;
  traditionalMandiTitle: string;
  highDeductionsBadge: string;
  grossMarketValueLabel: string;
  arhtiyaCutLabel: string;
  mandiCessLabel: string;
  palledariLabel: string;
  weightLossLabel: string;
  tractorHaulageLabel: string;
  netTakeHomeLabel: string;
  fasalMatrixRouteTitle: string;
  directGateBadge: string;
  grossTradeValueLabel: string;
  platformFeeLabel: string;
  doorstepLogisticsLabel: string;
  doorstepLogisticsFree: string;
  weighingDeductionsLabel: string;
  weighingDeductionsZero: string;
  paymentCycleLabel: string;
  paymentCycleT1: string;
  incomeRetainedBanner: string;
  gainPercentageOverMandi: string;
}
