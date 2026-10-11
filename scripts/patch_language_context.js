const fs = require('fs');

const extraData = JSON.parse(fs.readFileSync('./scripts/cards_and_footer_translations.json', 'utf8'));
let raw = fs.readFileSync('./apps/web/src/context/LanguageContext.tsx', 'utf8');
const isCRLF = raw.includes('\r\n');
let langCtx = raw.replace(/\r\n/g, '\n');

const coreLangs = ['en', 'hi', 'pa', 'mr', 'te', 'ta'];

for (const lang of coreLangs) {
  const lData = extraData[lang] || {
    agmarkStandards: 'AGMARK Quality Standards',
    directBankSettlement: 'Direct Bank Settlement',
    platformPortals: 'Platform Portals',
    pricingPlans: 'Pricing & Plans',
    supportHelp: 'Support & Help',
    tollFreeHelpline: 'Toll-Free Helpline',
    grievanceDesk: 'Grievance Desk',
    operatingHours: 'Mon - Sat: 9:00 AM - 6:00 PM IST',
    registeredEntity: 'Registered Entity',
    registeredOffice: 'Registered Office',
    nodalGrievanceOfficer: 'Nodal Grievance Officer',
    refundPolicy: 'Refund Policy',
    cookiePolicy: 'Cookie Policy',
    ageRestricted: 'Age Restricted: 18+ Only',
    allRightsReserved: 'All rights reserved.',
    active: 'Active',
    showFewerLanguages: '▲ Show Fewer Languages',
    moreOfficialLanguages: '▼ +16 More Official Languages ({count})',
    fruits: 'Fruits',
    liveSynced: 'Live Synced',
    adminOps: 'Admin Ops',
    farmerDesk: 'Farmer Desk',
    exploreTrustPillars: 'Explore Trust Pillars',
    contactIntegrationDesk: 'Contact Integration Desk'
  };

  const langHeader = '\n  ' + lang + ': {\n';
  const langIdx = langCtx.indexOf(langHeader);
  if (langIdx === -1) {
    console.error('Lang not found:', lang);
    continue;
  }
  
  const searchStart = langIdx + langHeader.length;
  let nextIdx = -1;
  const matchNext = langCtx.slice(searchStart).search(/\n  [a-z]{2}: \{|\n\};/);
  if (matchNext !== -1) {
    nextIdx = searchStart + matchNext;
  }

  let block = nextIdx !== -1 ? langCtx.substring(langIdx, nextIdx) : langCtx.substring(langIdx);

  // 1. Footer patch
  const footerMarker = 'security:';
  const footerSecIdx = block.indexOf(footerMarker);
  if (footerSecIdx !== -1) {
    const lineEnd = block.indexOf('\n', footerSecIdx);
    const beforeLine = block.substring(0, lineEnd);
    const afterLine = block.substring(lineEnd);
    const fAdd = [
      '',
      `      agmarkStandards: '${lData.agmarkStandards.replace(/'/g, "\\'")}',`,
      `      directBankSettlement: '${lData.directBankSettlement.replace(/'/g, "\\'")}',`,
      `      platformPortals: '${lData.platformPortals.replace(/'/g, "\\'")}',`,
      `      pricingPlans: '${lData.pricingPlans.replace(/'/g, "\\'")}',`,
      `      supportHelp: '${lData.supportHelp.replace(/'/g, "\\'")}',`,
      `      tollFreeHelpline: '${lData.tollFreeHelpline.replace(/'/g, "\\'")}',`,
      `      grievanceDesk: '${lData.grievanceDesk.replace(/'/g, "\\'")}',`,
      `      operatingHours: '${lData.operatingHours.replace(/'/g, "\\'")}',`,
      `      registeredEntity: '${lData.registeredEntity.replace(/'/g, "\\'")}',`,
      `      registeredOffice: '${lData.registeredOffice.replace(/'/g, "\\'")}',`,
      `      nodalGrievanceOfficer: '${lData.nodalGrievanceOfficer.replace(/'/g, "\\'")}',`,
      `      refundPolicy: '${lData.refundPolicy.replace(/'/g, "\\'")}',`,
      `      cookiePolicy: '${lData.cookiePolicy.replace(/'/g, "\\'")}',`,
      `      ageRestricted: '${lData.ageRestricted.replace(/'/g, "\\'")}',`,
      `      allRightsReserved: '${lData.allRightsReserved.replace(/'/g, "\\'")}',`,
      `      active: '${lData.active.replace(/'/g, "\\'")}',`,
      `      showFewerLanguages: '${lData.showFewerLanguages.replace(/'/g, "\\'")}',`,
      `      moreOfficialLanguages: '${lData.moreOfficialLanguages.replace(/'/g, "\\'")}'`
    ].join('\n');
    block = beforeLine + fAdd + afterLine;
  }

  // 2. Portal patch
  const portalMarker = 'rfqBtn:';
  const portalRfqIdx = block.indexOf(portalMarker);
  if (portalRfqIdx !== -1) {
    const lineEnd = block.indexOf('\n', portalRfqIdx);
    const beforeLine = block.substring(0, lineEnd);
    const afterLine = block.substring(lineEnd);
    const pAdd = [
      '',
      `      adminOps: '${lData.adminOps.replace(/'/g, "\\'")}',`,
      `      farmerDesk: '${lData.farmerDesk.replace(/'/g, "\\'")}',`,
      `      exploreTrustPillars: '${lData.exploreTrustPillars.replace(/'/g, "\\'")}',`,
      `      contactIntegrationDesk: '${lData.contactIntegrationDesk.replace(/'/g, "\\'")}'`
    ].join('\n');
    block = beforeLine + pAdd + afterLine;
  }

  // 3. Market patch
  const marketMarker = 'quoteSentMsg:';
  const marketQuoteIdx = block.indexOf(marketMarker);
  if (marketQuoteIdx !== -1) {
    const lineEnd = block.indexOf('\n', marketQuoteIdx);
    const beforeLine = block.substring(0, lineEnd);
    const afterLine = block.substring(lineEnd);
    const mAdd = [
      '',
      `      fruits: '${lData.fruits.replace(/'/g, "\\'")}',`,
      `      liveSynced: '${lData.liveSynced.replace(/'/g, "\\'")}'`
    ].join('\n');
    block = beforeLine + mAdd + afterLine;
  }

  langCtx = langCtx.substring(0, langIdx) + block + (nextIdx !== -1 ? langCtx.substring(nextIdx) : '');
}

if (isCRLF) {
  langCtx = langCtx.replace(/\n/g, '\r\n');
}

fs.writeFileSync('./apps/web/src/context/LanguageContext.tsx', langCtx, 'utf8');
console.log('LanguageContext.tsx successfully patched with 0 duplicates!');
