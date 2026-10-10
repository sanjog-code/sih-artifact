import fs from 'fs';

function updateThemeClasses(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // Root background
  content = content.replace(
    /className="min-h-screen bg-\[#fafafa\] text-zinc-900/g,
    'className="min-h-screen bg-[#fafafa] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100'
  );

  // Common card patterns
  content = content.replace(
    /bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs/g,
    'bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs'
  );
  content = content.replace(
    /bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs/g,
    'bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-xs'
  );
  content = content.replace(
    /bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs/g,
    'bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs'
  );
  content = content.replace(
    /bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs/g,
    'bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs'
  );
  content = content.replace(
    /bg-white rounded-xl border border-zinc-200 p-5 shadow-2xs/g,
    'bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-2xs'
  );
  content = content.replace(
    /bg-white rounded-xl border border-zinc-200 p-4 shadow-2xs/g,
    'bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-2xs'
  );
  content = content.replace(
    /bg-white p-4 rounded-xl border border-zinc-200/g,
    'bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800'
  );
  content = content.replace(
    /bg-white rounded-xl border border-zinc-200 p-12 text-center/g,
    'bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-12 text-center'
  );
  content = content.replace(
    /bg-white p-6 rounded-xl border border-zinc-200/g,
    'bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800'
  );
  content = content.replace(
    /bg-white rounded-2xl border border-zinc-200 p-4/g,
    'bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4'
  );
  content = content.replace(
    /border border-zinc-200 bg-white/g,
    'border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900'
  );

  // Remaining bg-white in buttons or panels
  content = content.replace(
    /bg-white text-zinc-900 shadow-xs font-bold/g,
    'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs font-bold'
  );
  content = content.replace(
    /bg-white text-zinc-950 shadow-xs/g,
    'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-100 shadow-xs'
  );

  // Badges & subpanel backgrounds
  content = content.replace(
    /bg-zinc-50 border border-zinc-200/g,
    'bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800'
  );
  content = content.replace(
    /bg-zinc-50\/70/g,
    'bg-zinc-50/70 dark:bg-zinc-900/50'
  );
  content = content.replace(
    /bg-zinc-50\/80/g,
    'bg-zinc-50/80 dark:bg-zinc-900/50'
  );
  content = content.replace(
    /bg-zinc-100 text-zinc-700/g,
    'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
  );
  content = content.replace(
    /bg-zinc-100 text-zinc-800/g,
    'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200'
  );
  content = content.replace(
    /bg-zinc-200 text-zinc-700/g,
    'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200'
  );
  content = content.replace(
    /bg-zinc-200\/80/g,
    'bg-zinc-200/80 dark:bg-zinc-800'
  );

  // Border lines
  content = content.replace(
    /border-b border-zinc-100/g,
    'border-b border-zinc-100 dark:border-zinc-800'
  );
  content = content.replace(
    /border-t border-zinc-100/g,
    'border-t border-zinc-100 dark:border-zinc-800'
  );
  content = content.replace(
    /divide-zinc-100/g,
    'divide-zinc-100 dark:divide-zinc-800'
  );

  // Text color adjustments for light/dark
  content = content.replace(
    /text-zinc-950(?!\s*dark:text)/g,
    'text-zinc-950 dark:text-zinc-50'
  );
  content = content.replace(
    /text-zinc-900(?!\s*dark:text)/g,
    'text-zinc-900 dark:text-zinc-100'
  );
  content = content.replace(
    /text-zinc-800(?!\s*dark:text)/g,
    'text-zinc-800 dark:text-zinc-200'
  );
  content = content.replace(
    /text-zinc-700(?!\s*dark:text)/g,
    'text-zinc-700 dark:text-zinc-300'
  );
  content = content.replace(
    /text-zinc-600(?!\s*dark:text)/g,
    'text-zinc-600 dark:text-zinc-400'
  );

  fs.writeFileSync(filePath, content, 'utf8');
}

const targets = [
  'apps/web/src/app/logistics/page.tsx',
  'apps/web/src/app/consumer/page.tsx',
  'apps/web/src/app/buyer/page.tsx',
  'apps/web/src/app/farmer/page.tsx',
];

targets.forEach((f) => {
  updateThemeClasses(f);
  console.log(`Updated dark mode in ${f}`);
});
