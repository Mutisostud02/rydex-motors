#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const BASE_URL = process.env.SOURCE_URL || 'https://www.kaiandkaro.com/vehicles?model__make__vehicle_type=Automobile';
const PAGES = Number(process.env.PAGES || 3);
const OUTPUT = process.env.OUTPUT ? path.resolve(process.env.OUTPUT) : path.resolve(__dirname, '..', 'public', 'vehicles.json');
const SNAPSHOT_DIR = path.resolve(__dirname, '..', 'tmp');

function withPageParam(url, pageNum) {
  const u = new URL(url);
  if (pageNum > 1) {
    u.searchParams.set('page', String(pageNum));
  } else {
    u.searchParams.delete('page');
  }
  return u.toString();
}

function parsePrice(text) {
  const t = String(text).replace(/[\,\s]/g, ' ').trim().toUpperCase();
  const num = t.replace(/[^0-9]/g, '');
  if (!num) return null;
  return `KES ${Number(num).toLocaleString('en-KE')}`;
}

function extractBodyType(text) {
  const map = {
    SUV: /\b(SUV|X\s?TRAIL|RAV\s?4|FORESTER|HARRIER|CX[- ]?5|CX[- ]?8)\b/i,
    Sedan: /\b(Sedan|C200|E250|C180|Passat|Impreza|Axio|S60|523i)\b/i,
    Hatchback: /\b(Hatchback|Vitz|Auris|Demio|Fit|Impreza)\b/i,
    Pickup: /\b(Pickup|Hilux|D-Max)\b/i,
    Convertible: /\b(Convertible|Cabrio|Roadster)\b/i,
    Van: /\b(Van|Noah|Voxy|Hiace)\b/i,
  };
  for (const [type, re] of Object.entries(map)) {
    if (re.test(text)) return type;
  }
  return '';
}

function numericPrice(text) {
  const digits = String(text).replace(/[^0-9]/g, '');
  return digits ? Number(digits) : NaN;
}

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  const allItems = [];
  const seen = new Set();

  for (let i = 1; i <= PAGES; i++) {
    const URL = withPageParam(BASE_URL, i);
    await page.goto(URL, { waitUntil: 'networkidle2', timeout: 120000 });

    try {
      if (process.env.SNAPSHOT === '1') {
        if (!fs.existsSync(SNAPSHOT_DIR)) fs.mkdirSync(SNAPSHOT_DIR, { recursive: true });
        const html = await page.content();
        fs.writeFileSync(path.join(SNAPSHOT_DIR, `vehicles-page-${i}.html`), html);
      }
    } catch {}

    const items = await page.evaluate(() => {
      const UI_BAD_WORDS = /(search vehicle|filter by budget|advanced search|brand & model|available in kenya|direct import|both|click here|explore bikes|show results of)/i;
      const BRAND_RE = /(Toyota|Mazda|Subaru|Honda|Lexus|Mercedes|BMW|Nissan|Audi|Volkswagen|Volvo|Land Rover|Chevrolet|Yamaha|Suzuki|Kawasaki|Ducati|KTM|Bajaj|TVS|Royal Enfield|Husqvarna|Kibo|Jincheng|Skygo|KPR)/i;

      function pickTitle(el) {
        const tEl = el.querySelector('h1, h2, h3, .title, .vehicle-title');
        if (tEl?.textContent) return tEl.textContent.trim();
        const lines = (el.textContent || '')
          .split('\n')
          .map(s => s.trim())
          .filter(Boolean)
          .filter(s => !UI_BAD_WORDS.test(s));
        const line = lines.find(s => BRAND_RE.test(s)) || lines[0] || '';
        return line.length > 140 ? line.slice(0, 140).trim() : line;
      }

      function pickDesc(el) {
        const lines = (el.textContent || '')
          .split('\n')
          .map(s => s.trim())
          .filter(Boolean)
          .filter(s => !UI_BAD_WORDS.test(s))
          .filter(s => !/^(K(E)?S?\s*[0-9,]+)/i.test(s));
        const desc = lines.find(s => s.length > 40) || lines[1] || lines[0] || '';
        return desc.length > 400 ? desc.slice(0, 400).trim() : desc;
      }

      function pickImage(el) {
        const imgEl = el.querySelector('img');
        if (!imgEl) return '';
        const attrs = [imgEl.getAttribute('src'), imgEl.getAttribute('data-src'), imgEl.getAttribute('data-original')].filter(Boolean);
        let srcset = imgEl.getAttribute('srcset');
        if (srcset) {
          const first = srcset.split(',')[0].trim().split(' ')[0];
          if (first) attrs.unshift(first);
        }
        const url = attrs.find(Boolean) || '';
        if (url.startsWith('/')) return location.origin + url;
        return url;
      }

      function extractExtra(text) {
        const t = text.replace(/\s+/g, ' ');
        const engineMatch = t.match(/(\d{2,4})\s*CC/i);
        const transmissionMatch = t.match(/\b(Automatic|Manual)\b/i);
        const conditionMatch = t.match(/\b(Brand New|Kenyan Used|Foreign Used)\b/i);
        const sellerMatch = t.match(/\b(Private Seller|In-house Stock)\b/i);
        return {
          engineCc: engineMatch ? Number(engineMatch[1]) : null,
          transmission: transmissionMatch ? transmissionMatch[1] : '',
          condition: conditionMatch ? conditionMatch[1] : '',
          sellerType: sellerMatch ? sellerMatch[1] : '',
        };
      }

      const results = [];
      const candidates = Array.from(document.querySelectorAll('a, article, div')).filter(el => {
        const txt = el.textContent?.toLowerCase() || '';
        return (txt.includes('available') || txt.includes('foreign used') || txt.includes('kenyan used') || txt.includes('brand new')) && (txt.includes('kes') || txt.includes('ksh')) && BRAND_RE.test(txt);
      }).slice(0, 800);

      for (const el of candidates) {
        const text = el.textContent || '';
        const title = pickTitle(el);
        if (!title || UI_BAD_WORDS.test(title)) continue;
        const priceText = (text.match(/K(E)?S?[\s]*[0-9,]+/i) || [null])[0] || '';
        if (!priceText) continue;
        const img = pickImage(el);
        const brandMatch = title.match(BRAND_RE);
        const brand = brandMatch ? brandMatch[1].replace(/\b\w/g, c => c.toUpperCase()) : '';
        const yearMatch = title.match(/\b(19|20)\d{2}\b/);
        const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const description = pickDesc(el);
        const extra = extractExtra(text);
        results.push({ id, title: title.replace(/\s+/g, ' ').trim(), price: priceText.trim(), tag: text.toLowerCase().includes('direct import') ? 'Direct Import' : 'Available in Kenya', image: img, brand: brand || '', bodyTypeText: text, year: yearMatch ? Number(yearMatch[0]) : null, description, ...extra });
      }
      return results;
    });

    for (const v of items) {
      if (seen.has(v.id)) continue; seen.add(v.id);
      const bodyType = extractBodyType(`${v.title} ${v.bodyTypeText}`);
      const priceNum = numericPrice(v.price);
      if (/^show results of/i.test(v.title)) continue;
      if (!Number.isNaN(priceNum) && priceNum < 100000) continue;
      const normalized = { id: v.id, title: v.title, price: parsePrice(v.price) || v.price, tag: v.tag, image: v.image, brand: v.brand, bodyType, year: v.year, description: v.description || '', engineCc: v.engineCc || null, transmission: v.transmission || '', condition: v.condition || '', sellerType: v.sellerType || '' };
      allItems.push(normalized);
    }
  }

  const prior = [];
  if (process.env.APPEND) {
    try {
      if (fs.existsSync(OUTPUT)) {
        const prev = JSON.parse(fs.readFileSync(OUTPUT, 'utf8'));
        if (Array.isArray(prev)) prior.push(...prev);
      }
    } catch (e) {
      console.warn('APPEND read failed:', e?.message || e);
    }
  }

  let finalItems = allItems;
  if (prior.length) {
    const map = new Map();
    for (const v of prior) map.set(v.id, v);
    for (const v of allItems) map.set(v.id, v);
    finalItems = Array.from(map.values());
  }

  fs.writeFileSync(OUTPUT, JSON.stringify(finalItems, null, 2));
  console.log(`Saved ${finalItems.length} vehicles across ${PAGES} page(s) to ${OUTPUT}${prior.length ? ' (appended)' : ''}`);

  await browser.close();
})().catch(err => { console.error(err); process.exit(1); });
