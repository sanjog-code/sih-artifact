import { LanguageCode } from './LanguageContext';

export interface FarmerSellTranslations {
  // Form Header & Subtitle
  formHeaderTitle: string;
  formHeaderSubtitle: string;

  // Section 1: Official ICAR / CCEA Registered Crop Selector
  section1Title: string;
  selectedCropLabel: string;
  mspPrefixLabel: string;
  searchCropsPlaceholder: string;
  clearSearchBtn: string;
  catAll: string;
  catCereals: string;
  catPulses: string;
  catOilseeds: string;
  catVegetables: string;
  catFruits: string;
  catSpices: string;
  catCommercial: string;
  cropSelectedCertified: string;

  // Section 2: Quantity
  section2Title: string;
  kgUnit: string;

  // Section 3: AGMARK Quality Grade
  section3Title: string;
  gradeA1Title: string;
  gradeA1Desc: string;
  gradeA2Title: string;
  gradeA2Desc: string;
  gradeBTitle: string;
  gradeBDesc: string;

  // Section 4: Price & Commission Breakdown
  section4Title: string;
  useAiRateLabel: string;
  cacpStatutoryMspLabel: string;
  hardFloorBadge: string;
  distressGuardrailActive: string;
  estTotalHarvestValueLabel: string;
  platformFeeBreakdownLabel: string;
  directFarmerEscrowPayoutLabel: string;
  zeroSubscriptionNotice: string;
  statutoryMspFloorText: string;
  escrowProtection100: string;

  // Section 5: Farm Location & Pickup Address
  section5Title: string;
  useFarmGpsBtn: string;
  detectingGpsLabel: string;
  addressPlaceholder: string;
  pincodePlaceholder: string;
  geocodedCoordinatesLabel: string;

  // Form Buttons & Actions
  publishLotBtn: string;
  cancelBtn: string;
}
