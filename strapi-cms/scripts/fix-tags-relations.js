const fs = require('fs');
const path = require('path');
const slugify = require('slugify');

// Configuration
const STRAPI_URL = 'http://localhost:1337';
const PROJECT_ROOT = path.resolve(__dirname, '..', '..');

async function getJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.json();
}

async function postJSON(url, data) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.json();
}

async function putJSON(url, data) {
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.json();
}

async function fixMemberTags() {
  try {
    console.log('🔧 Fixing member tags relations...');
    
    // 1. Récupérer tous les tags
    const tagsRes = await getJSON(`${STRAPI_URL}/api/member-tags`);
    const tags = tagsRes.data || [];
    console.log(`📋 Found ${tags.length} member tags`);
    
    // 2. Récupérer tous les membres
    const membersRes = await getJSON(`${STRAPI_URL}/api/members`);
    const members = membersRes.data || [];
    console.log(`👥 Found ${members.length} members`);
    
    // 3. Lire les données source pour obtenir les tags de chaque membre
    const teamDir = path.join(PROJECT_ROOT, 'data', 'team');
    const teamFiles = fs.readdirSync(teamDir).filter(f => f.endsWith('.json'));
    
    for (const member of members) {
      const memberFile = teamFiles.find(f => {
        const memberData = JSON.parse(fs.readFileSync(path.join(teamDir, f), 'utf8'));
        return slugify(memberData.name, { lower: true, strict: true }) === member.slug;
      });
      
      if (memberFile) {
        const memberData = JSON.parse(fs.readFileSync(path.join(teamDir, memberFile), 'utf8'));
        const memberTags = memberData.tags || [];
        
        // Trouver les IDs des tags correspondants
        const tagIds = memberTags
          .map(tagName => tags.find(t => t.name === tagName)?.id)
          .filter(Boolean);
        
        if (tagIds.length > 0) {
          console.log(`🔗 Linking ${member.name} to tags: ${memberTags.join(', ')}`);
          
          // Mettre à jour le membre avec ses tags
          await putJSON(`${STRAPI_URL}/api/members/${member.id}`, {
            data: {
              member_tags: tagIds
            }
          });
        }
      }
    }
    
    console.log('✅ Member tags relations fixed!');
  } catch (error) {
    console.error('❌ Error fixing member tags:', error);
  }
}

async function fixProjectTags() {
  try {
    console.log('🔧 Fixing project tags relations...');
    
    // 1. Récupérer tous les tags de projets
    const tagsRes = await getJSON(`${STRAPI_URL}/api/project-tags`);
    const tags = tagsRes.data || [];
    console.log(`📋 Found ${tags.length} project tags`);
    
    // 2. Récupérer tous les projets
    const projectsRes = await getJSON(`${STRAPI_URL}/api/projects`);
    const projects = projectsRes.data || [];
    console.log(`🚀 Found ${projects.length} projects`);
    
    // 3. Lire les données source pour obtenir les tags de chaque projet
    const projectsDir = path.join(PROJECT_ROOT, 'data', 'projects');
    const projectFiles = fs.readdirSync(projectsDir).filter(f => f.endsWith('.json'));
    
    for (const project of projects) {
      const projectFile = projectFiles.find(f => {
        const projectData = JSON.parse(fs.readFileSync(path.join(projectsDir, f), 'utf8'));
        return slugify(projectData.title, { lower: true, strict: true }) === project.slug;
      });
      
      if (projectFile) {
        const projectData = JSON.parse(fs.readFileSync(path.join(projectsDir, projectFile), 'utf8'));
        const projectTags = projectData.tags || [];
        
        // Trouver les IDs des tags correspondants
        const tagIds = projectTags
          .map(tagName => tags.find(t => t.name === tagName)?.id)
          .filter(Boolean);
        
        if (tagIds.length > 0) {
          console.log(`🔗 Linking ${project.title} to tags: ${projectTags.join(', ')}`);
          
          // Mettre à jour le projet avec ses tags
          await putJSON(`${STRAPI_URL}/api/projects/${project.id}`, {
            data: {
              project_tags: tagIds
            }
          });
        }
      }
    }
    
    console.log('✅ Project tags relations fixed!');
  } catch (error) {
    console.error('❌ Error fixing project tags:', error);
  }
}

async function main() {
  await fixMemberTags();
  await fixProjectTags();
  console.log('🎉 All tag relations fixed!');
}

main().catch(console.error);
