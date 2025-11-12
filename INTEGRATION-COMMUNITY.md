# Intégration CMS Communauté avec community.html

## ✅ Configuration terminée

La collection "Communauté" est maintenant configurée dans le CMS avec :
- **48 contributeurs migrés** depuis `contributors.json`
- **Champs adaptés** : Nom, Avatar, Tags, URL
- **Tags prédéfinis** : Active Contributor, Alumni, Founding Members, Scientific Advisors

## 🔧 Intégration avec community.html

### 1. Structure actuelle

Les données sont maintenant dans `data/team/` :
```
data/team/
├── stanislas-polu.json
├── laurent-mille.json
├── mantas-baksys.json
└── ... (45 autres fichiers)
```

### 2. Format des fichiers JSON

Chaque contributeur a cette structure :
```json
{
  "name": "Stanislas Polu",
  "image": "profile_photos/Stanislas_Polu.jpeg", 
  "tags": ["Founding Members", "Scientific Advisors"],
  "url": "https://www.linkedin.com/in/spolu/"
}
```

### 3. Code JavaScript pour charger les données

Ajoutez ce script à `community.html` pour charger dynamiquement les contributeurs :

```javascript
// Liste des fichiers contributeurs (peut être générée automatiquement)
const contributorFiles = [
  'alain-durmus', 'albert-jiang', 'ben-lipkin', 'bolton-bailey',
  'ebony-zhang', 'ed-beeching', 'francisco-moreira-machado', 
  'frederick-pu', 'gergely-berczi', 'guillaume-lample',
  'helene-evain', 'hugues-de-saxce', 'jia-li', 'jianqiao-lu',
  'jiawei-liu', 'julien-michel', 'kashif-rasul', 'laurent-mille',
  'leo-dreyfus-schmidt', 'lewis-tunstall', 'liangjun-zhong',
  'longhui-yu', 'luigi-pagani', 'mantas-baksys', 'marco-dos-santos',
  'marina-vinyes', 'mert-unsal', 'pauline-bourigault', 'philip-vonderlind',
  'professor-bin-dong', 'ran-wang', 'roman-soletskyi', 's-looi',
  'shengyi-costa-huang', 'simon-frieder', 'stanislas-polu',
  'thibaut-barroyer', 'wen-ding-li', 'yann-fleureau', 'yazhe-niu',
  'yufan-zhao', 'zekai-zhu', 'zhenzhe-ying', 'zhou-li', 'zhouliang',
  'zihan-qin', 'ziju-shen'
];

async function loadCommunityMembers() {
  const contributors = [];
  
  // Charger tous les fichiers contributeurs
  for (const file of contributorFiles) {
    try {
      const response = await fetch(`/data/team/${file}.json`);
      if (response.ok) {
        const contributor = await response.json();
        contributors.push(contributor);
      }
    } catch (error) {
      console.warn(`Erreur lors du chargement de ${file}:`, error);
    }
  }
  
  return contributors;
}

// Fonction pour filtrer par tags
function filterByTag(contributors, tag) {
  if (tag === 'all') return contributors;
  return contributors.filter(contributor => 
    contributor.tags && contributor.tags.includes(tag)
  );
}

// Fonction pour générer le HTML d'un contributeur
function generateContributorHTML(contributor) {
  const imageUrl = contributor.image || 'profile_photos/default.png';
  const tags = contributor.tags ? contributor.tags.join(', ') : '';
  
  return `
    <div class="contributor-card" data-tags="${contributor.tags ? contributor.tags.join(' ') : ''}">
      <div class="contributor-avatar">
        <img src="${imageUrl}" alt="${contributor.name}" />
      </div>
      <div class="contributor-info">
        <h3 class="contributor-name">${contributor.name}</h3>
        <div class="contributor-tags">${tags}</div>
        ${contributor.url ? `<a href="${contributor.url}" target="_blank" class="contributor-link">Voir le profil</a>` : ''}
      </div>
    </div>
  `;
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', async () => {
  const contributors = await loadCommunityMembers();
  const container = document.getElementById('contributors-container');
  
  if (container) {
    // Afficher tous les contributeurs
    container.innerHTML = contributors
      .map(contributor => generateContributorHTML(contributor))
      .join('');
    
    // Ajouter les filtres si nécessaire
    setupFilters(contributors);
  }
});

// Fonction pour configurer les filtres par tags
function setupFilters(contributors) {
  // Obtenir tous les tags uniques
  const allTags = [...new Set(
    contributors.flatMap(c => c.tags || [])
  )];
  
  // Créer les boutons de filtre
  const filtersContainer = document.getElementById('filters-container');
  if (filtersContainer) {
    const filterButtons = [
      '<button class="filter-btn active" data-filter="all">Tous</button>',
      ...allTags.map(tag => 
        `<button class="filter-btn" data-filter="${tag}">${tag}</button>`
      )
    ].join('');
    
    filtersContainer.innerHTML = filterButtons;
    
    // Ajouter les événements de clic
    filtersContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('filter-btn')) {
        // Mettre à jour l'état actif
        document.querySelectorAll('.filter-btn').forEach(btn => 
          btn.classList.remove('active')
        );
        e.target.classList.add('active');
        
        // Filtrer et afficher
        const filter = e.target.dataset.filter;
        const filtered = filterByTag(contributors, filter);
        const container = document.getElementById('contributors-container');
        
        container.innerHTML = filtered
          .map(contributor => generateContributorHTML(contributor))
          .join('');
      }
    });
  }
}
```

### 4. HTML requis dans community.html

Ajoutez ces éléments dans votre page :

```html
<!-- Conteneur pour les filtres (optionnel) -->
<div id="filters-container"></div>

<!-- Conteneur pour les contributeurs -->
<div id="contributors-container">
  <!-- Les contributeurs seront chargés ici dynamiquement -->
</div>
```

## 🎯 Utilisation du CMS

### Via l'interface Strapi
1. Accédez à l'interface d'administration Strapi (par défaut : http://localhost:1337/admin en développement)
2. Cliquez sur "Members" dans le menu de gauche
3. **Modifier** un contributeur existant
4. **Ajouter** un nouveau membre avec "Create new entry"
5. **Tags disponibles** : Active Contributor, Alumni, Founding Members, Scientific Advisors

### Workflow
1. **Modification dans Strapi** → sauvegarde dans la base de données Strapi
2. **API Strapi** → les données sont immédiatement disponibles via l'API REST
3. **Page community.html** → charge automatiquement les nouvelles données depuis l'API Strapi

## 🔧 Personnalisation

### Modifier les tags disponibles
Éditez le schéma Strapi dans `strapi-cms/src/api/member/content-types/member/schema.json` :
```json
"member_tags": {
  "type": "enumeration",
  "enum": ["Active Contributor", "Alumni", "Founding Members", "Scientific Advisors", "Nouveau Tag"]
}
```

### Ajouter des champs
Dans le schéma Strapi `strapi-cms/src/api/member/content-types/member/schema.json`, ajoutez dans la section `attributes` :
```json
"bio": {
  "type": "text",
  "required": false
}
```

## 📁 Structure finale

```
numina-website/
├── community.html              # Page avec le script d'intégration
├── strapi-cms/                 # Application Strapi avec les schémas de contenu
└── contributors.json           # Ancien fichier (peut être supprimé)
```

## ✅ Avantages de cette approche

- **Pas de code** : votre contact peut tout gérer via l'interface d'administration Strapi
- **Temps réel** : modifications visibles immédiatement via l'API Strapi
- **Flexibilité** : ajout/suppression de membres facile
- **Sécurité** : validation des données par le CMS
- **Historique** : toutes les modifications sont trackées sur GitHub 