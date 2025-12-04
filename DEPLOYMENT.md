# 🚀 Guide de déploiement - Project Numina

Ce guide explique comment publier en ligne le site statique et le CMS Strapi.

## 📋 Vue d'ensemble

Vous devez déployer **deux services séparés** :

1. **Strapi CMS** (backend) → Sur Railway, Render, ou Heroku
2. **Site statique** (frontend) → Sur Netlify, Vercel, ou GitHub Pages

Une fois déployés, vous devrez configurer l'URL de Strapi dans les fichiers HTML du site statique.

---

## 🎯 Étape 1 : Déployer Strapi CMS

### Option A : Railway (Recommandé - Gratuit pour commencer)

1. **Créer un compte sur Railway** : https://railway.app
2. **Créer un nouveau projet** :
   - Cliquez sur "New Project"
   - Sélectionnez "Deploy from GitHub repo"
   - Choisissez votre repository
   - Sélectionnez le dossier `strapi-cms`

3. **Configurer les variables d'environnement** :
   Dans les paramètres du projet Railway, ajoutez :
   ```
   NODE_ENV=production
   DATABASE_CLIENT=sqlite
   HOST=0.0.0.0
   PORT=1337
   ```

4. **Configurer la base de données** :
   - Railway créera automatiquement un volume pour `data.db`
   - Ou vous pouvez utiliser PostgreSQL (gratuit sur Railway)

5. **Déployer** :
   - Railway détectera automatiquement le `package.json`
   - Il exécutera `npm install` puis `npm run build` et `npm start`
   - Notez l'URL générée (ex: `https://project-numina-strapi.railway.app`)

### Option B : Render

1. **Créer un compte sur Render** : https://render.com
2. **Créer un nouveau "Web Service"**
3. **Connecter votre repository GitHub**
4. **Configurer** :
   - **Root Directory** : `strapi-cms`
   - **Build Command** : `npm install && npm run build`
   - **Start Command** : `npm start`
   - **Environment** : `Node`
   - **Plan** : Free (ou Starter pour plus de ressources)

5. **Variables d'environnement** :
   ```
   NODE_ENV=production
   DATABASE_CLIENT=sqlite
   ```

6. **Déployer** et noter l'URL

### Option C : Heroku

1. **Créer un compte sur Heroku** : https://heroku.com
2. **Installer Heroku CLI**
3. **Dans le dossier `strapi-cms`** :
   ```bash
   heroku create project-numina-strapi
   git subtree push --prefix strapi-cms heroku main
   ```

---

## 🎯 Étape 2 : Configurer les permissions Strapi

Une fois Strapi déployé, **connectez-vous à l'interface admin** (`https://votre-strapi.railway.app/admin`) :

1. Allez dans **Settings** → **Users & Permissions Plugin** → **Roles** → **Public**
2. Cochez les permissions pour :
   - `find` et `findOne` pour **Members**
   - `find` et `findOne` pour **Projects**
   - `find` et `findOne` pour **Articles**
   - `find` et `findOne` pour **Community Photos**
   - `find` et `findOne` pour **Featured Items** (si applicable)

3. **Sauvegarder**

4. **Configurer CORS** (si nécessaire) :
   - Allez dans **Settings** → **Middleware**
   - Dans la section CORS, ajoutez votre domaine Netlify (ex: `https://projectnumina.org`)

---

## 🎯 Étape 3 : Déployer le site statique

### Option A : Netlify (Recommandé)

1. **Créer un compte sur Netlify** : https://netlify.com
2. **Créer un nouveau site** :
   - Cliquez sur "Add new site" → "Import an existing project"
   - Connectez votre repository GitHub
   - Configurez :
     - **Base directory** : `/` (racine)
     - **Build command** : `npm run build` (ou laissez vide si pas de build)
     - **Publish directory** : `/` (ou le dossier contenant les fichiers HTML)

3. **Configurer la variable d'environnement** :
   - Allez dans **Site settings** → **Environment variables**
   - Ajoutez : `STRAPI_URL` = `https://votre-strapi.railway.app`
   - (Sans le `/` à la fin)

4. **Déployer** et noter l'URL (ex: `https://projectnumina.netlify.app`)

### Option B : Vercel

1. **Créer un compte sur Vercel** : https://vercel.com
2. **Importer votre projet** depuis GitHub
3. **Configurer** :
   - **Framework Preset** : Other
   - **Root Directory** : `/`
   - **Build Command** : `npm run build` (ou vide)
   - **Output Directory** : `/`

4. **Variables d'environnement** :
   - Ajoutez `STRAPI_URL` = `https://votre-strapi.railway.app`

### Option C : GitHub Pages

1. **Activer GitHub Pages** dans les paramètres du repository
2. **Choisir la branche** (généralement `main` ou `gh-pages`)
3. **Note** : GitHub Pages ne supporte pas les variables d'environnement, vous devrez utiliser la Méthode 1 ci-dessous

---

## 🎯 Étape 4 : Configurer l'URL Strapi dans le site

✅ **DÉJÀ CONFIGURÉ !** 

L'URL Strapi est automatiquement détectée :
- **En production** : `https://cms.projectnumina.ai` (Google Cloud)
- **En développement local** : `http://localhost:1337`

Les fichiers HTML (`index.html`, `blog.html`, `community.html`) sont déjà configurés avec cette logique. Aucune action nécessaire !

### Méthode 2 : Variable d'environnement Netlify (Recommandé)

Si vous utilisez Netlify, vous pouvez utiliser une variable d'environnement :

1. **Dans Netlify** : Ajoutez la variable `STRAPI_URL` = `https://votre-strapi.railway.app`

2. **Créer un script de build** (`netlify-build.js`) :
   ```javascript
   // netlify-build.js
   const fs = require('fs');
   const path = require('path');
   
   const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
   
   const files = ['index.html', 'blog.html', 'community.html'];
   
   files.forEach(file => {
     const filePath = path.join(__dirname, file);
     let content = fs.readFileSync(filePath, 'utf8');
     content = content.replace(
       /window\.STRAPI_URL\s*=\s*window\.STRAPI_URL\s*\|\|\s*['"](.*?)['"]/,
       `window.STRAPI_URL = '${STRAPI_URL}'`
     );
     fs.writeFileSync(filePath, content, 'utf8');
   });
   ```

3. **Modifier `package.json`** :
   ```json
   {
     "scripts": {
       "build": "node netlify-build.js && node generate-contributors-index.js && node generate-blog-index.js && node generate-projects-index.js"
     }
   }
   ```

**Avantages** : Flexible, pas besoin de modifier le code  
**Inconvénients** : Nécessite un script de build

---

## ✅ Étape 5 : Vérification

1. **Vérifier Strapi** :
   - Ouvrez `https://votre-strapi.railway.app/admin`
   - Connectez-vous avec vos identifiants
   - Vérifiez que l'API est accessible : `https://votre-strapi.railway.app/api/members`

2. **Vérifier le site** :
   - Ouvrez votre site déployé (ex: `https://projectnumina.netlify.app`)
   - Ouvrez la console du navigateur (F12)
   - Tapez : `console.log(window.STRAPI_URL)`
   - Vous devriez voir l'URL de votre Strapi

3. **Tester les données** :
   - Vérifiez que les membres s'affichent sur `/community.html`
   - Vérifiez que les projets s'affichent sur `/index.html`
   - Vérifiez que les articles s'affichent sur `/blog.html`

---

## 🔧 Dépannage

### Les données ne se chargent pas

1. **Vérifier l'URL Strapi** :
   - Ouvrez la console du navigateur
   - Vérifiez que `window.STRAPI_URL` est correct
   - Testez l'URL directement : `https://votre-strapi.railway.app/api/members`

2. **Vérifier les permissions Strapi** :
   - Connectez-vous à l'admin Strapi
   - Vérifiez que les permissions publiques sont activées

3. **Vérifier CORS** :
   - Si vous voyez des erreurs CORS dans la console
   - Configurez CORS dans Strapi pour autoriser votre domaine

4. **Vérifier que l'URL ne se termine pas par `/`** :
   - L'URL doit être : `https://votre-strapi.railway.app`
   - Pas : `https://votre-strapi.railway.app/`

### Strapi ne démarre pas en production

1. **Vérifier les variables d'environnement**
2. **Vérifier les logs** sur Railway/Render
3. **Vérifier que `npm run build` a réussi**
4. **Vérifier que la base de données est accessible**

---

## 📝 Checklist de déploiement

- [ ] Strapi déployé sur Railway/Render/Heroku
- [ ] URL Strapi notée (ex: `https://project-numina-strapi.railway.app`)
- [ ] Permissions publiques configurées dans Strapi
- [ ] CORS configuré dans Strapi (si nécessaire)
- [ ] Site statique déployé sur Netlify/Vercel
- [ ] Variable d'environnement `STRAPI_URL` configurée (ou fichiers HTML modifiés)
- [ ] Site testé et fonctionnel
- [ ] Données affichées correctement

---

## 🔄 Mises à jour futures

Pour mettre à jour le contenu :
1. Connectez-vous à l'admin Strapi (`https://votre-strapi.railway.app/admin`)
2. Modifiez le contenu dans Strapi
3. Les changements sont immédiatement visibles sur le site (pas besoin de redéployer)

Pour mettre à jour le code du site :
1. Poussez les changements sur GitHub
2. Netlify/Vercel redéploiera automatiquement

Pour mettre à jour Strapi :
1. Poussez les changements sur GitHub
2. Railway/Render redéploiera automatiquement

