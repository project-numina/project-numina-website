# 🔧 Installation Strapi - Première fois

## ⚠️ Strapi demande de créer un compte admin ?

**C'est normal !** Voici pourquoi et comment procéder :

## 📋 Situation

La base de données `data.db` contient déjà :
- ✅ 2 comptes admin existants (`laurent@castagne.co` et `admin@numina.com`)
- ✅ Toutes les données (membres, projets, articles, photos)

Mais Strapi peut quand même demander de créer un compte si :
1. Les secrets dans votre `.env` sont différents de ceux utilisés pour créer les comptes
2. C'est la première fois que vous démarrez Strapi localement

## ✅ Solutions

### Option 1 : Créer un nouveau compte admin (Recommandé)

1. Créez simplement un compte admin avec vos propres identifiants
2. Vous aurez accès à toutes les données existantes
3. C'est le plus simple pour le développement local

### Option 2 : Réinitialiser le mot de passe d'un compte existant

Si vous voulez utiliser un compte existant :

```bash
# Réinitialiser le mot de passe de laurent@castagne.co
node scripts/reset-admin-password.js laurent@castagne.co votre_mot_de_passe

# Ou pour admin@numina.com
node scripts/reset-admin-password.js admin@numina.com votre_mot_de_passe
```

Puis connectez-vous avec cet email et le nouveau mot de passe.

## 🔍 Vérifier que tout fonctionne

Une fois connecté, vérifiez dans **Content Manager** que vous voyez :
- **Members** : ~94 entrées
- **Projects** : ~13 entrées
- **Articles** : ~8 entrées
- **Community Photos** : ~12 entrées

Si vous ne voyez pas ces données, vérifiez que :
1. Le fichier `data.db` est bien présent dans `strapi-cms/`
2. Votre `.env` contient : `DATABASE_FILENAME=./data.db`
3. Redémarrez Strapi

## 📝 Note importante

Les comptes admin locaux sont indépendants de la production. Vous pouvez créer autant de comptes que nécessaire pour le développement local sans affecter la production sur `cms.projectnumina.ai`.

