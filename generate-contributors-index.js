#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Fonction pour générer l'index des contributeurs
function generateContributorsIndex() {
  const teamDir = path.join(__dirname, 'data', 'team');
  const indexPath = path.join(__dirname, 'data', 'contributors-index.json');
  
  try {
    // Lire tous les fichiers JSON du dossier team
    const files = fs.readdirSync(teamDir).filter(file => file.endsWith('.json'));
    
    const contributors = [];
    
    for (const file of files) {
      try {
        const filePath = path.join(teamDir, file);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        // Vérifier que c'est un contributeur valide
        if (data.name && data.name.trim() !== '') {
          contributors.push({
            filename: file.replace('.json', ''),
            name: data.name,
            tags: data.tags || [],
            lastModified: fs.statSync(filePath).mtime.toISOString()
          });
        }
      } catch (error) {
        console.warn(`Erreur lors du traitement de ${file}:`, error.message);
      }
    }
    
    // Trier par nom
    contributors.sort((a, b) => a.name.localeCompare(b.name));
    
    // Générer l'index
    const index = {
      generated: new Date().toISOString(),
      count: contributors.length,
      contributors: contributors
    };
    
    // Écrire l'index
    fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
    
    console.log(`Index généré avec succès : ${contributors.length} contributeurs`);
    console.log(`Fichier créé : ${indexPath}`);
    
    return index;
    
  } catch (error) {
    console.error('Erreur lors de la génération de l\'index:', error);
    process.exit(1);
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  generateContributorsIndex();
}

module.exports = { generateContributorsIndex }; 