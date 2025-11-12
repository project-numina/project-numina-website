#!/usr/bin/env node
const { STRAPI_URL, STRAPI_TOKEN, getJSON, putJSON, uploadFile } = require('./lib/strapiClient');
const path = require('path');
const fs = require('fs');

function normalizeImage(imgPath) {
  if (!imgPath || imgPath.startsWith('http')) return null;
  // Convertir les chemins relatifs en chemins absolus
  const root = process.env.PROJECT_ROOT || path.resolve(__dirname, '..', '..');
  return path.resolve(root, imgPath.replace(/^\//, ''));
}

async function migrateMemberImages() {
  console.log('🖼️  Migration des images des membres...');
  
  try {
    const membersRes = await getJSON(`${STRAPI_URL}/api/members?populate=image`);
    const members = membersRes.data || [];
    
    for (const member of members) {
      const memberData = member.attributes || member;
      if (!memberData.image && memberData.image_path) {
        const imgPath = normalizeImage(memberData.image_path);
        if (imgPath && fs.existsSync(imgPath)) {
          console.log(`📤 Upload de l'image pour ${memberData.name}: ${imgPath}`);
          const uploaded = await uploadFile(imgPath);
          if (Array.isArray(uploaded) && uploaded[0]?.id) {
            await putJSON(`${STRAPI_URL}/api/members/${member.id}`, {
              data: { image: uploaded[0].id }
            });
            console.log(`✅ Image uploadée pour ${memberData.name}`);
          }
        }
      }
    }
  } catch (error) {
    console.error('❌ Erreur lors de la migration des images des membres:', error);
  }
}

async function migrateProjectImages() {
  console.log('🖼️  Migration des images des projets...');
  
  try {
    const projectsRes = await getJSON(`${STRAPI_URL}/api/projects?populate=image`);
    const projects = projectsRes.data || [];
    
    for (const project of projects) {
      const projectData = project.attributes || project;
      if (!projectData.image && projectData.image_path) {
        const imgPath = normalizeImage(projectData.image_path);
        if (imgPath && fs.existsSync(imgPath)) {
          console.log(`📤 Upload de l'image pour ${projectData.title}: ${imgPath}`);
          const uploaded = await uploadFile(imgPath);
          if (Array.isArray(uploaded) && uploaded[0]?.id) {
            await putJSON(`${STRAPI_URL}/api/projects/${project.id}`, {
              data: { image: uploaded[0].id }
            });
            console.log(`✅ Image uploadée pour ${projectData.title}`);
          }
        }
      }
    }
  } catch (error) {
    console.error('❌ Erreur lors de la migration des images des projets:', error);
  }
}

async function migrateArticleImages() {
  console.log('🖼️  Migration des images des articles...');
  
  try {
    const articlesRes = await getJSON(`${STRAPI_URL}/api/articles?populate=image`);
    const articles = articlesRes.data || [];
    
    for (const article of articles) {
      const articleData = article.attributes || article;
      if (!articleData.image && articleData.image_path) {
        const imgPath = normalizeImage(articleData.image_path);
        if (imgPath && fs.existsSync(imgPath)) {
          console.log(`📤 Upload de l'image pour ${articleData.title}: ${imgPath}`);
          const uploaded = await uploadFile(imgPath);
          if (Array.isArray(uploaded) && uploaded[0]?.id) {
            await putJSON(`${STRAPI_URL}/api/articles/${article.id}`, {
              data: { image: uploaded[0].id }
            });
            console.log(`✅ Image uploadée pour ${articleData.title}`);
          }
        }
      }
    }
  } catch (error) {
    console.error('❌ Erreur lors de la migration des images des articles:', error);
  }
}

async function main() {
  console.log('🚀 Début de la migration des images...');
  
  await migrateMemberImages();
  await migrateProjectImages();
  await migrateArticleImages();
  
  console.log('✅ Migration des images terminée !');
}

main().catch(console.error);
