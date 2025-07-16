#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Fonction pour convertir les liens Markdown en HTML
function convertMarkdownLinks(text) {
  // Convertir les liens Markdown [texte](url) en <a href="url">texte</a>
  return text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
}

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
    

    
    // Gérer les objets YAML complexes (CTAs)
    if (key === 'ctas' && value === '') {
      const ctaItems = [];
      i++;
      while (i < lines.length && lines[i].trim().startsWith('-')) {
        const ctaObj = {};
        // Lire le premier élément après le tiret
        let currentLine = lines[i].trim().slice(1).trim(); // Enlever le tiret
        if (currentLine.includes(':')) {
          const colonIdx = currentLine.indexOf(':');
          const firstKey = currentLine.slice(0, colonIdx).trim();
          let firstValue = currentLine.slice(colonIdx + 1).trim();
          if ((firstValue.startsWith('"') && firstValue.endsWith('"')) || 
              (firstValue.startsWith("'") && firstValue.endsWith("'"))) {
            firstValue = firstValue.slice(1, -1);
          }
          ctaObj[firstKey] = firstValue;
        }
        
        // Lire les éléments suivants de ce CTA
        i++;
        while (i < lines.length && lines[i].trim() && !lines[i].trim().startsWith('-') && !lines[i].includes('---')) {
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
            ctaObj[objKey] = objValue;
          }
          i++;
        }
        if (Object.keys(ctaObj).length > 0) {
          ctaItems.push(ctaObj);
        }
        // Ne pas décrémenter i ici, car on veut continuer à chercher d'autres CTAs
      }
      // Décrémenter i une fois à la fin car la boucle for va incrémenter
      i--;
      data[key] = ctaItems;
      continue;
    }
    
    // Gérer les listes YAML simples avec tirets
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
            excerpt: convertMarkdownLinks(parsed.body.substring(0, 200)) + '...'
          };
          
          // Ne garder que les posts publiés (ancien format: published, nouveau format: status)
          if (post.published === true || post.published === 'true' || post.status === 'publié') {
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
      published: posts.filter(p => p.published === true || p.published === 'true' || p.status === 'publié').length,
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