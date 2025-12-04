# 🚀 Installation rapide - Strapi CMS

## ⚠️ Problème courant : "Impossible de se connecter après un clone"

**Symptôme** : Après avoir cloné le repo, Strapi ne démarre pas ou vous ne pouvez pas vous connecter.

**Cause** : Le fichier `.env` contenant les secrets nécessaires n'est **pas dans le repo Git** (pour des raisons de sécurité). Sans ces secrets, Strapi ne peut pas fonctionner.

## ✅ Solution en 3 étapes

### 1. Installer les dépendances
```bash
cd strapi-cms
npm install
```

### 2. Générer le fichier .env
```bash
npm run setup
```

Ce script crée automatiquement un fichier `.env` avec tous les secrets nécessaires.

### 3. Démarrer Strapi
```bash
npm run develop
```

Puis accédez à http://localhost:1337/admin

## 🔐 Se connecter pour la première fois

Si Strapi vous demande de créer un compte admin :
- **Option 1** : Créez un nouveau compte (recommandé pour le développement local)
- **Option 2** : Réinitialisez le mot de passe d'un compte existant :
  ```bash
  node scripts/reset-admin-password.js laurent@castagne.co votre_mot_de_passe
  ```
  Le mot de passe par défaut est `admin123` si vous n'en spécifiez pas.

## 📋 Checklist de vérification

- [ ] `npm install` exécuté avec succès
- [ ] `npm run setup` exécuté (fichier `.env` créé)
- [ ] Strapi démarre sans erreur (`npm run develop`)
- [ ] Vous pouvez accéder à http://localhost:1337/admin
- [ ] Vous pouvez vous connecter (nouveau compte ou compte réinitialisé)

## 🐛 Problèmes courants

### "Missing required environment variable: APP_KEYS"
→ Exécutez `npm run setup` pour générer le fichier `.env`

### "Cannot connect to database"
→ Vérifiez que `data.db` existe dans `strapi-cms/`
→ Vérifiez que `.env` contient `DATABASE_FILENAME=./data.db`

### "Login page but cannot connect"
→ Voir `TROUBLESHOOTING-LOGIN.md` pour les solutions détaillées
→ Essayez de créer un nouveau compte admin
→ Videz le cache et les cookies du navigateur

## 📚 Documentation complète

- `SETUP.md` - Guide d'installation détaillé
- `SETUP-FIRST-TIME.md` - Guide pour la première installation
- `TROUBLESHOOTING-LOGIN.md` - Solutions aux problèmes de connexion

