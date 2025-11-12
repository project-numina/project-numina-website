#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const slugify = require('slugify');
const { STRAPI_URL, getJSON, postJSON, putJSON, uploadFile } = require('./lib/strapiClient');

const ROOT = path.resolve(__dirname, '..', '..');
const DATA_DIR = path.join(ROOT, 'data', 'team');

function normalizeImage(p) {
  if (!p) return null;
  if (p.startsWith('http')) return p;
  // sources are in project root
  const abs = path.resolve(ROOT, p.replace(/^\//, ''));
  return fs.existsSync(abs) ? abs : null;
}

async function upsertMember(m) {
  const slug = slugify(m.name, { lower: true, strict: true });
  // find existing
  const found = await getJSON(`${STRAPI_URL}/api/members?filters[slug][$eq]=${encodeURIComponent(slug)}`);
  let imageId = null;
  // Temporairement désactivé pour éviter les erreurs d'upload
  // const imgPath = normalizeImage(m.image);
  // if (imgPath) {
  //   const uploaded = await uploadFile(imgPath);
  //   if (Array.isArray(uploaded) && uploaded[0]?.id) imageId = uploaded[0].id;
  // }

  // resolve tags
  const memberTags = Array.isArray(m.tags) ? m.tags : [];

  const payload = { data: { name: m.name, slug, url: m.url || null, member_tags: memberTags } };
  if (imageId) payload.data.image = imageId;

  // Créer de nouveaux membres au lieu de mettre à jour
  await postJSON(`${STRAPI_URL}/api/members`, payload);
  console.log(`✓ created member ${m.name}`);
}

async function main() {
  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
  for (const f of files) {
    const json = JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), 'utf8'));
    await upsertMember(json);
  }
  console.log('✅ Members migrated');
}

main().catch((e) => { console.error(e); process.exit(1); });


