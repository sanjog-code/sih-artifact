// Comprehensive Agricultural Crop Taxonomy based on Indian Council of Agricultural Research (ICAR)
// and Directorate of Economics and Statistics, Ministry of Agriculture & Farmers Welfare, Govt of India

export type IcarCropCategory =
  | 'cereals'
  | 'pulses'
  | 'oilseeds'
  | 'vegetables'
  | 'fruits'
  | 'commercial';

export interface IcarCropDefinition {
  id: string;
  name: string;
  hindiName: string;
  category: IcarCropCategory;
  categoryLabel: string;
  season: 'Kharif' | 'Rabi' | 'Zaid' | 'Perennial';
  mspFloorKg?: number; // 2025-26 statutory MSP floor in ₹/kg (CCEA statutory benchmark)
  standardGrades: Array<'A1' | 'A2' | 'B'>;
  shelfLifeDaysAmbient: number;
  description: string;
}

export const ICAR_CROPS: IcarCropDefinition[] = [
  // ── 1. CEREALS & GRAINS (खाद्यान्न) ──────────────────────────────────────────
  {
    id: 'crop-wheat',
    name: 'Wheat',
    hindiName: 'गेहूं (Kanak / Gehun)',
    category: 'cereals',
    categoryLabel: 'Cereals & Foodgrains',
    season: 'Rabi',
    mspFloorKg: 24.25, // ₹2,425 / quintal
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 365,
    description: 'ICAR standard Triticum aestivum (Sharbati, HD-2967, PBW-343) grain for flour milling and storage.',
  },
  {
    id: 'crop-paddy',
    name: 'Paddy / Rice',
    hindiName: 'धान / चावल (Dhan)',
    category: 'cereals',
    categoryLabel: 'Cereals & Foodgrains',
    season: 'Kharif',
    mspFloorKg: 23.00, // ₹2,300 / quintal
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 270,
    description: 'Oryza sativa common & Grade-A paddy varieties meeting FCI/WDRA grain moisture parameters.',
  },
  {
    id: 'crop-maize',
    name: 'Maize',
    hindiName: 'मक्का (Makka)',
    category: 'cereals',
    categoryLabel: 'Cereals & Foodgrains',
    season: 'Kharif',
    mspFloorKg: 20.90, // ₹2,090 / quintal
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 180,
    description: 'Zea mays yellow feed and food starch maize grain.',
  },
  {
    id: 'crop-barley',
    name: 'Barley',
    hindiName: 'जौ (Jau)',
    category: 'cereals',
    categoryLabel: 'Cereals & Foodgrains',
    season: 'Rabi',
    mspFloorKg: 18.50, // ₹1,850 / quintal
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 300,
    description: 'Hordeum vulgare malting and feed barley.',
  },
  {
    id: 'crop-bajra',
    name: 'Bajra (Pearl Millet)',
    hindiName: 'बाजरा (Bajra)',
    category: 'cereals',
    categoryLabel: 'Cereals & Foodgrains',
    season: 'Kharif',
    mspFloorKg: 26.25, // ₹2,625 / quintal
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 150,
    description: 'Pennisetum glaucum climate-resilient nutri-cereal.',
  },
  {
    id: 'crop-jowar',
    name: 'Jowar (Sorghum)',
    hindiName: 'ज्वार (Jowar)',
    category: 'cereals',
    categoryLabel: 'Cereals & Foodgrains',
    season: 'Kharif',
    mspFloorKg: 33.71, // ₹3,371 / quintal
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 180,
    description: 'Sorghum bicolor hybrid & malkandi nutri-grain.',
  },

  // ── 2. PULSES (दलहन) ──────────────────────────────────────────────────────────
  {
    id: 'crop-chana',
    name: 'Chana (Gram)',
    hindiName: 'चना (Desi & Kabuli Chana)',
    category: 'pulses',
    categoryLabel: 'Pulses & Legumes',
    season: 'Rabi',
    mspFloorKg: 56.50, // ₹5,650 / quintal
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 240,
    description: 'Cicer arietinum whole chickpea pulse.',
  },
  {
    id: 'crop-soybean',
    name: 'Soybean',
    hindiName: 'सोयाबीन (Soybean)',
    category: 'pulses',
    categoryLabel: 'Pulses & Legumes',
    season: 'Kharif',
    mspFloorKg: 48.92, // ₹4,892 / quintal
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 180,
    description: 'Glycine max yellow high-protein and oilseed grain.',
  },
  {
    id: 'crop-moong',
    name: 'Moong (Green Gram)',
    hindiName: 'मूंग (Green Gram)',
    category: 'pulses',
    categoryLabel: 'Pulses & Legumes',
    season: 'Kharif',
    mspFloorKg: 85.58, // ₹8,558 / quintal
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 210,
    description: 'Vigna radiata bright green clean dal pulse.',
  },
  {
    id: 'crop-tur',
    name: 'Arhar / Tur (Pigeon Pea)',
    hindiName: 'अरहर / तूर (Tur Dal)',
    category: 'pulses',
    categoryLabel: 'Pulses & Legumes',
    season: 'Kharif',
    mspFloorKg: 75.50, // ₹7,550 / quintal
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 240,
    description: 'Cajanus cajan whole unpolished pigeon pea.',
  },
  {
    id: 'crop-urad',
    name: 'Urad (Black Gram)',
    hindiName: 'उड़द (Black Matpe)',
    category: 'pulses',
    categoryLabel: 'Pulses & Legumes',
    season: 'Kharif',
    mspFloorKg: 74.00, // ₹7,400 / quintal
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 210,
    description: 'Vigna mungo black pulse grain.',
  },
  {
    id: 'crop-masoor',
    name: 'Masoor (Lentil)',
    hindiName: 'मसूर (Red Lentil)',
    category: 'pulses',
    categoryLabel: 'Pulses & Legumes',
    season: 'Rabi',
    mspFloorKg: 67.00, // ₹6,700 / quintal
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 240,
    description: 'Lens culinaris whole brown/red lentil.',
  },

  // ── 3. OILSEEDS (तिलहन) ────────────────────────────────────────────────────────
  {
    id: 'crop-mustard',
    name: 'Mustard (Rapeseed)',
    hindiName: 'सरसों / राई (Sarson)',
    category: 'oilseeds',
    categoryLabel: 'Oilseeds',
    season: 'Rabi',
    mspFloorKg: 59.50, // ₹5,950 / quintal
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 210,
    description: 'Brassica juncea high oil-content yellow and black seeds.',
  },
  {
    id: 'crop-groundnut',
    name: 'Groundnut',
    hindiName: 'मूंगफली (Peanut in-shell)',
    category: 'oilseeds',
    categoryLabel: 'Oilseeds',
    season: 'Kharif',
    mspFloorKg: 67.83, // ₹6,783 / quintal
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 120,
    description: 'Arachis hypogaea pod and bold peanut kernels.',
  },
  {
    id: 'crop-sunflower',
    name: 'Sunflower',
    hindiName: 'सूरजमुखी (Sunflower Seed)',
    category: 'oilseeds',
    categoryLabel: 'Oilseeds',
    season: 'Kharif',
    mspFloorKg: 72.80, // ₹7,280 / quintal
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 150,
    description: 'Helianthus annuus oil-grade seeds.',
  },
  {
    id: 'crop-sesame',
    name: 'Sesame (Til)',
    hindiName: 'तिल (Sesamum)',
    category: 'oilseeds',
    categoryLabel: 'Oilseeds',
    season: 'Kharif',
    mspFloorKg: 92.67, // ₹9,267 / quintal
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 180,
    description: 'Sesamum indicum clean white/black premium seeds.',
  },

  // ── 4. VEGETABLES (सब्जियां) ───────────────────────────────────────────────────
  {
    id: 'crop-tomato',
    name: 'Tomato',
    hindiName: 'टमाटर (Tamatar)',
    category: 'vegetables',
    categoryLabel: 'Vegetables & Perishables',
    season: 'Zaid',
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 7,
    description: 'Solanum lycopersicum table-ripe and hybrid export varieties.',
  },
  {
    id: 'crop-potato',
    name: 'Potato',
    hindiName: 'आलू (Aloo)',
    category: 'vegetables',
    categoryLabel: 'Vegetables & Perishables',
    season: 'Rabi',
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 45,
    description: 'Solanum tuberosum table and processing (Chipsona, Jyoti) tubers.',
  },
  {
    id: 'crop-onion',
    name: 'Onion',
    hindiName: 'प्याज (Pyaz)',
    category: 'vegetables',
    categoryLabel: 'Vegetables & Perishables',
    season: 'Rabi',
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 60,
    description: 'Allium cepa red Nashik/Rajasthan cured bulb onion.',
  },
  {
    id: 'crop-cauliflower',
    name: 'Cauliflower',
    hindiName: 'फूलगोभी (Phoolgobhi)',
    category: 'vegetables',
    categoryLabel: 'Vegetables & Perishables',
    season: 'Rabi',
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 5,
    description: 'Brassica oleracea compact snow-white curds.',
  },
  {
    id: 'crop-chilli',
    name: 'Green Chilli',
    hindiName: 'हरी मिर्च (Hari Mirch)',
    category: 'vegetables',
    categoryLabel: 'Vegetables & Perishables',
    season: 'Kharif',
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 8,
    description: 'Capsicum annuum fresh pungent Guntur/Teja chillies.',
  },

  // ── 5. FRUITS (फल) ────────────────────────────────────────────────────────────
  {
    id: 'crop-mango',
    name: 'Mango',
    hindiName: 'आम (Kesar / Alphonso / Chausa)',
    category: 'fruits',
    categoryLabel: 'Fruits & Horticulture',
    season: 'Zaid',
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 6,
    description: 'Mangifera indica mature tree-ripened orchard mangoes.',
  },
  {
    id: 'crop-banana',
    name: 'Banana',
    hindiName: 'केला (Grand Naine)',
    category: 'fruits',
    categoryLabel: 'Fruits & Horticulture',
    season: 'Perennial',
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 5,
    description: 'Musa acuminata Cavendish/G9 cold-chain packed hands.',
  },
  {
    id: 'crop-apple',
    name: 'Apple',
    hindiName: 'सेब (Kinnaur / Royal Delicious)',
    category: 'fruits',
    categoryLabel: 'Fruits & Horticulture',
    season: 'Kharif',
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 30,
    description: 'Malus domestica high-altitude Himachal/Kashmir apples.',
  },
  {
    id: 'crop-orange',
    name: 'Orange / Citrus',
    hindiName: 'संतरा / किन्नू (Nagpur Orange)',
    category: 'fruits',
    categoryLabel: 'Fruits & Horticulture',
    season: 'Rabi',
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 14,
    description: 'Citrus reticulata sweet mandarin juicy oranges.',
  },
  {
    id: 'crop-pomegranate',
    name: 'Pomegranate',
    hindiName: 'अनार (Bhagwa)',
    category: 'fruits',
    categoryLabel: 'Fruits & Horticulture',
    season: 'Perennial',
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 20,
    description: 'Punica granatum deep red glossy Bhagwa arils.',
  },

  // ── 6. COMMERCIAL / CASH CROPS (नकदी फसलें) ────────────────────────────────────
  {
    id: 'crop-cotton',
    name: 'Cotton',
    hindiName: 'कपास (Raw Seed Cotton / Kapas)',
    category: 'commercial',
    categoryLabel: 'Commercial & Cash Crops',
    season: 'Kharif',
    mspFloorKg: 66.20, // ₹6,620 / quintal
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 365,
    description: 'Gossypium hirsutum medium/long staple white cotton bales.',
  },
  {
    id: 'crop-sugarcane',
    name: 'Sugarcane',
    hindiName: 'गन्ना (Sugarcane)',
    category: 'commercial',
    categoryLabel: 'Commercial & Cash Crops',
    season: 'Perennial',
    mspFloorKg: 34.00, // Fair and Remunerative Price (FRP ~₹340/q)
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 3,
    description: 'Saccharum officinarum fresh high-brix millable cane.',
  },
];

export function getCropMspFloor(cropName: string): number | null {
  const norm = cropName.trim().toLowerCase();
  const match = ICAR_CROPS.find(
    (c) =>
      c.name.toLowerCase() === norm ||
      c.name.toLowerCase().includes(norm) ||
      norm.includes(c.name.toLowerCase()) ||
      c.hindiName.toLowerCase().includes(norm)
  );
  return match?.mspFloorKg ?? null;
}

export function getCropDefinition(cropName: string): IcarCropDefinition | undefined {
  const norm = cropName.trim().toLowerCase();
  return ICAR_CROPS.find(
    (c) =>
      c.name.toLowerCase() === norm ||
      c.name.toLowerCase().includes(norm) ||
      norm.includes(c.name.toLowerCase())
  );
}
