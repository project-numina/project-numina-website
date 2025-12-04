# 🚀 Configuration Strapi pour Project Numina

## 📦 Données incluses

La base de données `data.db` contient déjà les données suivantes :
- **94 membres** (table `members`)
- **13 projets** (table `projects`)
- **8 articles** (table `articles`)
- **12 photos de communauté** (table `community_photos`)

## 🔧 Installation depuis zéro (Clone du repo)

### Étape 1 : Cloner le repository
```bash
git clone <url-du-repo>
cd project-numina-website
```

### Étape 2 : Installer les dépendances
```bash
cd strapi-cms
npm install
```

### Étape 3 : Configurer l'environnement ⚠️ CRITIQUE

**🔴 PROBLÈME COMMUN** : Si vous clonez le repo de zéro, le fichier `.env` n'existe pas (il est dans `.gitignore` pour des raisons de sécurité). **Sans ce fichier, Strapi ne peut pas démarrer** car les secrets JWT et autres sont obligatoires.

**✅ SOLUTION : Génération automatique (Recommandé)**
```bash
npm run setup
```
ou
```bash
node scripts/setup-env.js
```

Ce script génère automatiquement un fichier `.env` avec tous les secrets nécessaires (aléatoires et sécurisés).

**Option B : Création manuelle**
Si le script ne fonctionne pas, créez manuellement un fichier `.env` dans `strapi-cms/` avec le contenu suivant :

```env
# Secrets (générez des valeurs aléatoires pour chaque)
APP_KEYS=key1,key2,key3,key4
ADMIN_JWT_SECRET=votre-secret-jwt-admin
JWT_SECRET=votre-secret-jwt
API_TOKEN_SALT=votre-salt-api
TRANSFER_TOKEN_SALT=votre-salt-transfer
ENCRYPTION_KEY=votre-cle-chiffrement

# Base de données
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=./data.db

# Serveur
HOST=0.0.0.0
PORT=1337
NODE_ENV=development
```

**⚠️ IMPORTANT** : Les secrets doivent être des chaînes aléatoires uniques. Vous pouvez les générer avec :
```bash
# Générer un secret aléatoire (64 caractères)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**📝 Note** : Chaque développeur doit avoir son propre fichier `.env` avec des secrets différents. C'est normal et sécurisé.

### Étape 4 : Démarrer Strapi
```bash
npm run develop
```

### Étape 5 : Se connecter à l'interface d'administration

**URL** : http://localhost:1337/admin

⚠️ **IMPORTANT** : Si Strapi vous demande de créer un compte admin au démarrage, c'est normal ! La base de données contient déjà des utilisateurs, mais vous pouvez :

- **Option 1** : Créer un nouveau compte admin (recommandé pour le développement local)
- **Option 2** : Réinitialiser le mot de passe d'un compte existant avec le script :
  ```bash
  node scripts/reset-admin-password.js laurent@castagne.co votre_mot_de_passe
  ```
  Le mot de passe par défaut si vous n'en spécifiez pas est `admin123`.

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

