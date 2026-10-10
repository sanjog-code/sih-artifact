import fs from 'fs';
import path from 'path';

const files = [
  'apps/web/src/app/page.tsx',
  'apps/web/src/app/about/page.tsx',
  'apps/web/src/app/farmer/page.tsx',
  'apps/web/src/app/buyer/page.tsx',
  'apps/web/src/app/consumer/page.tsx',
  'apps/web/src/app/admin/page.tsx',
  'apps/web/src/app/logistics/page.tsx',
  'apps/web/src/app/login/page.tsx',
  'apps/web/src/components/Footer.tsx',
  'apps/web/src/components/InquiryModal.tsx',
  'apps/web/src/components/AiAssistant.tsx',
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  const content = fs.readFileSync(file, 'utf8');
  // Find instances of classNames that have standalone bg-white or bg-zinc-50 without dark:bg-
  const classMatches = content.match(/className=["'`]([^"'`]+)["'`]/g) || [];
  const missingDarkBg = classMatches.filter((c) => {
    const hasStandaloneBgWhite = /(?:^|\s)bg-white(?:\s|$)/.test(c) && !c.includes('dark:bg-');
    const hasStandaloneBgZinc50 = /(?:^|\s)bg-zinc-50(?:\s|$)/.test(c) && !c.includes('dark:bg-');
    return hasStandaloneBgWhite || hasStandaloneBgZinc50;
  });
  console.log(`${file}: ${missingDarkBg.length} classes missing dark:bg`);
  if (missingDarkBg.length > 0) {
    missingDarkBg.slice(0, 3).forEach((m) => console.log('   ->', m));
  }
}
