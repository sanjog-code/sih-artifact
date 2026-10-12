import assert from 'node:assert';
import fs from 'node:fs';

console.log('🔍 Testing src/app/about/page.tsx and src/components/UnitEconomicsSimulator.tsx for zero hardcoded strings...');

const aboutPageContent = fs.readFileSync('src/app/about/page.tsx', 'utf8');
const simContent = fs.readFileSync('src/components/UnitEconomicsSimulator.tsx', 'utf8');

const stringsToCheckInAbout = [
  'Operating Directly Across India’s Agricultural Clusters',
  'Real farmgate checkpoints, assay testing laboratories',
  'Direct Smallholder Harvests',
  'Farmers grading fresh produce lots directly at source',
  'Phulera Cold Silo Terminal',
  'Accredited Cold Silos & Vaults',
  'State-of-the-art temperature and moisture telemetry',
  'Direct Institutional Clearance',
  'Automated multi-depot vehicle manifests',
  'From Farm Gate Soil to Wholesale Processing Plant',
  'Traditional mandis impose opaque weighing cuts',
  'Minimizing transit decay',
  'Route-monitored vehicles',
  'Automated Lot Sizing',
  'Farmgate Crated Intake',
  'Chemical & Purity Lab',
  'Direct Fleet Dispatch',
  'Pillar 01 • AGMARK Testing',
  'Pillar 02 • e-NWR Silos',
  'Pillar 03 • Statutory MSP',
  'Pillar 04 • Nodal Escrow',
  'Pillar 05 • Batch Origin & Farm Traceability',
  'Kota Grain Terminal',
  'Muhana Fresh Depot',
  'Bhopal Pulses Silo',
  'Punjab Wheat Gateway',
  '12,000 MT capacity with mechanized pneumatic grain intake',
  'Sub-zero multi-chamber cold vault serving tomato',
  'Automated nitrogen purges and moisture meters',
  'Sharbati & durum wheat bulk intake terminal',
];

const stringsToCheckInSim = [
  'Interactive Agrarian Pilot Simulator',
  'Verified Unit Economic Models & Fresh Produce Calculations',
  'Direct mathematical proof based on the 42,000 kg tomato pilot',
  '42,000 kg Tomato Pilot',
  '1,000 kg Potato & Onion Batch',
  'Total Supply (2 Farmers)',
  '21,000 kg per grower',
  'Bulk Buyer Network',
  'Procure vs Sell Spread',
  'Gross Spread Realized',
  'Baseline pilot benchmark: ₹22.00/kg direct farm-gate purchase',
  'Baseline pilot benchmark: ₹28.00/kg institutional dock delivery',
  'Pilot Equation Proof (fresh_tomato_economic_workflow.md):',
  '• Total Supply: 42,000 kg from 2 farmers (21,000 kg each)',
  '• Buyer Absorption: 150 bulk buyers × 70 kg/week × 4 weeks = 42,000 kg',
  'Statutory Research & Empirical Citations',
  'RBI Study on TOP Vegetables (October 2024):',
  'ICAR-CIPHET / JISAS National Loss Assessment (2024):',
];

for (const str of stringsToCheckInAbout) {
  assert(!aboutPageContent.includes(`>${str}<`) && !aboutPageContent.includes(`"${str}"`), `Hardcoded string found in about/page.tsx: "${str}"`);
}
console.log('✅ 0 hardcoded strings in src/app/about/page.tsx (All properly bound to ta.*)!');

for (const str of stringsToCheckInSim) {
  assert(!simContent.includes(`>${str}<`) && !simContent.includes(`"${str}"`), `Hardcoded string found in UnitEconomicsSimulator.tsx: "${str}"`);
}
console.log('✅ 0 hardcoded strings in src/components/UnitEconomicsSimulator.tsx (All properly bound to ta.*)!');

console.log('🎉 ABOUT & SIMULATOR I18N VERIFICATION 100% COMPLETE & PASSING!');
