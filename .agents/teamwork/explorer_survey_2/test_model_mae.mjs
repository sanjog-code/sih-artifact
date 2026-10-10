import fs from 'fs';
import readline from 'readline';

const csvPath = 'C:\\Users\\amans\\.gemini\\antigravity\\scratch\\FarmLink-AI\\ai\\Agriculture_price_dataset.csv';

console.log('Reading Agriculture_price_dataset.csv...');
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
  if (isHeader) {
    isHeader = false;
    continue;
  }
  // Fast CSV parse
  let inQuotes = false;
  let cur = '';
  const cols = [];
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') inQuotes = !inQuotes;
    else if (c === ',' && !inQuotes) {
      cols.push(cur);
      cur = '';
    } else cur += c;
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
    commodity,
    state,
    district,
    market,
    minP,
    maxP,
    modalP,
    time: parseDate(dateStr),
  });
}

console.log(`Loaded ${records.length} valid records. Sorting by key and date...`);
records.sort((a, b) => {
  if (a.key !== b.key) return a.key.localeCompare(b.key);
  return a.time - b.time;
});

console.log('Constructing lag features and future targets...');
const dataset = [];
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
  // We need at least 31 records in history and a future record in the same group
  if (len >= 31 && i + 1 < records.length && records[i + 1].key === r.key) {
    const prevP = groupHistory[len - 2].modalP;
    const p7 = groupHistory[len - 8].modalP;
    const p30 = groupHistory[len - 31].modalP;
    const futureP = records[i + 1].modalP;

    dataset.push({
      commodity: r.commodity,
      state: r.state,
      district: r.district,
      market: r.market,
      minP: r.minP,
      maxP: r.maxP,
      modalP: r.modalP,
      prevP,
      p7,
      p30,
      target: futureP,
    });
  }
}

console.log(`Constructed ${dataset.length} training/testing samples with complete 30-day history.`);

const splitIdx = Math.floor(dataset.length * 0.8);
const trainSet = dataset.slice(0, splitIdx);
const testSet = dataset.slice(splitIdx);

console.log(`Train set: ${trainSet.length}, Test set: ${testSet.length}`);

// Baseline 1: Naive Persistence (future = current modal)
let persistenceAE = 0;
// Baseline 2: 7-day price persistence (future = p7)
let p7AE = 0;

for (const sample of testSet) {
  persistenceAE += Math.abs(sample.target - sample.modalP);
  p7AE += Math.abs(sample.target - sample.p7);
}

const persistenceMAE = persistenceAE / testSet.length;
const p7MAE = p7AE / testSet.length;

console.log(`Persistence (t+1 = t) Test MAE: ${persistenceMAE.toFixed(2)} Rs/quintal (${(persistenceMAE / 100).toFixed(2)} Rs/kg)`);
console.log(`7-Day Lag Persistence Test MAE: ${p7MAE.toFixed(2)} Rs/quintal (${(p7MAE / 100).toFixed(2)} Rs/kg)`);

// Fit Linear Regression on [1, modalP, minP, maxP, prevP, p7, p30]
// Solve X^T X beta = X^T y
const d = 7;
const XtX = Array.from({ length: d }, () => new Float64Array(d));
const Xty = new Float64Array(d);

for (const s of trainSet) {
  const x = [1, s.modalP, s.minP, s.maxP, s.prevP, s.p7, s.p30];
  const y = s.target;
  for (let r = 0; r < d; r++) {
    Xty[r] += x[r] * y;
    for (let c = 0; c < d; c++) {
      XtX[r][c] += x[r] * x[c];
    }
  }
}

// Add L2 ridge regularization: 1e-4
for (let i = 1; i < d; i++) XtX[i][i] += 1e-4 * trainSet.length;

// Gaussian elimination to solve beta
const A = XtX.map((row, r) => [...row, Xty[r]]);
for (let i = 0; i < d; i++) {
  let maxRow = i;
  for (let k = i + 1; k < d; k++) {
    if (Math.abs(A[k][i]) > Math.abs(A[maxRow][i])) maxRow = k;
  }
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
console.log('Fitted Ridge Regression Coefficients:', beta);

// Evaluate Ridge on Test Set
let ridgeAE = 0;
const perCommodityAE = {};
const perCommodityCount = {};

for (const s of testSet) {
  const pred = beta[0] + beta[1]*s.modalP + beta[2]*s.minP + beta[3]*s.maxP + beta[4]*s.prevP + beta[5]*s.p7 + beta[6]*s.p30;
  const ae = Math.abs(s.target - pred);
  ridgeAE += ae;

  perCommodityAE[s.commodity] = (perCommodityAE[s.commodity] || 0) + ae;
  perCommodityCount[s.commodity] = (perCommodityCount[s.commodity] || 0) + 1;
}

const ridgeMAE = ridgeAE / testSet.length;
console.log(`\n========================================`);
console.log(`RIDGE REGRESSION MODEL VERIFIED RESULTS:`);
console.log(`Overall Test MAE: ${ridgeMAE.toFixed(2)} Rs/quintal (${(ridgeMAE / 100).toFixed(2)} Rs/kg)`);
console.log(`========================================`);

for (const [comm, aeSum] of Object.entries(perCommodityAE)) {
  const count = perCommodityCount[comm];
  const commMae = aeSum / count;
  console.log(`  - ${comm} (n=${count}): Test MAE = ${commMae.toFixed(2)} Rs/quintal (${(commMae / 100).toFixed(2)} Rs/kg)`);
}
