# Configuration Netlify CMS pour Project Numina

Ce guide explique comment mettre en place et utiliser Netlify CMS (maintenant Decap CMS) pour gérer le contenu du site Project Numina.

## 🚀 Mise en place rapide

### 1. Prérequis
- Repo GitHub : `project-numina/project-numina-website`
- Compte Netlify connecté au repo
- Accès aux paramètres du site Netlify

### 2. Activation de Netlify Identity

1. **Dans le tableau de bord Netlify :**
   - Allez dans `Site settings` > `Identity`
   - Cliquez sur `Enable Identity`

2. **Configuration de l'authentification :**
   - Dans `Registration preferences` : sélectionnez `Invite only` (recommandé)
   - Dans `Git Gateway` : activez Git Gateway
   - Cliquez sur `Generate access token in GitHub` et suivez les instructions

### 3. Invitation des utilisateurs

1. Dans l'onglet `Identity` de votre site Netlify
2. Cliquez sur `Invite users`
3. Saisissez l'email de la personne qui gérera le contenu
4. Elle recevra un email d'invitation

### 4. Accès au CMS

Une fois déployé, le CMS sera accessible à l'URL : **`https://votre-site.netlify.app/admin/`**

## 📁 Structure des fichiers

```
├── admin/
│   ├── config.yml          # Configuration du CMS
│   └── index.html          # Interface d'administration
├── data/
│   ├── team/               # Membres de l'équipe (JSON)
│   ├── projects/           # Projets (JSON) 
│   ├── homepage.json       # Contenu page d'accueil
│   └── settings.json       # Paramètres du site
├── posts/                  # Articles de blog (Markdown)
├── assets/uploads/         # Médias uploadés via le CMS
└── README-CMS.md          # Ce guide
```

## ✏️ Utilisation du CMS

### Gestion de l'équipe
- **Dossier :** `data/team/`
- **Format :** JSON
- **Champs :** nom, rôle, photo, tags, URL, bio, ordre

### Gestion des projets
- **Dossier :** `data/projects/`
- **Format :** JSON
- **Champs :** titre, description, image, tags, liens, statut

### Articles de blog
- **Dossier :** `posts/`
- **Format :** Markdown avec front matter
- **Champs :** titre, date, auteur, image, contenu

## 🔧 Intégration dans le code HTML

Pour afficher les données dans vos pages HTML, vous devrez utiliser JavaScript pour charger les fichiers JSON :

```javascript
// Exemple : charger les membres de l'équipe
fetch('/data/team/membre.json')
  .then(response => response.json())
  .then(data => {
    // Utiliser les données pour construire l'HTML
    console.log(data.name, data.role);
  });
```

## 📝 Workflow recommandé

1. **L'administrateur se connecte** sur `/admin/`
2. **Ajoute/modifie du contenu** via l'interface
3. **Les modifications** sont automatiquement commitées sur GitHub
4. **Netlify redéploie** automatiquement le site

## 🔐 Sécurité

- ⚠️ **Important :** Configurez toujours `Registration preferences` en mode `Invite only`
- Les utilisateurs invités peuvent uniquement gérer le contenu, pas la configuration
- Seuls les collaborateurs GitHub avec accès au repo peuvent modifier `admin/config.yml`

## 🛠️ Personnalisation

Pour modifier les champs ou ajouter de nouvelles collections, éditez le fichier `admin/config.yml`.

### Exemples de modifications :

**Ajouter un champ :**
```yaml
fields:
  - {label: "Nouveau champ", name: "nouveau_champ", widget: "string"}
```

**Nouvelle collection :**
```yaml
- name: "testimonials"
  label: "Témoignages"
  folder: "data/testimonials"
  create: true
  fields:
    - {label: "Nom", name: "name", widget: "string"}
    - {label: "Citation", name: "quote", widget: "text"}
```

## 📞 Support

- [Documentation Decap CMS](https://decapcms.org/docs/)
- [Guide Netlify Identity](https://docs.netlify.com/visitor-access/identity/)

---

*Dernière mise à jour : Janvier 2024* 