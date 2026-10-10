import fs from 'fs';

function refineDarkClasses(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // Input fields & containers
  content = content.replace(/rounded-2xl border border-zinc-200 p-6 sm:p-8 shadow-xs/g, 'rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-xs');
  content = content.replace(/bg-white rounded-2xl border border-zinc-200 p-6 sm:p-8/g, 'bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8');
  content = content.replace(/bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs/g, 'bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs');
  content = content.replace(/bg-white rounded-xl border border-zinc-200/g, 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl');
  content = content.replace(/rounded bg-white text-zinc-800/g, 'rounded bg-white dark:bg-zinc-800 text-zinc-800');
  content = content.replace(/border border-zinc-200 bg-white rounded-md/g, 'border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-md');
  
  // bg-zinc-50 inputs & buttons
  content = content.replace(/bg-zinc-50(?!\s*(?:dark:bg|dark:hover:bg))/g, 'bg-zinc-50 dark:bg-zinc-900/60');
  content = content.replace(/hover:bg-zinc-50(?!\s*dark:hover:bg)/g, 'hover:bg-zinc-50 dark:hover:bg-zinc-800');
  content = content.replace(/hover:bg-zinc-100(?!\s*dark:hover:bg)/g, 'hover:bg-zinc-100 dark:hover:bg-zinc-800');
  content = content.replace(/bg-zinc-100(?!\s*dark:bg)/g, 'bg-zinc-100 dark:bg-zinc-800');

  // bg-white remaining
  content = content.replace(/bg-white(?!\s*dark:bg)/g, 'bg-white dark:bg-zinc-900');

  fs.writeFileSync(filePath, content, 'utf8');
}

const targets = [
  'apps/web/src/app/page.tsx',
  'apps/web/src/app/farmer/page.tsx',
  'apps/web/src/app/buyer/page.tsx',
  'apps/web/src/app/consumer/page.tsx',
  'apps/web/src/app/checkout/page.tsx',
];

targets.forEach((f) => {
  refineDarkClasses(f);
  console.log(`Refined dark mode in ${f}`);
});
