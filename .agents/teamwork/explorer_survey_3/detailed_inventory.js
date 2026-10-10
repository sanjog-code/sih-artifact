const fs = require('fs');

const files = [
  'apps/web/src/components/Navbar.tsx',
  'apps/web/src/components/Footer.tsx',
  'apps/web/src/components/InquiryModal.tsx',
  'apps/web/src/app/page.tsx',
  'apps/web/src/app/about/page.tsx',
  'apps/web/src/app/farmer/page.tsx',
  'apps/web/src/app/buyer/page.tsx',
  'apps/web/src/app/logistics/page.tsx',
  'apps/web/src/app/consumer/page.tsx'
];

const results = {};
let grandTotal = 0;

for (const file of files) {
  const code = fs.readFileSync(file, 'utf8');
  results[file] = [];
  const lines = code.split('\n');

  lines.forEach((line, idx) => {
    const lNum = idx + 1;
    const l = line.trim();

    // Skip imports, interfaces, comments
    if (l.startsWith('import ') || l.startsWith('export interface') || l.startsWith('//') || l.startsWith('/*') || l.startsWith('*')) {
      return;
    }

    // Check placeholder="..."
    const plh = line.match(/placeholder="([^"]+)"/);
    if (plh && !plh[1].startsWith('{')) {
      results[file].push({ line: lNum, type: 'Placeholder', text: plh[1] });
      grandTotal++;
    }

    // Check title="..."
    const tit = line.match(/title="([^"]+)"/);
    if (tit && !tit[1].startsWith('{')) {
      results[file].push({ line: lNum, type: 'Title attribute', text: tit[1] });
      grandTotal++;
    }

    // Check JSX text nodes between > and <
    // Also handle cases with text before or after curly braces like >Grade {lot.grade}< or >ID: {lot.id}<
    const textMatches = [...line.matchAll(/>([^<>{}$`]+)</g)];
    for (const m of textMatches) {
      const txt = m[1].trim();
      if (txt.length > 1 && !txt.match(/^[\d\s\:\,\.\/\#\-\+\(\)\%\₹\✓\✕\·\@\·]+$/) && !['en', 'hi', 'pa', 'mr', 'te', 'ta'].includes(txt)) {
        results[file].push({ line: lNum, type: 'JSX Text', text: txt });
        grandTotal++;
      }
    }

    // Check JSX text with embedded expressions, like >Grade {lot.grade}< or >ID: {lot.id}<
    const hybridMatch1 = line.match(/>([A-Za-z\s\:\#]+)\s*\{/);
    if (hybridMatch1 && hybridMatch1[1].trim() && hybridMatch1[1].trim().length > 1) {
      const preTxt = hybridMatch1[1].trim();
      if (!['true', 'false', 'null', 'undefined', 'return'].includes(preTxt)) {
        results[file].push({ line: lNum, type: 'Hybrid JSX Prefix', text: preTxt });
        grandTotal++;
      }
    }

    const hybridMatch2 = line.match(/\}\s*([A-Za-z\s\:\#\/\(\)]+)</);
    if (hybridMatch2 && hybridMatch2[1].trim() && hybridMatch2[1].trim().length > 1) {
      const postTxt = hybridMatch2[1].trim();
      if (!['true', 'false', 'null', 'undefined', 'return'].includes(postTxt)) {
        results[file].push({ line: lNum, type: 'Hybrid JSX Suffix', text: postTxt });
        grandTotal++;
      }
    }

    // Check strings in array definitions, e.g. [{ id: 'TWO_WHEELER', name: 'Two-Wheeler (Moped/Cargo)', cap: '50 kg' }]
    const nameLiteral = line.match(/name:\s*['"]([A-Za-z0-9\s\/\-\(\)]+)['"]/);
    if (nameLiteral && nameLiteral[1].length > 3) {
      results[file].push({ line: lNum, type: 'Object Literal Name', text: nameLiteral[1] });
      grandTotal++;
    }
    const capLiteral = line.match(/cap:\s*['"]([A-Za-z0-9\s\/\-\(\)]+)['"]/);
    if (capLiteral && capLiteral[1].length > 1) {
      results[file].push({ line: lNum, type: 'Object Literal Capacity', text: capLiteral[1] });
      grandTotal++;
    }

    // Check hardcoded notification/notice string templates
    if (line.match(/set[A-Za-z]+Notice\(`[^`]+`\)/) || line.match(/setNotice\(`[^`]+`\)/)) {
      results[file].push({ line: lNum, type: 'Toast / Notice Template', text: l });
      grandTotal++;
    }
  });
}

console.log('=== GRAND TOTAL HARDCODED STRINGS:', grandTotal, '===');
for (const [file, items] of Object.entries(results)) {
  console.log(`\n========================================`);
  console.log(`FILE: ${file} (Count: ${items.length})`);
  console.log(`========================================`);
  items.forEach(it => {
    console.log(`  [Line ${it.line}] [${it.type}]: "${it.text}"`);
  });
}
