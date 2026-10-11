// Comprehensive Agricultural Crop Taxonomy based on Indian Council of Agricultural Research (ICAR)
// Directorate of Economics and Statistics, Ministry of Agriculture & Farmers Welfare, Govt of India,
// and AGMARKNET Mandi Clearing Gazette.

export type IcarCropCategory =
  | 'cereals'
  | 'pulses'
  | 'oilseeds'
  | 'vegetables'
  | 'fruits'
  | 'spices'
  | 'commercial';

export interface IcarCropDefinition {
  id: string;
  name: string;
  hindiName: string;
  category: IcarCropCategory;
  categoryLabel: string;
  season: 'Kharif' | 'Rabi' | 'Zaid' | 'Perennial';
  mspFloorKg?: number; // 2025-26 statutory MSP / CACP floor in ₹/kg (CCEA benchmark)
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
    categoryLabel: 'Grains & Cereals',
    season: 'Rabi',
    mspFloorKg: 24.25, // ₹2,425 / quintal
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 365,
    description: 'Triticum aestivum (Sharbati, HD-2967, PBW-343) grain for flour milling and storage.',
  },
  {
    id: 'crop-paddy',
    name: 'Paddy / Rice',
    hindiName: 'धान / चावल (Dhan)',
    category: 'cereals',
    categoryLabel: 'Grains & Cereals',
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
    categoryLabel: 'Grains & Cereals',
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
    categoryLabel: 'Grains & Cereals',
    season: 'Rabi',
    mspFloorKg: 18.50, // ₹1,850 / quintal
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 300,
    description: 'Hordeum vulgare malting and feed barley.',
  },
  {
    id: 'crop-bajra',
    name: 'Bajra (Pearl Millet)',
    hindiName: 'बाजरा (Pearl Millet)',
    category: 'cereals',
    categoryLabel: 'Grains & Cereals',
    season: 'Kharif',
    mspFloorKg: 26.25, // ₹2,625 / quintal
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 150,
    description: 'Pennisetum glaucum climate-resilient nutri-cereal.',
  },
  {
    id: 'crop-jowar',
    name: 'Jowar (Sorghum)',
    hindiName: 'ज्वार (Sorghum)',
    category: 'cereals',
    categoryLabel: 'Grains & Cereals',
    season: 'Kharif',
    mspFloorKg: 33.71, // ₹3,371 / quintal
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 180,
    description: 'Sorghum bicolor hybrid & maldandi nutri-grain.',
  },
  {
    id: 'crop-ragi',
    name: 'Ragi (Finger Millet)',
    hindiName: 'रागी / मडुआ (Finger Millet)',
    category: 'cereals',
    categoryLabel: 'Grains & Cereals',
    season: 'Kharif',
    mspFloorKg: 42.90, // ₹4,290 / quintal
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 365,
    description: 'Eleusine coracana calcium-rich super-grain finger millet.',
  },
  {
    id: 'crop-kodo-kutki',
    name: 'Kodo & Kutki (Small Millets)',
    hindiName: 'कोदो / कुटकी (Small Millets)',
    category: 'cereals',
    categoryLabel: 'Grains & Cereals',
    season: 'Kharif',
    mspFloorKg: 35.00,
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 300,
    description: 'Paspalum scrobiculatum high-fibre indigenous Shree Anna minor millets.',
  },
  {
    id: 'crop-oats',
    name: 'Oats (Jai)',
    hindiName: 'जई (Avena sativa)',
    category: 'cereals',
    categoryLabel: 'Grains & Cereals',
    season: 'Rabi',
    mspFloorKg: 28.00,
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 240,
    description: 'Avena sativa whole grain oats cultivated in northern agrarian zones.',
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
  {
    id: 'crop-rajma',
    name: 'Rajma (Kidney Beans)',
    hindiName: 'राजमा (Chitra / Red Kidney Bean)',
    category: 'pulses',
    categoryLabel: 'Pulses & Legumes',
    season: 'Kharif',
    mspFloorKg: 82.00,
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 300,
    description: 'Phaseolus vulgaris hill and plains kidney beans.',
  },
  {
    id: 'crop-matar',
    name: 'Dry Field Pea (Matar)',
    hindiName: 'सूखा मटर (Safed Matar)',
    category: 'pulses',
    categoryLabel: 'Pulses & Legumes',
    season: 'Rabi',
    mspFloorKg: 46.00,
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 270,
    description: 'Pisum sativum dried yellow/white pulse peas.',
  },
  {
    id: 'crop-cowpea',
    name: 'Lobia / Cowpea',
    hindiName: 'लोबिया / चौलाई (Black-Eyed Pea)',
    category: 'pulses',
    categoryLabel: 'Pulses & Legumes',
    season: 'Kharif',
    mspFloorKg: 62.00,
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 240,
    description: 'Vigna unguiculata clean white black-eyed bean.',
  },
  {
    id: 'crop-moth',
    name: 'Moth Bean (Matki)',
    hindiName: 'मोठ दाल (Moth Bean)',
    category: 'pulses',
    categoryLabel: 'Pulses & Legumes',
    season: 'Kharif',
    mspFloorKg: 68.00,
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 240,
    description: 'Vigna aconitifolia drought-hardy arid zone legume.',
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
  {
    id: 'crop-safflower',
    name: 'Safflower (Kardi)',
    hindiName: 'कुसुम / करड़ी (Kusum)',
    category: 'oilseeds',
    categoryLabel: 'Oilseeds',
    season: 'Rabi',
    mspFloorKg: 58.00, // ₹5,800 / quintal
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 200,
    description: 'Carthamus tinctorius high linoleic and oleic content oilseed.',
  },
  {
    id: 'crop-niger',
    name: 'Nigerseed (Ramtil)',
    hindiName: 'रामतिल (Nigerseed)',
    category: 'oilseeds',
    categoryLabel: 'Oilseeds',
    season: 'Kharif',
    mspFloorKg: 87.17, // ₹8,717 / quintal
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 180,
    description: 'Guizotia abyssinica premium commercial oilseed.',
  },
  {
    id: 'crop-castor',
    name: 'Castor Seed (Arandi)',
    hindiName: 'अरंडी (Castor Seed)',
    category: 'oilseeds',
    categoryLabel: 'Oilseeds',
    season: 'Kharif',
    mspFloorKg: 58.50,
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 240,
    description: 'Ricinus communis industrial lubricant and oil extraction grade seeds.',
  },
  {
    id: 'crop-linseed',
    name: 'Linseed (Alsi / Flaxseed)',
    hindiName: 'अलसी (Flaxseed)',
    category: 'oilseeds',
    categoryLabel: 'Oilseeds',
    season: 'Rabi',
    mspFloorKg: 64.00,
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 270,
    description: 'Linum usitatissimum omega-3 rich food and industrial linseed.',
  },

  // ── 4. VEGETABLES (सब्जियां) ───────────────────────────────────────────────────
  {
    id: 'crop-tomato',
    name: 'Tomato',
    hindiName: 'टमाटर (Tamatar)',
    category: 'vegetables',
    categoryLabel: 'Fresh Vegetables',
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
    categoryLabel: 'Fresh Vegetables',
    season: 'Rabi',
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 45,
    description: 'Solanum tuberosum table and processing (Chipsona, Jyoti, Pukhraj) tubers.',
  },
  {
    id: 'crop-onion',
    name: 'Onion',
    hindiName: 'प्याज (Pyaz)',
    category: 'vegetables',
    categoryLabel: 'Fresh Vegetables',
    season: 'Rabi',
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 60,
    description: 'Allium cepa red Nashik/Rajasthan cured bulb onion.',
  },
  {
    id: 'crop-garlic',
    name: 'Garlic (Lahsun)',
    hindiName: 'लहसुन (Lahsun)',
    category: 'vegetables',
    categoryLabel: 'Fresh Vegetables',
    season: 'Rabi',
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 90,
    description: 'Allium sativum pungent cured bold white garlic cloves.',
  },
  {
    id: 'crop-ginger',
    name: 'Ginger (Adrak)',
    hindiName: 'अदरक (Fresh Ginger)',
    category: 'vegetables',
    categoryLabel: 'Fresh Vegetables',
    season: 'Kharif',
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 21,
    description: 'Zingiber officinale fresh plump aromatic rhizomes.',
  },
  {
    id: 'crop-cauliflower',
    name: 'Cauliflower',
    hindiName: 'फूलगोभी (Phoolgobhi)',
    category: 'vegetables',
    categoryLabel: 'Fresh Vegetables',
    season: 'Rabi',
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 5,
    description: 'Brassica oleracea compact snow-white curds.',
  },
  {
    id: 'crop-cabbage',
    name: 'Cabbage (Patagobhi)',
    hindiName: 'पत्तागोभी (Bandhgobhi)',
    category: 'vegetables',
    categoryLabel: 'Fresh Vegetables',
    season: 'Rabi',
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 10,
    description: 'Brassica oleracea var. capitata firm round green heads.',
  },
  {
    id: 'crop-brinjal',
    name: 'Brinjal / Eggplant',
    hindiName: 'बैंगन (Baingan)',
    category: 'vegetables',
    categoryLabel: 'Fresh Vegetables',
    season: 'Kharif',
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 6,
    description: 'Solanum melongena purple round and oblong glossy eggplants.',
  },
  {
    id: 'crop-ladyfinger',
    name: 'Okra / Ladyfinger (Bhindi)',
    hindiName: 'भिंडी (Bhindi)',
    category: 'vegetables',
    categoryLabel: 'Fresh Vegetables',
    season: 'Kharif',
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 4,
    description: 'Abelmoschus esculentus tender green spineless pods.',
  },
  {
    id: 'crop-green-chilli',
    name: 'Green Chilli',
    hindiName: 'हरी मिर्च (Hari Mirch)',
    category: 'vegetables',
    categoryLabel: 'Fresh Vegetables',
    season: 'Kharif',
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 8,
    description: 'Capsicum annuum fresh pungent Guntur/Teja chillies.',
  },
  {
    id: 'crop-capsicum',
    name: 'Capsicum / Bell Pepper',
    hindiName: 'शिमला मिर्च (Shimla Mirch)',
    category: 'vegetables',
    categoryLabel: 'Fresh Vegetables',
    season: 'Zaid',
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 8,
    description: 'Capsicum annuum grossum firm thick-walled green and colored bell peppers.',
  },
  {
    id: 'crop-green-peas',
    name: 'Green Peas (Hari Matar)',
    hindiName: 'हरी मटर (Fresh Pods)',
    category: 'vegetables',
    categoryLabel: 'Fresh Vegetables',
    season: 'Rabi',
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 5,
    description: 'Pisum sativum fresh sweet table peas in tender green pods.',
  },
  {
    id: 'crop-carrot',
    name: 'Carrot (Gajar)',
    hindiName: 'गाजर (Desi Red / Kuroda)',
    category: 'vegetables',
    categoryLabel: 'Fresh Vegetables',
    season: 'Rabi',
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 14,
    description: 'Daucus carota fresh red winter and orange Asiatic carrots.',
  },
  {
    id: 'crop-radish',
    name: 'Radish (Mooli)',
    hindiName: 'मूली (White Mooli)',
    category: 'vegetables',
    categoryLabel: 'Fresh Vegetables',
    season: 'Rabi',
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 6,
    description: 'Raphanus sativus crisp straight white taproots.',
  },
  {
    id: 'crop-bitter-gourd',
    name: 'Bitter Gourd (Karela)',
    hindiName: 'करेला (Karela)',
    category: 'vegetables',
    categoryLabel: 'Fresh Vegetables',
    season: 'Zaid',
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 6,
    description: 'Momordica charantia dark green ridged bitter gourds.',
  },
  {
    id: 'crop-bottle-gourd',
    name: 'Bottle Gourd (Lauki)',
    hindiName: 'लौकी / घिया (Ghiya)',
    category: 'vegetables',
    categoryLabel: 'Fresh Vegetables',
    season: 'Zaid',
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 7,
    description: 'Lagenaria siceraria tender cylindrical green gourds.',
  },
  {
    id: 'crop-pumpkin',
    name: 'Pumpkin (Kaddu)',
    hindiName: 'कद्दू / सीताफल (Kaddu)',
    category: 'vegetables',
    categoryLabel: 'Fresh Vegetables',
    season: 'Kharif',
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 60,
    description: 'Cucurbita moschata mature thick-rind storage pumpkins.',
  },
  {
    id: 'crop-cucumber',
    name: 'Cucumber (Kheera)',
    hindiName: 'खीरा / ककड़ी (Kheera)',
    category: 'vegetables',
    categoryLabel: 'Fresh Vegetables',
    season: 'Zaid',
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 5,
    description: 'Cucumis sativus crisp seedless and desi salad cucumbers.',
  },
  {
    id: 'crop-spinach',
    name: 'Spinach (Palak)',
    hindiName: 'पालक (Palak Leaves)',
    category: 'vegetables',
    categoryLabel: 'Fresh Vegetables',
    season: 'Rabi',
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 3,
    description: 'Spinacia oleracea succulent broad dark-green leaves.',
  },
  {
    id: 'crop-coriander',
    name: 'Coriander Leaves (Dhaniya)',
    hindiName: 'धनिया पत्ती (Fresh Dhaniya)',
    category: 'vegetables',
    categoryLabel: 'Fresh Vegetables',
    season: 'Rabi',
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 3,
    description: 'Coriandrum sativum fresh aromatic herb leaves.',
  },

  // ── 5. FRUITS (फल) ────────────────────────────────────────────────────────────
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
    hindiName: 'केला (Grand Naine / Robusta)',
    category: 'fruits',
    categoryLabel: 'Fruits & Horticulture',
    season: 'Perennial',
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 5,
    description: 'Musa acuminata Cavendish/G9 cold-chain packed hands.',
  },
  {
    id: 'crop-orange',
    name: 'Orange / Citrus (Kinnow)',
    hindiName: 'संतरा / किन्नू (Nagpur Mandarin)',
    category: 'fruits',
    categoryLabel: 'Fruits & Horticulture',
    season: 'Rabi',
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 14,
    description: 'Citrus reticulata sweet mandarin juicy oranges.',
  },
  {
    id: 'crop-pomegranate',
    name: 'Pomegranate (Anaar)',
    hindiName: 'अनार (Bhagwa)',
    category: 'fruits',
    categoryLabel: 'Fruits & Horticulture',
    season: 'Perennial',
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 20,
    description: 'Punica granatum deep red glossy Bhagwa arils.',
  },
  {
    id: 'crop-guava',
    name: 'Guava (Amrood)',
    hindiName: 'अमरूद (Allahabad Safeda)',
    category: 'fruits',
    categoryLabel: 'Fruits & Horticulture',
    season: 'Rabi',
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 5,
    description: 'Psidium guajava sweet Allahabad Safeda and Taiwan pink guavas.',
  },
  {
    id: 'crop-grapes',
    name: 'Grapes (Angoor)',
    hindiName: 'अंगूर (Thompson Seedless / Sonaka)',
    category: 'fruits',
    categoryLabel: 'Fruits & Horticulture',
    season: 'Rabi',
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 7,
    description: 'Vitis vinifera sweet export-grade Thompson seedless clusters.',
  },
  {
    id: 'crop-papaya',
    name: 'Papaya (Papita)',
    hindiName: 'पपीता (Red Lady 786)',
    category: 'fruits',
    categoryLabel: 'Fruits & Horticulture',
    season: 'Perennial',
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 6,
    description: 'Carica papaya sweet firm Red Lady hybrid papaya.',
  },
  {
    id: 'crop-watermelon',
    name: 'Watermelon (Tarbooz)',
    hindiName: 'तरबूज (Black Beauty / Sugar Baby)',
    category: 'fruits',
    categoryLabel: 'Fruits & Horticulture',
    season: 'Zaid',
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 12,
    description: 'Citrullus lanatus high-sugar sweet crisp red melons.',
  },
  {
    id: 'crop-muskmelon',
    name: 'Muskmelon (Kharbooja)',
    hindiName: 'खरबूजा (Hara Madhu)',
    category: 'fruits',
    categoryLabel: 'Fruits & Horticulture',
    season: 'Zaid',
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 6,
    description: 'Cucumis melo aromatic juicy netted cantaloupes.',
  },
  {
    id: 'crop-pineapple',
    name: 'Pineapple (Ananas)',
    hindiName: 'अनानास (Kew / Queen)',
    category: 'fruits',
    categoryLabel: 'Fruits & Horticulture',
    season: 'Perennial',
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 10,
    description: 'Ananas comosus northeastern aromatic juicy golden pineapples.',
  },
  {
    id: 'crop-sweet-lime',
    name: 'Sweet Lime (Mosambi)',
    hindiName: 'मौसमी (Mosambi)',
    category: 'fruits',
    categoryLabel: 'Fruits & Horticulture',
    season: 'Kharif',
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 14,
    description: 'Citrus limetta sweet refreshing non-acidic citrus fruit.',
  },

  // ── 6. SPICES & CONDIMENTS (मसाले) ───────────────────────────────────────────
  {
    id: 'crop-turmeric',
    name: 'Turmeric (Haldi)',
    hindiName: 'हल्दी (Lakadong / Nizamabad)',
    category: 'spices',
    categoryLabel: 'Spices & Condiments',
    season: 'Kharif',
    mspFloorKg: 78.00,
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 365,
    description: 'Curcuma longa finger and bulb turmeric rich in curcumin.',
  },
  {
    id: 'crop-red-chilli',
    name: 'Dry Red Chilli (Lal Mirch)',
    hindiName: 'सूखी लाल मिर्च (Guntur / Byadgi)',
    category: 'spices',
    categoryLabel: 'Spices & Condiments',
    season: 'Kharif',
    mspFloorKg: 120.00,
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 300,
    description: 'Capsicum annuum dried sun-cured pungent and color-rich chillies.',
  },
  {
    id: 'crop-cumin',
    name: 'Cumin (Jeera)',
    hindiName: 'जीरा (Jeera)',
    category: 'spices',
    categoryLabel: 'Spices & Condiments',
    season: 'Rabi',
    mspFloorKg: 210.00,
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 365,
    description: 'Cuminum cyminum clean machine-sorted aromatic cumin seeds.',
  },
  {
    id: 'crop-coriander-seed',
    name: 'Coriander Seeds (Dhaniya)',
    hindiName: 'धनिया बीज (Sabut Dhaniya)',
    category: 'spices',
    categoryLabel: 'Spices & Condiments',
    season: 'Rabi',
    mspFloorKg: 74.00,
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 365,
    description: 'Coriandrum sativum whole golden fragrant dried coriander seeds.',
  },
  {
    id: 'crop-fennel',
    name: 'Fennel (Saunf)',
    hindiName: 'सौंफ (Saunf)',
    category: 'spices',
    categoryLabel: 'Spices & Condiments',
    season: 'Rabi',
    mspFloorKg: 95.00,
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 365,
    description: 'Foeniculum vulgare green sweet bold dried fennel seeds.',
  },
  {
    id: 'crop-fenugreek',
    name: 'Fenugreek (Methi Dana)',
    hindiName: 'मेथी दाना (Methi Dana)',
    category: 'spices',
    categoryLabel: 'Spices & Condiments',
    season: 'Rabi',
    mspFloorKg: 52.00,
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 365,
    description: 'Trigonella foenum-graecum clean hard yellow-brown seeds.',
  },
  {
    id: 'crop-black-pepper',
    name: 'Black Pepper (Kali Mirch)',
    hindiName: 'काली मिर्च (Malabar Black Pepper)',
    category: 'spices',
    categoryLabel: 'Spices & Condiments',
    season: 'Perennial',
    mspFloorKg: 380.00,
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 730,
    description: 'Piper nigrum high-piperine dried black berries of the Malabar coast.',
  },
  {
    id: 'crop-cardamom',
    name: 'Cardamom (Elaichi)',
    hindiName: 'छोटी इलायची (Green Cardamom)',
    category: 'spices',
    categoryLabel: 'Spices & Condiments',
    season: 'Perennial',
    mspFloorKg: 950.00,
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 365,
    description: 'Elettaria cardamomum fragrant green pods (8mm+ export grade).',
  },

  // ── 7. COMMERCIAL / CASH CROPS (नकदी फसलें) ────────────────────────────────────
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
  {
    id: 'crop-jute',
    name: 'Jute (Raw Jute)',
    hindiName: 'जूट / पटसन (Raw Jute)',
    category: 'commercial',
    categoryLabel: 'Commercial & Cash Crops',
    season: 'Kharif',
    mspFloorKg: 50.50, // ₹5,050 / quintal
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 365,
    description: 'Corchorus olitorius TD-5 golden fibre for industrial packaging.',
  },
  {
    id: 'crop-tea',
    name: 'Tea (Green / Orthodox Leaves)',
    hindiName: 'चाय पत्ती (Assam / Darjeeling)',
    category: 'commercial',
    categoryLabel: 'Commercial & Cash Crops',
    season: 'Perennial',
    mspFloorKg: 45.00,
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 180,
    description: 'Camellia sinensis two leaves and a bud plantation tea crop.',
  },
  {
    id: 'crop-coffee',
    name: 'Coffee (Arabica / Robusta)',
    hindiName: 'कॉफ़ी बीन्स (Chikmagalur / Coorg)',
    category: 'commercial',
    categoryLabel: 'Commercial & Cash Crops',
    season: 'Perennial',
    mspFloorKg: 140.00,
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 365,
    description: 'Coffea arabica & canephora washed parchment and cherry beans.',
  },
  {
    id: 'crop-rubber',
    name: 'Natural Rubber (Sheet)',
    hindiName: 'प्राकृतिक रबर (RSS-4)',
    category: 'commercial',
    categoryLabel: 'Commercial & Cash Crops',
    season: 'Perennial',
    mspFloorKg: 170.00,
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 365,
    description: 'Hevea brasiliensis ribbed smoked sheet rubber.',
  },
  {
    id: 'crop-tobacco',
    name: 'Tobacco (FCV / Bidi)',
    hindiName: 'तंबाकू (FCV Tobacco)',
    category: 'commercial',
    categoryLabel: 'Commercial & Cash Crops',
    season: 'Rabi',
    mspFloorKg: 95.00,
    standardGrades: ['A1', 'A2', 'B'],
    shelfLifeDaysAmbient: 365,
    description: 'Nicotiana tabacum flue-cured Virginia auction grade leaves.',
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

export const ALL_CROP_CATEGORIES = ['vegetables', 'grains', 'pulses', 'oilseeds', 'fruits', 'spices', 'commercial'] as const;

export function getCropCategory(cropName: string): 'vegetables' | 'grains' | 'pulses' | 'oilseeds' | 'fruits' {
  const norm = cropName.trim().toLowerCase();
  if (
    norm.includes('tomato') ||
    norm.includes('potato') ||
    norm.includes('onion') ||
    norm.includes('garlic') ||
    norm.includes('ginger') ||
    norm.includes('chilli') ||
    norm.includes('cauliflower') ||
    norm.includes('cabbage') ||
    norm.includes('brinjal') ||
    norm.includes('bhindi') ||
    norm.includes('okra') ||
    norm.includes('capsicum') ||
    norm.includes('peas') ||
    norm.includes('carrot') ||
    norm.includes('radish') ||
    norm.includes('gourd') ||
    norm.includes('karela') ||
    norm.includes('lauki') ||
    norm.includes('pumpkin') ||
    norm.includes('cucumber') ||
    norm.includes('spinach') ||
    norm.includes('coriander') ||
    norm.includes('vegetable')
  ) {
    return 'vegetables';
  }
  if (
    norm.includes('wheat') ||
    norm.includes('rice') ||
    norm.includes('paddy') ||
    norm.includes('maize') ||
    norm.includes('barley') ||
    norm.includes('bajra') ||
    norm.includes('jowar') ||
    norm.includes('ragi') ||
    norm.includes('millet') ||
    norm.includes('oats') ||
    norm.includes('grain') ||
    norm.includes('cereal')
  ) {
    return 'grains';
  }
  if (
    norm.includes('chana') ||
    norm.includes('soybean') ||
    norm.includes('moong') ||
    norm.includes('tur') ||
    norm.includes('arhar') ||
    norm.includes('urad') ||
    norm.includes('masoor') ||
    norm.includes('rajma') ||
    norm.includes('matar') ||
    norm.includes('lobia') ||
    norm.includes('moth') ||
    norm.includes('pulse') ||
    norm.includes('gram') ||
    norm.includes('legume')
  ) {
    return 'pulses';
  }
  if (
    norm.includes('mustard') ||
    norm.includes('sarson') ||
    norm.includes('groundnut') ||
    norm.includes('peanut') ||
    norm.includes('sunflower') ||
    norm.includes('sesame') ||
    norm.includes('safflower') ||
    norm.includes('niger') ||
    norm.includes('castor') ||
    norm.includes('linseed') ||
    norm.includes('flaxseed') ||
    norm.includes('oilseed')
  ) {
    return 'oilseeds';
  }
  if (
    norm.includes('apple') ||
    norm.includes('mango') ||
    norm.includes('banana') ||
    norm.includes('orange') ||
    norm.includes('citrus') ||
    norm.includes('pomegranate') ||
    norm.includes('guava') ||
    norm.includes('grapes') ||
    norm.includes('papaya') ||
    norm.includes('watermelon') ||
    norm.includes('muskmelon') ||
    norm.includes('pineapple') ||
    norm.includes('lime') ||
    norm.includes('fruit')
  ) {
    return 'fruits';
  }
  return 'vegetables';
}
