const fs = require('fs');

const files = [
  'apps/web/src/components/Navbar.tsx',
  'apps/web/src/components/Footer.tsx',
  'apps/web/src/components/InquiryModal.tsx',
  'apps/web/src/app/page.tsx',
  'apps/web/src/app/about/page.tsx',
  'apps/web/src/app/farmer/page.tsx',
  'apps/web/src/app/buyer/page.tsx',
  'apps/web/src/app/logistics/page.tsx'
];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  console.log('=== FILE:', file, '===');
  lines.forEach((line, idx) => {
    // Check for hardcoded English strings in JSX
    const matchTag = line.match(/>([^<>{}\$\`]+)</);
    if (matchTag && matchTag[1].trim() && !matchTag[1].trim().match(/^[\d\s\:\,\.\/\#\-\+\(\)\%\₹\✓\✕\·]+$/)) {
      const text = matchTag[1].trim();
      if (text.length > 1 && !['en', 'hi', 'pa', 'mr', 'te', 'ta'].includes(text)) {
        console.log(`  L${idx + 1}: [JSX Text] "${text}"`);
      }
    }
    // Check for placeholders
    const matchPlh = line.match(/placeholder="([^"]+)"/);
    if (matchPlh && matchPlh[1].trim()) {
      console.log(`  L${idx + 1}: [Placeholder] "${matchPlh[1]}"`);
    }
    // Check for title attributes
    const matchTitle = line.match(/title="([^"]+)"/);
    if (matchTitle && matchTitle[1].trim()) {
      console.log(`  L${idx + 1}: [Title] "${matchTitle[1]}"`);
    }
    // Check for options
    const matchOpt = line.match(/<option value="[^"]+">([^<]+)<\/option>/);
    if (matchOpt && matchOpt[1].trim() && !matchOpt[1].includes('{')) {
      console.log(`  L${idx + 1}: [Option] "${matchOpt[1]}"`);
    }
  });
}
