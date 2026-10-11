import { execSync } from 'child_process';

try {
  const out = execSync('npx eslint . --format json', { cwd: 'apps/web', encoding: 'utf8' });
  console.log('No lint errors found!');
} catch (e) {
  if (e.stdout) {
    const results = JSON.parse(e.stdout);
    let totalErrors = 0;
    let totalWarnings = 0;
    results.forEach((r) => {
      if (r.messages.length > 0) {
        console.log('\nFILE:', r.filePath.replace(/^.*apps[/\\]web[/\\]/, ''));
        r.messages.forEach((m) => {
          if (m.severity === 2) totalErrors++;
          else totalWarnings++;
          console.log(`  [${m.severity === 2 ? 'ERROR' : 'WARN'}] line ${m.line}:${m.column} (${m.ruleId || 'syntax'}): ${m.message.slice(0, 100)}`);
        });
      }
    });
    console.log(`\nTOTAL: ${totalErrors} errors, ${totalWarnings} warnings`);
  }
}
