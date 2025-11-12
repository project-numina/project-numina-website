#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const slugify = require('slugify');
const matter = require('gray-matter');
const { STRAPI_URL, getJSON, putJSON } = require('./lib/strapiClient');

const ROOT = path.resolve(__dirname, '..', '..');

function filenameOf(p) {
  if (!p) return null;
  const fixed = String(p).replace(/^\//, '').replace(/^assets\//i, 'Assets/');
  return path.basename(fixed);
}

function baseNameNoExt(name) {
  const n = name.replace(/\.(jpe?g|png|gif|webp)$/i, '');
  // retire suffixe de hash éventuel _abcdef123
  return n.replace(/_[a-f0-9]{5,}$/i, '');
}

async function fetchAllMedia() {
  // Récupère beaucoup de fichiers d'un coup
  const res = await getJSON(`${STRAPI_URL}/api/upload/files?pagination[page]=1&pagination[pageSize]=2000&sort=createdAt:DESC`);
  return Array.isArray(res) ? res : [];
}

function buildMediaIndex(files) {
  const byExactName = new Map(); // name (lower) -> file
  const byBase = new Map();      // base sans extension/hash (lower) -> array of files
  for (const f of files) {
    const name = (f.name || '').toLowerCase();
    if (name) byExactName.set(name, f);
    const base = baseNameNoExt(name);
    if (base) {
      if (!byBase.has(base)) byBase.set(base, []);
      byBase.get(base).push(f);
    }
  }
  return { byExactName, byBase };
}

async function linkMemberImages(mediaIdx) {
  const dir = path.join(ROOT, 'data', 'team');
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  let linked = 0;
  for (const f of files) {
    const rec = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const slug = slugify(rec.name, { lower: true, strict: true });
    const target = await getJSON(`${STRAPI_URL}/api/members?filters[slug][$eq]=${encodeURIComponent(slug)}&fields[0]=id`);
    const id = target?.data?.[0]?.id;
    if (!id) continue;
    const desiredName = filenameOf(rec.image);
    if (!desiredName) continue;
    const file = mediaIdx.byExactName.get(desiredName.toLowerCase())
      || (mediaIdx.byBase.get(baseNameNoExt(desiredName.toLowerCase())) || [])[0];
    if (!file?.id) continue;
    await putJSON(`${STRAPI_URL}/api/members/${id}`, { data: { image: file.id } });
    linked++;
  }
  console.log(`✓ Members: ${linked} images liées`);
}

async function linkProjectImages(mediaIdx) {
  const dir = path.join(ROOT, 'data', 'projects');
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  let linked = 0;
  for (const f of files) {
    const rec = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const slug = slugify(rec.title, { lower: true, strict: true });
    const target = await getJSON(`${STRAPI_URL}/api/projects?filters[slug][$eq]=${encodeURIComponent(slug)}&fields[0]=id`);
    const id = target?.data?.[0]?.id;
    if (!id) continue;
    const desiredName = filenameOf(rec.image);
    if (!desiredName) continue;
    const file = mediaIdx.byExactName.get(desiredName.toLowerCase())
      || (mediaIdx.byBase.get(baseNameNoExt(desiredName.toLowerCase())) || [])[0];
    if (!file?.id) continue;
    await putJSON(`${STRAPI_URL}/api/projects/${id}`, { data: { image: file.id } });
    linked++;
  }
  console.log(`✓ Projects: ${linked} images liées`);
}

async function linkArticleImages(mediaIdx) {
  const dir = path.join(ROOT, 'posts');
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
  let linked = 0;
  for (const f of files) {
    const raw = fs.readFileSync(path.join(dir, f), 'utf8');
    const parsed = matter(raw);
    const fm = parsed.data || {};
    const title = fm.title || path.basename(f, path.extname(f));
    const slug = slugify(title, { lower: true, strict: true });
    const target = await getJSON(`${STRAPI_URL}/api/articles?filters[slug][$eq]=${encodeURIComponent(slug)}&fields[0]=id`);
    const id = target?.data?.[0]?.id;
    if (!id) continue;
    const desiredName = filenameOf(fm.image);
    if (!desiredName) continue;
    const file = mediaIdx.byExactName.get(desiredName.toLowerCase())
      || (mediaIdx.byBase.get(baseNameNoExt(desiredName.toLowerCase())) || [])[0];
    if (!file?.id) continue;
    await putJSON(`${STRAPI_URL}/api/articles/${id}`, { data: { image: file.id } });
    linked++;
  }
  console.log(`✓ Articles: ${linked} images liées`);
}

async function linkCommunityPhotoImages(mediaIdx) {
  const dir = path.join(ROOT, 'data', 'photos_community');
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  let linked = 0;
  for (const f of files) {
    const rec = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const title = rec.title;
    const target = await getJSON(`${STRAPI_URL}/api/community-photos?filters[title][$eq]=${encodeURIComponent(title)}&fields[0]=id`);
    const id = target?.data?.[0]?.id;
    if (!id) continue;
    const desiredName = filenameOf(rec.image);
    if (!desiredName) continue;
    const file = mediaIdx.byExactName.get(desiredName.toLowerCase())
      || (mediaIdx.byBase.get(baseNameNoExt(desiredName.toLowerCase())) || [])[0];
    if (!file?.id) continue;
    await putJSON(`${STRAPI_URL}/api/community-photos/${id}`, { data: { image: file.id } });
    linked++;
  }
  console.log(`✓ Community photos: ${linked} images liées`);
}

async function main() {
  console.log('🔗 Démarrage du lien images ↔ contenus...');
  const media = await fetchAllMedia();
  const mediaIdx = buildMediaIndex(media);
  await linkMemberImages(mediaIdx);
  await linkProjectImages(mediaIdx);
  await linkArticleImages(mediaIdx);
  await linkCommunityPhotoImages(mediaIdx);
  console.log('✅ Liens images terminés.');
}

main().catch((e) => { console.error('❌ Erreur:', e); process.exit(1); });


