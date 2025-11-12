#!/usr/bin/env node
const { STRAPI_URL, getJSON, deleteJSON } = require('./lib/strapiClient');

async function cleanProjects() {
  try {
    console.log('🧹 Suppression de tous les projets existants...');
    
    // Récupérer tous les projets
    const projectsRes = await getJSON(`${STRAPI_URL}/api/projects`);
    const projects = projectsRes.data || [];
    
    console.log(`🗑️  Suppression de ${projects.length} projets...`);
    
    // Supprimer chaque projet
    for (const project of projects) {
      await deleteJSON(`${STRAPI_URL}/api/projects/${project.id}`);
      console.log(`✓ Supprimé: ${project.title}`);
    }
    
    console.log('✅ Tous les projets supprimés !');
  } catch (error) {
    console.error('❌ Erreur lors de la suppression:', error);
  }
}

cleanProjects().catch(console.error);
