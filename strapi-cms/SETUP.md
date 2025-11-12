# 🚀 Configuration Strapi pour Project Numina

## 📦 Données incluses

La base de données `data.db` contient déjà les données suivantes :
- **94 membres** (table `members`)
- **13 projets** (table `projects`)
- **8 articles** (table `articles`)
- **12 photos de communauté** (table `community_photos`)

## 🔧 Installation et démarrage

1. **Installer les dépendances** :
```bash
cd strapi-cms
npm install
```

2. **Créer le fichier .env** (copier depuis .env.example) :
```bash
cp .env.example .env
```

3. **Démarrer Strapi** :
```bash
npm run develop
```

4. **Accéder à l'interface d'administration** :
- URL : http://localhost:1337/admin
- Créer un compte admin au premier démarrage (si nécessaire)

## 📊 Vérifier les données

Une fois Strapi démarré, vous devriez voir :
- **Content Manager** → **Members** : 94 entrées
- **Content Manager** → **Projects** : 13 entrées
- **Content Manager** → **Articles** : 8 entrées
- **Content Manager** → **Community Photos** : 12 entrées

## ⚠️ Note importante

La base de données `data.db` est incluse dans le repository. Si vous ne voyez pas les données :
1. Vérifiez que le fichier `data.db` est présent dans `strapi-cms/`
2. Vérifiez que Strapi utilise bien SQLite (configuré dans `config/database.ts`)
3. Redémarrez Strapi après avoir cloné le repository

## 🔐 Permissions API

Les permissions pour l'API publique sont configurées dans `src/index.ts` pour permettre l'accès en lecture publique aux collections.

