import fs from 'fs';
import readline from 'readline';

const csvPath = 'C:\\Users\\amans\\.gemini\\antigravity\\scratch\\FarmLink-AI\\ai\\Agriculture_price_dataset.csv';

const rl = readline.createInterface({
  input: fs.createReadStream(csvPath),
  crlfDelay: Infinity,
});

let isHeader = true;
const stats = {};

for await (const line of rl) {
  if (isHeader) {
    isHeader = false;
    continue;
  }
  const parts = line.split(',');
  const commodity = parts[3];
  const modal = parseFloat(parts[8]);
  if (!commodity || isNaN(modal)) continue;

  if (!stats[commodity]) {
    stats[commodity] = { count: 0, min: Infinity, max: -Infinity, sum: 0, prices: [] };
  }
  const s = stats[commodity];
  s.count++;
  if (modal < s.min) s.min = modal;
  if (modal > s.max) s.max = modal;
  s.sum += modal;
  if (s.prices.length < 50000) {
    s.prices.push(modal); // sample for median
  }
}

const summary = {};
for (const [k, v] of Object.entries(stats)) {
  v.prices.sort((a, b) => a - b);
  const median = v.prices[Math.floor(v.prices.length / 2)];
  summary[k] = {
    count: v.count,
    minQuintal: v.min,
    maxQuintal: v.max,
    meanQuintal: (v.sum / v.count).toFixed(2),
    medianQuintal: median,
    meanPerKg: (v.sum / v.count / 100).toFixed(2),
    medianPerKg: (median / 100).toFixed(2),
  };
}

console.log(JSON.stringify(summary, null, 2));
