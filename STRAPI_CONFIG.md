# 🔧 Configuration de l'URL Strapi

## 📍 Comment ça fonctionne

Le site statique (sur Netlify) doit savoir où se trouve votre instance Strapi déployée pour charger les données.

## 🎯 Méthode 1 : Configuration directe dans les fichiers HTML

Dans chaque fichier HTML (`index.html`, `blog.html`, `community.html`), il y a maintenant un script au début qui définit l'URL :

```javascript
window.STRAPI_URL = 'https://votre-strapi.railway.app';
```

**Pour configurer :**
1. Déployez Strapi sur Railway, Render, ou un autre service
2. Notez l'URL de votre instance (ex: `https://project-numina-strapi.railway.app`)
3. Remplacez la ligne dans les 3 fichiers HTML :
   ```javascript
   window.STRAPI_URL = 'https://project-numina-strapi.railway.app';
   ```

## 🎯 Méthode 2 : Utiliser une variable d'environnement Netlify (recommandé)

Cette méthode est plus flexible car vous pouvez changer l'URL sans modifier le code.

### Étape 1 : Créer un fichier de configuration

Créez un fichier `netlify-config.js` à la racine :

```javascript
// netlify-config.js
window.STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
```

### Étape 2 : Dans Netlify

1. Allez dans **Site settings** → **Environment variables**
2. Ajoutez une variable : `STRAPI_URL` = `https://votre-strapi.railway.app`
3. Netlify injectera cette variable lors du build

### Étape 3 : Modifier le script dans les HTML

Remplacez le script par :
```javascript
<script>
  // L'URL sera injectée par Netlify lors du build
  window.STRAPI_URL = window.STRAPI_URL || '<!--# echo var="STRAPI_URL" default="http://localhost:1337" -->';
</script>
```

## ✅ Vérification

Une fois configuré, ouvrez la console du navigateur (F12) et tapez :
```javascript
console.log(window.STRAPI_URL);
```

Vous devriez voir l'URL de votre instance Strapi.

## 🔍 Dépannage

Si les données ne se chargent pas :
1. Vérifiez que Strapi est bien déployé et accessible
2. Vérifiez que l'API est publique (permissions configurées dans Strapi)
3. Vérifiez la console du navigateur pour les erreurs CORS
4. Assurez-vous que l'URL ne se termine pas par `/` (sauf si nécessaire)

