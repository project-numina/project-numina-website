const fs = require('fs');
const path = require('path');

// Configuration
const STRAPI_URL = 'http://localhost:1337';
const PROJECT_ROOT = path.resolve(__dirname, '..', '..');

async function getJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.json();
}

async function deleteJSON(url) {
  const res = await fetch(url, { method: 'DELETE' });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.json();
}

async function cleanAllData() {
  try {
    console.log('🧹 Cleaning all data...');
    
    // 1. Supprimer tous les membres
    const membersRes = await getJSON(`${STRAPI_URL}/api/members`);
    const members = membersRes.data || [];
    console.log(`🗑️  Deleting ${members.length} members...`);
    for (const member of members) {
      await deleteJSON(`${STRAPI_URL}/api/members/${member.id}`);
    }
    
    // 2. Supprimer tous les projets
    const projectsRes = await getJSON(`${STRAPI_URL}/api/projects`);
    const projects = projectsRes.data || [];
    console.log(`🗑️  Deleting ${projects.length} projects...`);
    for (const project of projects) {
      await deleteJSON(`${STRAPI_URL}/api/projects/${project.id}`);
    }
    
    // 3. Supprimer tous les articles
    const articlesRes = await getJSON(`${STRAPI_URL}/api/articles`);
    const articles = articlesRes.data || [];
    console.log(`🗑️  Deleting ${articles.length} articles...`);
    for (const article of articles) {
      await deleteJSON(`${STRAPI_URL}/api/articles/${article.id}`);
    }
    
    // 4. Supprimer toutes les photos community
    const photosRes = await getJSON(`${STRAPI_URL}/api/community-photos`);
    const photos = photosRes.data || [];
    console.log(`🗑️  Deleting ${photos.length} community photos...`);
    for (const photo of photos) {
      await deleteJSON(`${STRAPI_URL}/api/community-photos/${photo.id}`);
    }
    
    // 5. Supprimer tous les tags
    const memberTagsRes = await getJSON(`${STRAPI_URL}/api/member-tags`);
    const memberTags = memberTagsRes.data || [];
    console.log(`🗑️  Deleting ${memberTags.length} member tags...`);
    for (const tag of memberTags) {
      await deleteJSON(`${STRAPI_URL}/api/member-tags/${tag.id}`);
    }
    
    const projectTagsRes = await getJSON(`${STRAPI_URL}/api/project-tags`);
    const projectTags = projectTagsRes.data || [];
    console.log(`🗑️  Deleting ${projectTags.length} project tags...`);
    for (const tag of projectTags) {
      await deleteJSON(`${STRAPI_URL}/api/project-tags/${tag.id}`);
    }
    
    console.log('✅ All data cleaned!');
  } catch (error) {
    console.error('❌ Error cleaning data:', error);
  }
}

async function main() {
  await cleanAllData();
  console.log('🎉 Cleanup completed! Now restart Strapi with MIGRATE_FORCE=1 to recreate data.');
}

main().catch(console.error);
