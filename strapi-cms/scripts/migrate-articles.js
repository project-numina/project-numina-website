#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const slugify = require('slugify');
const matter = require('gray-matter');
const { STRAPI_URL, getJSON, postJSON, putJSON, uploadFile } = require('./lib/strapiClient');

const ROOT = path.resolve(__dirname, '..', '..');
const POSTS_DIR = path.join(ROOT, 'posts');

function normalizeImage(p) {
  if (!p) return null;
  if (p.startsWith('http')) return p;
  const fixed = p.replace(/^\/assets\//i, 'Assets/');
  const abs = path.resolve(ROOT, fixed.replace(/^\//, ''));
  return fs.existsSync(abs) ? abs : null;
}

async function upsertArticle(file, fm, body) {
  const base = path.basename(file, path.extname(file));
  const slug = slugify(fm.title || base, { lower: true, strict: true });
  const found = await getJSON(`${STRAPI_URL}/api/articles?filters[slug][$eq]=${encodeURIComponent(slug)}`);

  let imageId = null;
  const imgPath = normalizeImage(fm.image);
  if (imgPath) {
    const uploaded = await uploadFile(imgPath);
    if (Array.isArray(uploaded) && uploaded[0]?.id) imageId = uploaded[0].id;
  }

  const payload = { data: {
    title: fm.title || base,
    slug,
    date: fm.date || null,
    body,
    ctas: Array.isArray(fm.ctas) ? fm.ctas.map(c => ({ text: c.text, url: c.url, type: c.type || 'primary' })) : [],
  }};
  if (imageId) payload.data.image = imageId;

  if (found.data && found.data.length > 0) {
    const id = found.data[0].id;
    await putJSON(`${STRAPI_URL}/api/articles/${id}`, payload);
    console.log(`↻ updated article ${payload.data.title}`);
  } else {
    await postJSON(`${STRAPI_URL}/api/articles`, payload);
    console.log(`✓ created article ${payload.data.title}`);
  }
}

async function main() {
  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));
  for (const f of files) {
    const raw = fs.readFileSync(path.join(POSTS_DIR, f), 'utf8');
    const parsed = matter(raw);
    await upsertArticle(f, parsed.data || {}, parsed.content || '');
  }
  console.log('✅ Articles migrated');
}

main().catch((e) => { console.error(e); process.exit(1); });


