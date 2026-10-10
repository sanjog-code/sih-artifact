import fs from 'fs';
import readline from 'readline';

const csvPath = 'C:\\Users\\amans\\.gemini\\antigravity\\scratch\\FarmLink-AI\\ai\\Agriculture_price_dataset.csv';

const rl = readline.createInterface({
  input: fs.createReadStream(csvPath),
  crlfDelay: Infinity,
});

let isHeader = true;
const records = [];

function parseDate(str) {
  const parts = str.trim().split('/');
  return new Date(parseInt(parts[2], 10), parseInt(parts[0], 10) - 1, parseInt(parts[1], 10)).getTime();
}

for await (const line of rl) {
  if (isHeader) { isHeader = false; continue; }
  let inQuotes = false;
  let cur = '';
  const cols = [];
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') inQuotes = !inQuotes;
    else if (c === ',' && !inQuotes) { cols.push(cur); cur = ''; }
    else cur += c;
  }
  cols.push(cur);
  if (cols.length < 10) continue;

  const state = cols[0].trim();
  const district = cols[1].trim();
  const market = cols[2].trim();
  const commodity = cols[3].trim();
  const minP = parseFloat(cols[6]);
  const maxP = parseFloat(cols[7]);
  const modalP = parseFloat(cols[8]);
  const dateStr = cols[9].trim();
  if (isNaN(minP) || isNaN(maxP) || isNaN(modalP) || !dateStr) continue;

  records.push({
    key: `${commodity}|${state}|${district}|${market}`,
    commodity, state, district, market, minP, maxP, modalP,
    time: parseDate(dateStr),
  });
}

records.sort((a, b) => {
  if (a.key !== b.key) return a.key.localeCompare(b.key);
  return a.time - b.time;
});

const commodityData = {};

let curKey = '';
let groupHistory = [];
for (let i = 0; i < records.length; i++) {
  const r = records[i];
  if (r.key !== curKey) {
    curKey = r.key;
    groupHistory = [];
  }
  groupHistory.push(r);
  const len = groupHistory.length;
  if (len >= 31 && i + 1 < records.length && records[i + 1].key === r.key) {
    if (!commodityData[r.commodity]) commodityData[r.commodity] = [];
    commodityData[r.commodity].push({
      minP: r.minP,
      maxP: r.maxP,
      modalP: r.modalP,
      prevP: groupHistory[len - 2].modalP,
      p7: groupHistory[len - 8].modalP,
      p30: groupHistory[len - 31].modalP,
      target: records[i + 1].modalP,
    });
  }
}

console.log('COMMODITY-SPECIFIC RIDGE MODELS:');
for (const [comm, samples] of Object.entries(commodityData)) {
  const split = Math.floor(samples.length * 0.8);
  const train = samples.slice(0, split);
  const test = samples.slice(split);

  const d = 7;
  const XtX = Array.from({ length: d }, () => new Float64Array(d));
  const Xty = new Float64Array(d);

  for (const s of train) {
    const x = [1, s.modalP, s.minP, s.maxP, s.prevP, s.p7, s.p30];
    const y = s.target;
    for (let r = 0; r < d; r++) {
      Xty[r] += x[r] * y;
      for (let c = 0; c < d; c++) XtX[r][c] += x[r] * x[c];
    }
  }
  for (let i = 1; i < d; i++) XtX[i][i] += 1e-4 * train.length;

  const A = XtX.map((row, r) => [...row, Xty[r]]);
  for (let i = 0; i < d; i++) {
    let maxRow = i;
    for (let k = i + 1; k < d; k++) if (Math.abs(A[k][i]) > Math.abs(A[maxRow][i])) maxRow = k;
    const tmp = A[i]; A[i] = A[maxRow]; A[maxRow] = tmp;
    const pivot = A[i][i];
    for (let k = i; k <= d; k++) A[i][k] /= pivot;
    for (let r = 0; r < d; r++) {
      if (r !== i) {
        const factor = A[r][i];
        for (let k = i; k <= d; k++) A[r][k] -= factor * A[i][k];
      }
    }
  }
  const beta = A.map(row => row[d]);

  let ae = 0;
  let pAe = 0;
  for (const s of test) {
    const pred = beta[0] + beta[1]*s.modalP + beta[2]*s.minP + beta[3]*s.maxP + beta[4]*s.prevP + beta[5]*s.p7 + beta[6]*s.p30;
    ae += Math.abs(s.target - pred);
    pAe += Math.abs(s.target - s.modalP);
  }
  const mae = ae / test.length;
  const pMae = pAe / test.length;
  console.log(`Commodity: ${comm.padEnd(8)} (Train: ${train.length}, Test: ${test.length}) => Test MAE: ${mae.toFixed(2)} Rs/q (${(mae/100).toFixed(2)} Rs/kg) | Persistence MAE: ${pMae.toFixed(2)} Rs/q | Beta[modal]=${beta[1].toFixed(3)} Beta[prev]=${beta[4].toFixed(3)} Beta[p7]=${beta[5].toFixed(3)}`);
}
