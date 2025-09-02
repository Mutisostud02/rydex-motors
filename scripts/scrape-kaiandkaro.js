#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const URL = process.env.SOURCE_URL || 'https://www.kaiandkaro.com/vehicles?model__make__vehicle_type=Automobile';
const OUTPUT = path.resolve(__dirname, '..', 'public', 'vehicles.json');
const SNAPSHOT_DIR = path.resolve(__dirname, '..', 'tmp');

function parsePrice(text) {
  // Normalize various KES/KSH representations
  const t = text.replace(/[,\s]/g, ' ').trim().toUpperCase();
  const num = t.replace(/[^0-9]/g, '');
  if (!num) return null;
  // Keep KES prefixed string for site
  return `KES ${Number(num).toLocaleString('en-KE')}`;
}

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.goto(URL, { waitUntil: 'networkidle2', timeout: 120000 });

  // Save snapshot for debugging selectors
  try {
    if (!fs.existsSync(SNAPSHOT_DIR)) fs.mkdirSync(SNAPSHOT_DIR, { recursive: true });
    const html = await page.content();
    fs.writeFileSync(path.join(SNAPSHOT_DIR, 'vehicles-page.html'), html);
  } catch {}

  // Attempt to select vehicle cards
  const items = await page.evaluate(() => {
    const results = [];
    // Heuristic: find cards that contain price and title; adjust selectors as needed
    const cards = Array.from(document.querySelectorAll('a, article, div')).filter(el => {
      const txt = el.textContent?.toLowerCase() || '';
      return txt.includes('available') && (txt.includes('kes') || txt.includes('ksh')) && (txt.includes('toyota') || txt.includes('mazda') || txt.includes('subaru') || txt.includes('honda') || txt.includes('lexus') || txt.includes('mercedes') || txt.includes('bmw') || txt.includes('nissan'));
    }).slice(0, 200);

    const seen = new Set();
    for (const el of cards) {
      const titleEl = el.querySelector('h3, h2, .title, .vehicle-title');
      const priceEl = el.querySelector('*:matches(:contains("KES"), :contains("KSH"))');
      // Fallback: regex scan
      const text = el.textContent || '';
      let priceMatch = text.match(/K(E)?S?[\s]*[0-9,]+/i);
      const title = titleEl?.textContent?.trim() || text.split('\n').map(s => s.trim()).find(s => /(toyota|mazda|subaru|honda|lexus|mercedes|bmw|nissan)/i.test(s)) || '';
      const priceText = priceEl?.textContent || priceMatch?.[0] || '';
      if (!title || !priceText) continue;

      // Try find image
      let img = el.querySelector('img')?.src || '';
      if (img && img.startsWith('/')) img = location.origin + img;

      // Parse brand/body type roughly from title
      const brandMatch = title.match(/(Toyota|Mazda|Subaru|Honda|Lexus|Mercedes|BMW|Nissan|Audi|Volkswagen|Volvo|Land Rover|Chevrolet)/i);
      const brand = brandMatch ? brandMatch[1].replace(/\b\w/g, c => c.toUpperCase()) : '';

      const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      if (seen.has(id)) continue; seen.add(id);

      results.push({
        id,
        title: title.replace(/\s+/g, ' ').trim(),
        price: priceText.trim(),
        tag: text.toLowerCase().includes('direct import') ? 'Direct Import' : 'Available in Kenya',
        image: img,
        brand: brand || '',
        bodyType: '',
        year: (title.match(/\b(19|20)\d{2}\b/) || [])[0] ? Number((title.match(/\b(19|20)\d{2}\b/) || [])[0]) : null,
      });
    }

    return results;
  });

  // Normalize prices
  const normalized = items.map(v => ({
    ...v,
    price: parsePrice(v.price) || v.price
  }));

  // Write to vehicles.json
  fs.writeFileSync(OUTPUT, JSON.stringify(normalized, null, 2));
  console.log(`Saved ${normalized.length} vehicles to ${OUTPUT}`);

  await browser.close();
})().catch(err => {
  console.error(err);
  process.exit(1);
});

