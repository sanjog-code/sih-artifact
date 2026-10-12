import fs from 'fs';

let content = fs.readFileSync('src/app/about/page.tsx', 'utf8');

// Ensure ta is defined right after const { t } = useLanguage();
if (!content.includes('const ta = t.about;')) {
  content = content.replace(
    'const { t } = useLanguage();',
    'const { t } = useLanguage();\n  const ta = t.about;'
  );
}

// 1. Ground reality section header
content = content.replace(
  `<span className="text-xs uppercase font-mono tracking-wider text-emerald-700 dark:text-emerald-400 font-bold">\n                Ground Reality & Field Infrastructure\n              </span>`,
  `<span className="text-xs uppercase font-mono tracking-wider text-emerald-700 dark:text-emerald-400 font-bold">\n                {ta.groundRealityBadge}\n              </span>`
);

content = content.replace(
  `<h2 className="text-xl sm:text-3xl font-extrabold text-zinc-950 dark:text-zinc-50 mt-1 tracking-tight">\n                Operating Directly Across India’s Agricultural Clusters\n              </h2>`,
  `<h2 className="text-xl sm:text-3xl font-extrabold text-zinc-950 dark:text-zinc-50 mt-1 tracking-tight">\n                {ta.groundRealityTitle}\n              </h2>`
);

content = content.replace(
  `<p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 sm:mt-0 max-w-sm">\n              Real farmgate checkpoints, assay testing laboratories, and cold storage silos operational in Rajasthan, Madhya Pradesh, and Punjab.\n            </p>`,
  `<p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 sm:mt-0 max-w-sm">\n              {ta.groundRealityDesc}\n            </p>`
);

// Card 1
content = content.replace(
  `Kisan Cluster #42`,
  `{ta.kisanClusterBadge}`
);
content = content.replace(
  `Sanganer, Jaipur (Rajasthan)`,
  `{ta.kisanClusterLoc}`
);
content = content.replace(
  `<h3 className="text-sm font-bold text-zinc-950 dark:text-white">\n                    Direct Smallholder Harvests\n                  </h3>`,
  `<h3 className="text-sm font-bold text-zinc-950 dark:text-white">\n                    {ta.kisanClusterTitle}\n                  </h3>`
);
content = content.replace(
  `Farmers grading fresh produce lots directly at source with optical moisture & defect scanning, eliminating middleman cartel deductions.`,
  `{ta.kisanClusterDesc}`
);
content = content.replace(
  `<span>AGMARK A1 Certified</span>\n                  <span>100% Direct Payout</span>`,
  `<span>{ta.agmarkA1Certified}</span>\n                  <span>{ta.directPayout100}</span>`
);

// Card 2
content = content.replace(
  `WDRA Vault FL-RJ-0482`,
  `{ta.wdraVaultBadge}`
);
content = content.replace(
  `Phulera Cold Silo Terminal`,
  `{ta.wdraVaultLoc}`
);
content = content.replace(
  `<h3 className="text-sm font-bold text-zinc-950 dark:text-white">\n                    Accredited Cold Silos & Vaults\n                  </h3>`,
  `<h3 className="text-sm font-bold text-zinc-950 dark:text-white">\n                    {ta.wdraVaultTitle}\n                  </h3>`
);
content = content.replace(
  `State-of-the-art temperature and moisture telemetry protecting storable grain, pulses, and perishables with zero post-harvest spoilage.`,
  `{ta.wdraVaultDesc}`
);
content = content.replace(
  `<span>e-NWR Fungible</span>\n                  <span>4°C Humidity Controlled</span>`,
  `<span>{ta.eNwrFungible}</span>\n                  <span>{ta.humidityControlled4c}</span>`
);

// Card 3
content = content.replace(
  `Bulk Nodal Clearance`,
  `{ta.bulkClearanceBadge}`
);
content = content.replace(
  `Muhana Institutional Terminal`,
  `{ta.bulkClearanceLoc}`
);
content = content.replace(
  `<h3 className="text-sm font-bold text-zinc-950 dark:text-white">\n                    Direct Institutional Clearance\n                  </h3>`,
  `<h3 className="text-sm font-bold text-zinc-950 dark:text-white">\n                    {ta.bulkClearanceTitle}\n                  </h3>`
);
content = content.replace(
  `Automated multi-depot vehicle manifests and delivery to verified bulk processors and consumers with guaranteed T+1 escrow payout.`,
  `{ta.bulkClearanceDesc}`
);
content = content.replace(
  `<span>RBI Escrow Vault</span>\n                  <span>T+1 Bank Settlement</span>`,
  `<span>{ta.rbiEscrowVault}</span>\n                  <span>{ta.t1BankSettlement}</span>`
);

// Section 2: Transparent Market Linkages
content = content.replace(
  `<span>Transparent Market Linkages</span>`,
  `<span>{ta.marketLinkagesBadge}</span>`
);
content = content.replace(
  `<h3 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-zinc-50 tracking-tight leading-snug">\n                  From Farm Gate Soil to Wholesale Processing Plant\n                </h3>`,
  `<h3 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-zinc-50 tracking-tight leading-snug">\n                  {ta.marketLinkagesTitle}\n                </h3>`
);
content = content.replace(
  `Traditional mandis impose opaque weighing cuts, commission agent margins, and days of holding queue decay. Fasal Matrix deploys cold-chain logistics, algorithmic route dispatch, and digital gate assaying to bridge growers directly with food processing enterprises.`,
  `{ta.marketLinkagesDesc}`
);

// Cold chain metric callouts
content = content.replace(
  `<span className="block text-[10px] font-mono uppercase text-zinc-500 font-bold">Cold Chain Dispatch</span>\n                    <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400 block mt-0.5">Direct Farm-to-Buyer</span>\n                    <span className="text-[11px] text-zinc-500 block">Minimizing transit decay</span>`,
  `<span className="block text-[10px] font-mono uppercase text-zinc-500 font-bold">{ta.coldChainDispatchTitle}</span>\n                    <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400 block mt-0.5">{ta.coldChainDispatchSub}</span>\n                    <span className="text-[11px] text-zinc-500 block">{ta.coldChainDispatchDesc}</span>`
);

content = content.replace(
  `<span className="block text-[10px] font-mono uppercase text-zinc-500 font-bold">Transit Logistics</span>\n                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 block mt-0.5">Scheduled Dispatch</span>\n                    <span className="text-[11px] text-zinc-500 block">Route-monitored vehicles</span>`,
  `<span className="block text-[10px] font-mono uppercase text-zinc-500 font-bold">{ta.transitLogisticsTitle}</span>\n                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 block mt-0.5">{ta.transitLogisticsSub}</span>\n                    <span className="text-[11px] text-zinc-500 block">{ta.transitLogisticsDesc}</span>`
);

// Photo mosaic labels
content = content.replace(
  `Automated Lot Sizing`,
  `{ta.photoLotSizing}`
);
content = content.replace(
  `Farmgate Crated Intake`,
  `{ta.photoCratedIntake}`
);
content = content.replace(
  `Chemical & Purity Lab`,
  `{ta.photoPurityLab}`
);
content = content.replace(
  `Direct Fleet Dispatch`,
  `{ta.photoFleetDispatch}`
);

// 5 Pillars Badges
content = content.replace(
  `Pillar 01 • AGMARK Testing`,
  `{ta.pillar1Badge}`
);
content = content.replace(
  `Pillar 02 • e-NWR Silos`,
  `{ta.pillar2Badge}`
);
content = content.replace(
  `Pillar 03 • Statutory MSP`,
  `{ta.pillar3Badge}`
);
content = content.replace(
  `Pillar 04 • Nodal Escrow`,
  `{ta.pillar4Badge}`
);
content = content.replace(
  `Pillar 05 • Batch Origin & Farm Traceability`,
  `{ta.pillar5Badge}`
);

// Field deployments & Hubs
content = content.replace(
  `Field Deployments & Institutional Partners`,
  `{ta.fieldDeploymentsBadge}`
);
content = content.replace(
  `Verified Physical Infrastructure Across Regional Mandis`,
  `{ta.fieldDeploymentsTitle}`
);
content = content.replace(
  `Every depot and cooperative hub on Fasal Matrix operates with active optical assaying hardware, calibrated weighbridges, and e-NWR compliance.`,
  `{ta.fieldDeploymentsDesc}`
);

// Hub 1
content = content.replace(
  `HUB #01 • KOTA`,
  `{ta.hub1Badge}`
);
content = content.replace(
  `<h4 className="text-xs font-bold text-zinc-950 dark:text-white">Kota Grain Terminal</h4>`,
  `<h4 className="text-xs font-bold text-zinc-950 dark:text-white">{ta.hub1Title}</h4>`
);
content = content.replace(
  `12,000 MT capacity with mechanized pneumatic grain intake for soybean and mustard lots.`,
  `{ta.hub1Desc}`
);

// Hub 2
content = content.replace(
  `HUB #02 • JAIPUR`,
  `{ta.hub2Badge}`
);
content = content.replace(
  `<h4 className="text-xs font-bold text-zinc-950 dark:text-white">Muhana Fresh Depot</h4>`,
  `<h4 className="text-xs font-bold text-zinc-950 dark:text-white">{ta.hub2Title}</h4>`
);
content = content.replace(
  `Sub-zero multi-chamber cold vault serving tomato, onion, and potato grower clusters.`,
  `{ta.hub2Desc}`
);

// Hub 3
content = content.replace(
  `HUB #03 • BHOPAL`,
  `{ta.hub3Badge}`
);
content = content.replace(
  `<h4 className="text-xs font-bold text-zinc-950 dark:text-white">Bhopal Pulses Silo</h4>`,
  `<h4 className="text-xs font-bold text-zinc-950 dark:text-white">{ta.hub3Title}</h4>`
);
content = content.replace(
  `Automated nitrogen purges and moisture meters for chana and pigeon pea preservation.`,
  `{ta.hub3Desc}`
);

// Hub 4
content = content.replace(
  `HUB #04 • LUDHIANA`,
  `{ta.hub4Badge}`
);
content = content.replace(
  `<h4 className="text-xs font-bold text-zinc-950 dark:text-white">Punjab Wheat Gateway</h4>`,
  `<h4 className="text-xs font-bold text-zinc-950 dark:text-white">{ta.hub4Title}</h4>`
);
content = content.replace(
  `Sharbati & durum wheat bulk intake terminal with direct rail freight container linkages.`,
  `{ta.hub4Desc}`
);

// Onboarding Section & Form
content = content.replace(
  `<span>Institutional Onboarding</span>`,
  `<span>{ta.onboardingBadge}</span>`
);
content = content.replace(
  `<strong className="text-zinc-900 dark:text-zinc-200 block font-semibold">Agrarian Nodal Hub:</strong>\n                    <span>Muhana Terminal, Sanganer, Jaipur, RJ 302029</span>`,
  `<strong className="text-zinc-900 dark:text-zinc-200 block font-semibold">{ta.agrarianNodalHubLabel}</strong>\n                    <span>{ta.agrarianNodalHubVal}</span>`
);
content = content.replace(
  `<strong className="text-zinc-900 dark:text-zinc-200 block font-semibold">Toll-Free Kisan Desk:</strong>`,
  `<strong className="text-zinc-900 dark:text-zinc-200 block font-semibold">{ta.tollFreeKisanDeskLabel}</strong>`
);
content = content.replace(
  `<span className="text-zinc-500 text-[11px] ml-1.5">(22 Indian Languages Supported)</span>`,
  `<span className="text-zinc-500 text-[11px] ml-1.5">{ta.tollFreeLanguagesSupported}</span>`
);
content = content.replace(
  `<strong className="text-zinc-900 dark:text-zinc-200 block font-semibold">Institutional Escrow Desk:</strong>`,
  `<strong className="text-zinc-900 dark:text-zinc-200 block font-semibold">{ta.institutionalEscrowDeskLabel}</strong>`
);
content = content.replace(
  `<span>Open Quick Modal Inquiry</span>`,
  `<span>{ta.openQuickModalInquiry}</span>`
);

// Form success state
content = content.replace(
  `<h3 className="text-lg font-bold text-zinc-950 dark:text-zinc-50">\n                    Integration Inquiry Dispatched\n                  </h3>`,
  `<h3 className="text-lg font-bold text-zinc-950 dark:text-zinc-50">\n                    {ta.inquiryDispatchedTitle}\n                  </h3>`
);
content = content.replace(
  `<p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-sm mx-auto">\n                    Our agrarian logistics and escrow officer will contact your organization within 2 business hours.\n                  </p>`,
  `<p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-sm mx-auto">\n                    {ta.inquiryDispatchedDesc}\n                  </p>`
);
content = content.replace(
  `Submit Another Inquiry`,
  `{ta.submitAnotherInquiryBtn}`
);

// Form inputs & labels
content = content.replace(
  `Full Name <span className="text-emerald-600">*</span>`,
  `{ta.fullNameLabel} <span className="text-emerald-600">*</span>`
);
content = content.replace(
  `Mobile Phone <span className="text-emerald-600">*</span>`,
  `{ta.mobilePhoneLabel} <span className="text-emerald-600">*</span>`
);
content = content.replace(
  `Work Email`,
  `{ta.workEmailLabel}`
);
content = content.replace(
  `Organization / FPO`,
  `{ta.organizationLabel}`
);
content = content.replace(
  `Organization Type`,
  `{ta.organizationTypeLabel}`
);

content = content.replace(
  `{ id: 'buyer', label: 'Bulk Processor' },\n                        { id: 'fpo', label: 'Farmer / FPO' },\n                        { id: 'warehouse', label: 'Warehouse / Silo' },`,
  `{ id: 'buyer', label: ta.typeBulkProcessor },\n                        { id: 'fpo', label: ta.typeFarmerFpo },\n                        { id: 'warehouse', label: ta.typeWarehouseSilo },`
);

content = content.replace(
  `Inquiry / Commodity Requirements`,
  `{ta.inquiryCommodityLabel}`
);
content = content.replace(
  `placeholder="Specify monthly quintal volume, required AGMARK grade, or regional delivery depot requirements..."`,
  `placeholder={ta.inquiryPlaceholder}`
);

content = content.replace(
  `I consent to Fasal Matrix contacting me regarding commodity procurement in accordance with the{' '}\n                        <Link href="/privacy" className="underline font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800">\n                          Privacy Policy\n                        </Link>.`,
  `{ta.consentPrivacyText}{' '}\n                        <Link href="/privacy" className="underline font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800">\n                          {ta.privacyPolicyLink}\n                        </Link>.`
);

fs.writeFileSync('src/app/about/page.tsx', content, 'utf8');
console.log('Successfully updated src/app/about/page.tsx!');
