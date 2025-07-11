#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Fonction pour parser le front matter YAML simple
function parseFrontMatter(content) {
  if (!content.startsWith('---')) return null;
  
  const endIndex = content.indexOf('---', 3);
  if (endIndex === -1) return null;
  
  const frontMatter = content.slice(3, endIndex).trim();
  const body = content.slice(endIndex + 3).trim();
  
  const data = {};
  const lines = frontMatter.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;
    
    const key = line.slice(0, colonIndex).trim();
    let value = line.slice(colonIndex + 1).trim();
    
    // Gérer les listes YAML
    if (value === '' && i + 1 < lines.length && lines[i + 1].trim().startsWith('-')) {
      const listItems = [];
      i++;
      while (i < lines.length && lines[i].trim().startsWith('-')) {
        let listValue = lines[i].trim().slice(1).trim();
        // Supprimer les guillemets
        if ((listValue.startsWith('"') && listValue.endsWith('"')) || 
            (listValue.startsWith("'") && listValue.endsWith("'"))) {
          listValue = listValue.slice(1, -1);
        }
        listItems.push(listValue);
        i++;
      }
      i--; // Reculer d'une ligne car la boucle for va incrémenter
      data[key] = listItems;
      continue;
    }
    
    // Gérer les objets YAML simples (CTAs)
    if (value === '' && i + 1 < lines.length && lines[i + 1].includes(':')) {
      const objItems = [];
      i++;
      while (i < lines.length && lines[i].trim().startsWith('-')) {
        const obj = {};
        i++;
        while (i < lines.length && lines[i].trim() && !lines[i].trim().startsWith('-')) {
          const objLine = lines[i].trim();
          const objColonIndex = objLine.indexOf(':');
          if (objColonIndex !== -1) {
            const objKey = objLine.slice(0, objColonIndex).trim();
            let objValue = objLine.slice(objColonIndex + 1).trim();
            // Supprimer les guillemets
            if ((objValue.startsWith('"') && objValue.endsWith('"')) || 
                (objValue.startsWith("'") && objValue.endsWith("'"))) {
              objValue = objValue.slice(1, -1);
            }
            obj[objKey] = objValue;
          }
          i++;
        }
        objItems.push(obj);
        i--;
      }
      data[key] = objItems;
      continue;
    }
    
    // Supprimer les guillemets pour les valeurs simples
    if ((value.startsWith('"') && value.endsWith('"')) || 
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    
    data[key] = value;
  }
  
  return { data, body };
}

// Fonction pour générer l'index des posts
function generateBlogIndex() {
  const postsDir = path.join(__dirname, 'posts');
  const indexPath = path.join(__dirname, 'data', 'blog-index.json');
  
  try {
    // Créer le dossier data s'il n'existe pas
    const dataDir = path.dirname(indexPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Lire tous les fichiers Markdown du dossier posts
    if (!fs.existsSync(postsDir)) {
      console.log('Dossier posts/ non trouvé, création en cours...');
      fs.mkdirSync(postsDir, { recursive: true });
    }
    
    const files = fs.readdirSync(postsDir).filter(file => file.endsWith('.md'));
    
    const posts = [];
    
    for (const file of files) {
      try {
        const filePath = path.join(postsDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const parsed = parseFrontMatter(content);
        
        if (parsed && parsed.data.title) {
          const post = {
            filename: file,
            ...parsed.data,
            lastModified: fs.statSync(filePath).mtime.toISOString(),
            wordCount: parsed.body.split(/\s+/).length,
            excerpt: parsed.data.excerpt || parsed.body.substring(0, 200) + '...'
          };
          
          // Ne garder que les posts publiés
          if (post.published === true || post.published === 'true') {
            posts.push(post);
          }
        }
      } catch (error) {
        console.warn(`Erreur lors du traitement de ${file}:`, error.message);
      }
    }
    
    // Trier par date (plus récent d'abord)
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Générer l'index
    const index = {
      generated: new Date().toISOString(),
      count: posts.length,
      published: posts.filter(p => p.published === true || p.published === 'true').length,
      posts: posts
    };
    
    // Écrire l'index
    fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
    
    console.log(`Index blog généré avec succès : ${posts.length} posts`);
    console.log(`Fichier créé : ${indexPath}`);
    
    return index;
    
  } catch (error) {
    console.error('Erreur lors de la génération de l\'index blog:', error);
    process.exit(1);
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  generateBlogIndex();
}

module.exports = { generateBlogIndex }; 