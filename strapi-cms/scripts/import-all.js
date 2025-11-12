#!/usr/bin/env node
/*
  Standalone migration runner:
  - Boots Strapi programmatically
  - Seeds tags
  - Migrates members, projects, articles, community photos from repo data
  - Publishes entries accordingly
*/
const path = require('path');
const fs = require('fs');
const slugify = require('slugify');
const { migrateMembers: migrateMembersWithImages, migrateProjects: migrateProjectsWithImages, migrateArticles: migrateArticlesWithImages, migrateCommunityPhotos: migrateCommunityPhotosWithImages } = require('./migrate-with-images');

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

function repoRootFromCwd() {
  // scripts/ lives in strapi-cms/scripts → go up two levels to repo root
  return path.resolve(__dirname, '..', '..');
}

// Tags are now handled as enum fields, no need to seed them
async function seedTags(strapi) {
  strapi.log.info('Tags are now enum fields, no seeding needed.');
}

async function migrateMembers(strapi, root) {
  await migrateMembersWithImages(strapi);
}

async function migrateProjects(strapi, root) {
  await migrateProjectsWithImages(strapi);
}

async function migrateArticles(strapi, root) {
  await migrateArticlesWithImages(strapi);
}

async function migrateCommunityPhotos(strapi, root) {
  await migrateCommunityPhotosWithImages(strapi);
}

// Export pour utilisation dans src/index.ts
module.exports = {
  seedTags,
  migrateMembers,
  migrateProjects,
  migrateArticles,
  migrateCommunityPhotos
};


