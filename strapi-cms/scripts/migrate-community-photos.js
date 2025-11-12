#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { STRAPI_URL, getJSON, postJSON, putJSON, uploadFile } = require('./lib/strapiClient');

const ROOT = path.resolve(__dirname, '..', '..');
const DATA_DIR = path.join(ROOT, 'data', 'photos_community');

function normalizeImage(p) {
  if (!p) return null;
  if (p.startsWith('http')) return p;
  const abs = path.resolve(ROOT, p.replace(/^\//, ''));
  return fs.existsSync(abs) ? abs : null;
}

async function upsertPhoto(rec) {
  const title = rec.title;
  const found = await getJSON(`${STRAPI_URL}/api/community-photos?filters[title][$eq]=${encodeURIComponent(title)}`);
  let imageId = null;
  const imgPath = normalizeImage(rec.image);
  if (imgPath) {
    const uploaded = await uploadFile(imgPath);
    if (Array.isArray(uploaded) && uploaded[0]?.id) imageId = uploaded[0].id;
  }
  const payload = { data: { title, description: rec.description || '' } };
  if (imageId) payload.data.image = imageId;
  if (found.data && found.data.length > 0) {
    const id = found.data[0].id;
    await putJSON(`${STRAPI_URL}/api/community-photos/${id}`, payload);
    console.log(`↻ updated photo ${title}`);
  } else {
    await postJSON(`${STRAPI_URL}/api/community-photos`, payload);
    console.log(`✓ created photo ${title}`);
  }
}

async function main() {
  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
  for (const f of files) {
    const json = JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), 'utf8'));
    await upsertPhoto(json);
  }
  console.log('✅ Community photos migrated');
}

main().catch((e) => { console.error(e); process.exit(1); });


