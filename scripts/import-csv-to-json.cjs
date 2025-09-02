#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

const INPUT = process.env.INPUT; // CSV path
const OUTPUT = process.env.OUTPUT; // JSON path

if (!INPUT || !OUTPUT) {
  console.error('Usage: INPUT=path/to/file.csv OUTPUT=path/to/file.json node scripts/import-csv-to-json.cjs');
  process.exit(1);
}

const csv = fs.readFileSync(path.resolve(INPUT), 'utf8');
const parsed = Papa.parse(csv, { header: true, dynamicTyping: true, skipEmptyLines: true });
if (parsed.errors?.length) {
  console.error('CSV parse errors:', parsed.errors);
  process.exit(1);
}

const rows = parsed.data;
const required = ['id', 'title', 'price', 'brand', 'image'];
for (const [i, r] of rows.entries()) {
  for (const f of required) {
    if (!r[f]) {
      console.error(`Row ${i + 1} missing required field: ${f}`);
      process.exit(1);
    }
  }
}

let existing = [];
if (fs.existsSync(OUTPUT)) {
  try {
    const prev = JSON.parse(fs.readFileSync(OUTPUT, 'utf8'));
    if (Array.isArray(prev)) existing = prev;
  } catch {}
}

const map = new Map(existing.map(v => [v.id, v]));
for (const r of rows) {
  const item = {
    id: String(r.id),
    title: String(r.title),
    price: String(r.price),
    tag: r.tag ? String(r.tag) : 'Available in Kenya',
    image: String(r.image),
    brand: String(r.brand),
    bodyType: r.bodyType ? String(r.bodyType) : '',
    year: r.year ? Number(r.year) : null,
  };
  map.set(item.id, item);
}

const out = Array.from(map.values());
fs.writeFileSync(OUTPUT, JSON.stringify(out, null, 2));
console.log(`Merged ${rows.length} row(s). Total: ${out.length}. Written to ${OUTPUT}`);

