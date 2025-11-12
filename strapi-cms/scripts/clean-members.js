#!/usr/bin/env node
const { STRAPI_URL, getJSON, deleteJSON } = require('./lib/strapiClient');

async function cleanMembers() {
  try {
    console.log('🧹 Suppression de tous les membres existants...');
    
    // Récupérer tous les membres
    const membersRes = await getJSON(`${STRAPI_URL}/api/members`);
    const members = membersRes.data || [];
    
    console.log(`🗑️  Suppression de ${members.length} membres...`);
    
    // Supprimer chaque membre
    for (const member of members) {
      await deleteJSON(`${STRAPI_URL}/api/members/${member.id}`);
      console.log(`✓ Supprimé: ${member.name}`);
    }
    
    console.log('✅ Tous les membres supprimés !');
  } catch (error) {
    console.error('❌ Erreur lors de la suppression:', error);
  }
}

cleanMembers().catch(console.error);
