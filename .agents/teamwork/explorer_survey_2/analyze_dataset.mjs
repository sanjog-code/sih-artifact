import fs from 'fs';
import readline from 'readline';

const csvPath = 'C:\\Users\\amans\\.gemini\\antigravity\\scratch\\FarmLink-AI\\ai\\Agriculture_price_dataset.csv';

const fileStream = fs.createReadStream(csvPath);
const rl = readline.createInterface({
  input: fileStream,
  crlfDelay: Infinity,
});

let lineCount = 0;
let header = null;
const missingCounts = {};
const commodityCounts = {};
const stateCounts = {};
const districtSet = new Set();
const marketSet = new Set();
let minModal = Infinity;
let maxModal = -Infinity;
let sumModal = 0;
let validModalCount = 0;
let minDate = null;
let maxDate = null;

function parseDate(str) {
  if (!str) return null;
  const parts = str.trim().split('/');
  if (parts.length === 3) {
    const m = parseInt(parts[0], 10);
    const d = parseInt(parts[1], 10);
    const y = parseInt(parts[2], 10);
    return new Date(y, m - 1, d);
  }
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

for await (const line of rl) {
  if (!line.trim()) continue;
  lineCount++;
  if (lineCount === 1) {
    header = line.split(',').map(s => s.trim());
    for (const h of header) {
      missingCounts[h] = 0;
    }
    continue;
  }

  // Parse CSV line (simple split, or accounting for quotes if needed)
  const cols = [];
  let inQuotes = false;
  let cur = '';
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === ',' && !inQuotes) {
      cols.push(cur);
      cur = '';
    } else {
      cur += c;
    }
  }
  cols.push(cur);

  if (cols.length !== header.length) {
    // Column mismatch
    continue;
  }

  const row = {};
  for (let i = 0; i < header.length; i++) {
    const val = cols[i]?.trim();
    row[header[i]] = val;
    if (!val || val === '' || val === 'NA' || val === 'null') {
      missingCounts[header[i]]++;
    }
  }

  const commodity = row['Commodity'];
  if (commodity) {
    commodityCounts[commodity] = (commodityCounts[commodity] || 0) + 1;
  }

  const state = row['STATE'];
  if (state) {
    stateCounts[state] = (stateCounts[state] || 0) + 1;
  }

  if (row['District Name']) districtSet.add(row['District Name']);
  if (row['Market Name']) marketSet.add(row['Market Name']);

  const modal = parseFloat(row['Modal_Price']);
  if (!isNaN(modal)) {
    if (modal < minModal) minModal = modal;
    if (modal > maxModal) maxModal = modal;
    sumModal += modal;
    validModalCount++;
  }

  const dateObj = parseDate(row['Price Date']);
  if (dateObj) {
    if (!minDate || dateObj < minDate) minDate = dateObj;
    if (!maxDate || dateObj > maxDate) maxDate = dateObj;
  }
}

const sortedCommodities = Object.entries(commodityCounts).sort((a, b) => b[1] - a[1]);
const sortedStates = Object.entries(stateCounts).sort((a, b) => b[1] - a[1]);

const result = {
  totalRows: lineCount - 1,
  header,
  missingCounts,
  uniqueCommoditiesCount: sortedCommodities.length,
  topCommodities: sortedCommodities.slice(0, 15),
  uniqueStatesCount: sortedStates.length,
  topStates: sortedStates.slice(0, 15),
  uniqueDistrictsCount: districtSet.size,
  uniqueMarketsCount: marketSet.size,
  minModalPrice: minModal,
  maxModalPrice: maxModal,
  avgModalPrice: validModalCount > 0 ? (sumModal / validModalCount).toFixed(2) : 0,
  minDate: minDate ? minDate.toISOString().split('T')[0] : null,
  maxDate: maxDate ? maxDate.toISOString().split('T')[0] : null,
};

console.log(JSON.stringify(result, null, 2));
