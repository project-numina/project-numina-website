#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Fonction pour générer l'index des projets
function generateProjectsIndex() {
  const projectsDir = path.join(__dirname, 'data', 'projects');
  const indexPath = path.join(__dirname, 'data', 'projects-index.json');
  
  try {
    // Créer le dossier data s'il n'existe pas
    const dataDir = path.dirname(indexPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Lire tous les fichiers JSON du dossier projects
    if (!fs.existsSync(projectsDir)) {
      console.log('Dossier data/projects/ non trouvé, création en cours...');
      fs.mkdirSync(projectsDir, { recursive: true });
    }
    
    const files = fs.readdirSync(projectsDir).filter(file => file.endsWith('.json'));
    
    const projects = [];
    
    for (const file of files) {
      try {
        const filePath = path.join(projectsDir, file);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        // Vérifier que c'est un projet valide
        if (data.title && data.title.trim() !== '') {
          const project = {
            filename: file.replace('.json', ''),
            title: data.title,
            tags: data.tags || [],
            status: data.status || '',
            highlight: data.highlight || false,
            published: data.published || 'draft',
            lastModified: fs.statSync(filePath).mtime.toISOString()
          };
          
          // Ne garder que les projets publiés
          if (project.published === 'published') {
            projects.push(project);
          }
        }
      } catch (error) {
        console.warn(`Erreur lors du traitement de ${file}:`, error.message);
      }
    }
    
    // Trier par ordre : projets en avant d'abord, puis par titre
    projects.sort((a, b) => {
      if (a.highlight && !b.highlight) return -1;
      if (!a.highlight && b.highlight) return 1;
      return a.title.localeCompare(b.title);
    });
    
    // Générer l'index
    const index = {
      generated: new Date().toISOString(),
      count: projects.length,
      published: projects.filter(p => p.published === 'published').length,
      projects: projects
    };
    
    // Écrire l'index
    fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
    
    console.log(`Index projets généré avec succès : ${projects.length} projets`);
    console.log(`Fichier créé : ${indexPath}`);
    
    return index;
    
  } catch (error) {
    console.error('Erreur lors de la génération de l\'index projets:', error);
    process.exit(1);
  }
}

// Exécuter le script si appelé directement
if (require.main === module) {
  generateProjectsIndex();
}

module.exports = generateProjectsIndex; 