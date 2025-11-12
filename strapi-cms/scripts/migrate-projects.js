#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const slugify = require('slugify');
const { STRAPI_URL, getJSON, postJSON, putJSON, uploadFile } = require('./lib/strapiClient');

const ROOT = path.resolve(__dirname, '..', '..');
const DATA_DIR = path.join(ROOT, 'data', 'projects');

function normalizeImage(p) {
  if (!p) return null;
  if (p.startsWith('http')) return p;
  const abs = path.resolve(ROOT, p.replace(/^\//, ''));
  return fs.existsSync(abs) ? abs : null;
}

async function upsertProject(pj) {
  const slug = slugify(pj.title, { lower: true, strict: true });
  const found = await getJSON(`${STRAPI_URL}/api/projects?filters[slug][$eq]=${encodeURIComponent(slug)}`);
  let imageId = null;
  // Temporairement désactivé pour éviter les erreurs d'upload
  // const imgPath = normalizeImage(pj.image);
  // if (imgPath) {
  //   const uploaded = await uploadFile(imgPath);
  //   if (Array.isArray(uploaded) && uploaded[0]?.id) imageId = uploaded[0].id;
  // }
  // resolve tags
  const projectTags = Array.isArray(pj.tags) ? pj.tags : [];
  const payload = { data: {
    title: pj.title,
    slug,
    status: pj.status || null,
    description: pj.description || '',
    highlight: !!pj.highlight,
    ctas: Array.isArray(pj.ctas) ? pj.ctas.map(c => ({ text: c.text, url: c.url, type: c.type || 'primary' })) : [],
    project_tags: projectTags,
  }};
  if (imageId) payload.data.image = imageId;

  // Créer de nouveaux projets au lieu de mettre à jour
  await postJSON(`${STRAPI_URL}/api/projects`, payload);
  console.log(`✓ created project ${pj.title}`);
}

async function main() {
  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
  for (const f of files) {
    const json = JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), 'utf8'));
    await upsertProject(json);
  }
  console.log('✅ Projects migrated');
}

main().catch((e) => { console.error(e); process.exit(1); });


