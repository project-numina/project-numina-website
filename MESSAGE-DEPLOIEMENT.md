# 📋 Message pour le développeur - Déploiement du site Project Numina

---

## 🎯 Contexte

Le site Project Numina est prêt à être déployé. Il s'agit d'un site statique qui se connecte à un CMS Strapi pour charger dynamiquement le contenu (membres, projets, articles, photos).

## ✅ État actuel

- ✅ **Strapi CMS** : Déjà déployé sur Google Cloud à `https://cms.projectnumina.ai`
- ✅ **Configuration URL** : Déjà configurée dans les fichiers HTML
- ✅ **Site statique** : Prêt à être déployé

## 🚀 Déploiement du site statique

### Option recommandée : Netlify

1. **Créer un compte** sur https://netlify.com (ou utiliser un compte existant)

2. **Créer un nouveau site** :
   - Cliquez sur "Add new site" → "Import an existing project"
   - Connectez le repository GitHub du projet
   - Configurez :
     - **Base directory** : `/` (racine du projet)
     - **Build command** : `npm run build` (génère les index JSON)
     - **Publish directory** : `/` (les fichiers HTML sont à la racine)

3. **Variables d'environnement** (optionnel) :
   - Si vous voulez surcharger l'URL Strapi, ajoutez :
     - Nom : `STRAPI_URL`
     - Valeur : `https://cms.projectnumina.ai`
   - **Note** : Ce n'est pas nécessaire car l'URL est déjà configurée dans le code

4. **Déployer** :
   - Netlify détectera automatiquement les changements
   - Le site sera accessible via une URL Netlify (ex: `project-numina.netlify.app`)

### Alternative : Vercel

1. **Créer un compte** sur https://vercel.com
2. **Importer le projet** depuis GitHub
3. **Configurer** :
   - Framework Preset : **Other**
   - Root Directory : `/`
   - Build Command : `npm run build`
   - Output Directory : `/`

## 🔧 Configuration technique

### URL Strapi

L'URL du CMS Strapi est **déjà configurée** dans les fichiers HTML :
- **Production** : `https://cms.projectnumina.ai`
- **Développement local** : `http://localhost:1337`

La détection se fait automatiquement selon le hostname. Aucune modification nécessaire !

### Fichiers à déployer

Le site est composé de fichiers statiques :
- `index.html` (page d'accueil)
- `blog.html` (blog)
- `community.html` (communauté)
- `about-us.html` (à propos)
- `legal-notice.html` (mentions légales)
- Dossiers : `Assets/`, `favicon/`, `partner_logos/`, etc.

### Scripts disponibles

```bash
# Générer les index JSON (nécessaire avant le déploiement)
npm run build

# Ou individuellement :
npm run generate-contributors
npm run generate-blog
npm run generate-projects
```

## ✅ Checklist de déploiement

- [ ] Repository GitHub connecté à Netlify/Vercel
- [ ] Build command configuré : `npm run build`
- [ ] Site déployé et accessible
- [ ] Tester que les données s'affichent (membres, projets, articles)
- [ ] Vérifier la console du navigateur (F12) pour les erreurs
- [ ] Configurer le domaine personnalisé (si nécessaire)

## 🧪 Tests à effectuer après déploiement

1. **Page d'accueil** (`/index.html`) :
   - Vérifier que les projets s'affichent
   - Vérifier que les "featured items" s'affichent

2. **Page blog** (`/blog.html`) :
   - Vérifier que les articles s'affichent
   - Tester la navigation entre articles

3. **Page communauté** (`/community.html`) :
   - Vérifier que les membres s'affichent
   - Vérifier que les photos de communauté s'affichent

4. **Console du navigateur** :
   - Ouvrir F12 → Console
   - Vérifier qu'il n'y a pas d'erreurs
   - Taper : `console.log(window.STRAPI_URL)` → doit afficher `https://cms.projectnumina.ai`

## 🔍 Dépannage

### Les données ne s'affichent pas

1. **Vérifier l'URL Strapi** :
   - Console navigateur : `console.log(window.STRAPI_URL)`
   - Doit afficher : `https://cms.projectnumina.ai`

2. **Tester l'API Strapi directement** :
   - Ouvrir : `https://cms.projectnumina.ai/api/members`
   - Doit retourner du JSON

3. **Vérifier les permissions Strapi** :
   - Se connecter à `https://cms.projectnumina.ai/admin`
   - Vérifier que les permissions publiques sont activées (Settings → Users & Permissions → Roles → Public)

4. **Vérifier CORS** :
   - Si erreurs CORS dans la console
   - Configurer CORS dans Strapi pour autoriser votre domaine

### Le build échoue

- Vérifier que Node.js est installé (version >= 16)
- Vérifier que les dépendances sont installées : `npm install`
- Vérifier les logs de build dans Netlify/Vercel

## 📝 Informations importantes

- **URL Strapi CMS** : `https://cms.projectnumina.ai`
- **Interface admin Strapi** : `https://cms.projectnumina.ai/admin`
- **Identifiants admin** : À demander à l'équipe si nécessaire

## 📚 Documentation

- Guide de déploiement complet : `DEPLOYMENT.md`
- Configuration Strapi : `STRAPI_CONFIG.md`
- Workflow admin : `ADMIN-WORKFLOW.txt`

## ❓ Questions ?

Si vous avez des questions ou rencontrez des problèmes :
1. Vérifier les logs de déploiement dans Netlify/Vercel
2. Vérifier la console du navigateur pour les erreurs
3. Tester l'API Strapi directement
4. Contacter l'équipe si nécessaire

---

**Bon déploiement ! 🚀**

