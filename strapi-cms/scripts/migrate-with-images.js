#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const slugify = require('slugify');

// Fonction d'upload corrigée
async function uploadLocalFile(strapi, absPath) {
  try {
    if (!fs.existsSync(absPath)) {
      strapi.log.warn(`File not found: ${absPath}`);
      return null;
    }
    
    const stat = fs.statSync(absPath);
    const stream = fs.createReadStream(absPath);
    const fileName = path.basename(absPath);
    
    // Déterminer le type MIME basé sur l'extension
    const ext = path.extname(fileName).toLowerCase();
    let mimeType = 'application/octet-stream';
    if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
    else if (ext === '.png') mimeType = 'image/png';
    else if (ext === '.gif') mimeType = 'image/gif';
    else if (ext === '.webp') mimeType = 'image/webp';
    
    const uploadService = strapi.plugin('upload').service('upload');
    const res = await uploadService.upload({
      data: {},
      files: {
        path: absPath,
        name: fileName,
        type: mimeType,
        size: stat.size,
        stream,
      },
    });
    
    const file = Array.isArray(res) ? res[0] : res;
    strapi.log.info(`Uploaded: ${fileName} -> ID: ${file?.id}`);
    return file?.id || null;
  } catch (e) {
    strapi.log.warn(`Upload failed for ${absPath}: ${e?.message || e}`);
    return null;
  }
}

function normalizeImage(imgPath) {
  if (!imgPath || imgPath.startsWith('http')) return null;
  const root = process.env.PROJECT_ROOT || path.resolve(__dirname, '..', '..');
  return path.resolve(root, imgPath.replace(/^\//, ''));
}

async function migrateMembers(strapi) {
  const entity = strapi.entityService;
  const root = process.env.PROJECT_ROOT || path.resolve(__dirname, '..', '..');
  const dir = path.join(root, 'data', 'team');
  
  if (!fs.existsSync(dir)) {
    strapi.log.warn(`Directory not found: ${dir}`);
    return;
  }
  
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  strapi.log.info(`Found ${files.length} member files`);
  
  for (const f of files) {
    const rec = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const slug = slugify(rec.name, { lower: true, strict: true });
    
    let imageId = null;
    if (rec.image && !String(rec.image).startsWith('http')) {
      const abs = normalizeImage(rec.image);
      if (abs) {
        strapi.log.info(`Uploading image for ${rec.name}: ${abs}`);
        imageId = await uploadLocalFile(strapi, abs);
      }
    }
    
    const memberTags = Array.isArray(rec.tags) ? rec.tags : [];
    const data = { 
      name: rec.name, 
      slug, 
      url: rec.url || null, 
      member_tags: memberTags, 
      publishedAt: new Date().toISOString() 
    };
    
    if (imageId) data.image = imageId;
    
    await entity.create('api::member.member', { data });
    strapi.log.info(`✓ Created member: ${rec.name}`);
  }
  
  strapi.log.info('Members migration completed.');
}

async function migrateProjects(strapi) {
  const entity = strapi.entityService;
  const root = process.env.PROJECT_ROOT || path.resolve(__dirname, '..', '..');
  const dir = path.join(root, 'data', 'projects');
  
  if (!fs.existsSync(dir)) {
    strapi.log.warn(`Directory not found: ${dir}`);
    return;
  }
  
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  strapi.log.info(`Found ${files.length} project files`);
  
  for (const f of files) {
    const rec = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const slug = slugify(rec.title, { lower: true, strict: true });
    
    let imageId = null;
    if (rec.image && !String(rec.image).startsWith('http')) {
      const abs = normalizeImage(rec.image);
      if (abs) {
        strapi.log.info(`Uploading image for ${rec.title}: ${abs}`);
        imageId = await uploadLocalFile(strapi, abs);
      }
    }
    
    const projectTags = Array.isArray(rec.tags) ? rec.tags : [];
    const data = {
      title: rec.title,
      slug,
      description: rec.description || '',
      highlight: !!rec.highlight,
      ctas: Array.isArray(rec.ctas) ? rec.ctas.map(c => ({ text: c.text, url: c.url, type: c.type || 'primary' })) : [],
      project_tags: projectTags,
    };
    
    // Utiliser le draft/publish natif de Strapi via publishedAt si nécessaire
    if ((rec.published || '').toLowerCase() === 'published') data.publishedAt = new Date().toISOString();
    
    if (imageId) data.image = imageId;
    
    await entity.create('api::project.project', { data });
    strapi.log.info(`✓ Created project: ${rec.title}`);
  }
  
  strapi.log.info('Projects migration completed.');
}

async function migrateArticles(strapi) {
  const entity = strapi.entityService;
  const root = process.env.PROJECT_ROOT || path.resolve(__dirname, '..', '..');
  const dir = path.join(root, 'posts');
  
  if (!fs.existsSync(dir)) {
    strapi.log.warn(`Directory not found: ${dir}`);
    return;
  }
  
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
  strapi.log.info(`Found ${files.length} article files`);
  
  for (const f of files) {
    const raw = fs.readFileSync(path.join(dir, f), 'utf8');
    const matter = require('gray-matter');
    const parsed = matter(raw);
    const fm = parsed.data || {};
    const base = path.basename(f, path.extname(f));
    
    if (!fm.title) {
      strapi.log.warn(`Skipping article without title: ${f}`);
      continue;
    }
    
    const slug = slugify(fm.title, { lower: true, strict: true });
    
    let imageId = null;
    const fmImage = fm.image;
    if (fmImage && !String(fmImage).startsWith('http')) {
      const fixed = fmImage.replace(/^\/assets\//i, 'Assets/');
      const abs = normalizeImage(fixed);
      if (abs) {
        strapi.log.info(`Uploading image for ${fm.title}: ${abs}`);
        imageId = await uploadLocalFile(strapi, abs);
      }
    }
    
    const ctas = Array.isArray(fm.ctas) ? fm.ctas.map(c => ({ text: c.text, url: c.url, type: c.type || 'primary' })) : [];
    const data = {
      title: fm.title,
      slug,
      date: fm.date || new Date().toISOString(),
      body: parsed.content || '',
      ctas,
      // Utiliser draft/publish natif: si frontmatter indique publié, on le publie, sinon laissé en draft (publishedAt null)
      publishedAt: (fm.status || '').toLowerCase() === 'publié' ? new Date().toISOString() : null
    };
    
    if (imageId) data.image = imageId;
    
    await entity.create('api::article.article', { data });
    strapi.log.info(`✓ Created article: ${fm.title}`);
  }
  
  strapi.log.info('Articles migration completed.');
}

async function migrateCommunityPhotos(strapi) {
  const entity = strapi.entityService;
  const root = process.env.PROJECT_ROOT || path.resolve(__dirname, '..', '..');
  const dir = path.join(root, 'data', 'photos_community');
  
  if (!fs.existsSync(dir)) {
    strapi.log.warn(`Directory not found: ${dir}`);
    return;
  }
  
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  strapi.log.info(`Found ${files.length} community photo files`);
  
  for (const f of files) {
    const rec = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const slug = slugify(rec.title, { lower: true, strict: true });
    
    let imageId = null;
    if (rec.image && !String(rec.image).startsWith('http')) {
      const abs = normalizeImage(rec.image);
      if (abs) {
        strapi.log.info(`Uploading image for ${rec.title}: ${abs}`);
        imageId = await uploadLocalFile(strapi, abs);
      }
    }
    
    const data = {
      title: rec.title,
      slug,
      description: rec.description || '',
      publishedAt: new Date().toISOString()
    };
    
    if (imageId) data.image = imageId;
    
    await entity.create('api::community-photo.community-photo', { data });
    strapi.log.info(`✓ Created community photo: ${rec.title}`);
  }
  
  strapi.log.info('Community photos migration completed.');
}

// Export pour utilisation dans import-all.js
module.exports = {
  migrateMembers,
  migrateProjects,
  migrateArticles,
  migrateCommunityPhotos
};
