# 🔧 Dépannage - Problème de connexion admin

## ❌ Symptôme
- Les identifiants sont acceptés (pas d'erreur dans les logs)
- Mais vous restez bloqué sur la page de login
- La connexion ne se fait pas

## 🔍 Causes possibles

### 1. Problème de cookies/session (le plus fréquent)

**Symptôme** : Les cookies ne sont pas envoyés ou reçus correctement.

**Solutions** :

#### A. Vérifier la configuration CORS
Le fichier `config/middlewares.ts` doit avoir :
```typescript
{
  name: 'strapi::cors',
  config: {
    origin: ['http://localhost:1337', 'http://localhost:3000'],
    credentials: true, // IMPORTANT pour les cookies
    // ...
  },
}
```

#### B. Vérifier dans le navigateur
1. Ouvrez les **Outils de développement** (F12)
2. Allez dans l'onglet **Application** (Chrome) ou **Stockage** (Firefox)
3. Vérifiez les **Cookies** pour `http://localhost:1337`
4. Vous devriez voir un cookie de session après la connexion

#### C. Vider le cache et les cookies
1. Ouvrez les **Outils de développement** (F12)
2. Clic droit sur le bouton de rafraîchissement
3. Sélectionnez **Vider le cache et effectuer une actualisation forcée**

#### D. Tester en navigation privée
Ouvrez une fenêtre de navigation privée et essayez de vous connecter.

### 2. Problème avec les secrets JWT

**Symptôme** : Les tokens JWT ne sont pas valides.

**Solution** :
1. Vérifiez que votre `.env` contient bien tous les secrets :
   ```
   ADMIN_JWT_SECRET=...
   JWT_SECRET=...
   APP_KEYS=...
   ```
2. Si vous avez copié `.env.example`, générez de nouveaux secrets :
   ```bash
   # Supprimer le .env et laisser Strapi le recréer
   rm .env
   npm run develop
   ```
   Strapi vous demandera de créer un nouveau compte admin.

### 3. Problème avec la base de données

**Symptôme** : La base de données n'est pas accessible ou corrompue.

**Solution** :
1. Vérifiez que `data.db` existe dans `strapi-cms/`
2. Vérifiez que `.env` contient : `DATABASE_FILENAME=./data.db`
3. Vérifiez les logs du serveur pour des erreurs de base de données

### 4. Problème de port/URL

**Symptôme** : Vous accédez à Strapi via une URL différente.

**Solution** :
- Assurez-vous d'accéder à `http://localhost:1337/admin`
- Pas `http://127.0.0.1:1337/admin` (sauf si configuré dans CORS)
- Vérifiez que le port 1337 n'est pas utilisé par un autre service

## ✅ Solutions rapides à essayer

### Solution 1 : Redémarrer Strapi
```bash
# Arrêter Strapi (Ctrl+C)
# Puis redémarrer
npm run develop
```

### Solution 2 : Vider le cache du navigateur
- Chrome/Edge : Ctrl+Shift+Delete → Cocher "Cookies" → Effacer
- Firefox : Ctrl+Shift+Delete → Cocher "Cookies" → Effacer
- Safari : Cmd+Option+E

### Solution 3 : Vérifier la console du navigateur
1. Ouvrez les **Outils de développement** (F12)
2. Allez dans l'onglet **Console**
3. Regardez les erreurs (rouges)
4. Allez dans l'onglet **Réseau** (Network)
5. Essayez de vous connecter
6. Regardez les requêtes vers `/admin/auth/local` ou `/admin/login`
7. Vérifiez la réponse (onglet Response)

### Solution 4 : Vérifier les logs du serveur
Regardez les logs dans le terminal où Strapi tourne. Cherchez :
- Des erreurs d'authentification
- Des erreurs de base de données
- Des erreurs CORS

### Solution 5 : Réinitialiser le mot de passe
Si vous utilisez un compte existant :
```bash
node scripts/reset-admin-password.js votre-email@example.com nouveau_mot_de_passe
```

### Solution 6 : Créer un nouveau compte
Si rien ne fonctionne, créez un nouveau compte admin directement dans Strapi.

## 🔍 Diagnostic approfondi

### Vérifier les requêtes réseau

1. Ouvrez les **Outils de développement** (F12)
2. Allez dans l'onglet **Réseau** (Network)
3. Filtrez par "XHR" ou "Fetch"
4. Essayez de vous connecter
5. Regardez la requête de login :
   - **URL** : `/admin/auth/local` ou `/admin/login`
   - **Méthode** : POST
   - **Status** : Doit être 200 (succès)
   - **Response** : Doit contenir un `jwt` token
   - **Headers** : Vérifiez `Set-Cookie` dans la réponse

### Vérifier les cookies

1. Ouvrez les **Outils de développement** (F12)
2. Allez dans **Application** → **Cookies** → `http://localhost:1337`
3. Après la connexion, vous devriez voir :
   - Un cookie de session
   - Un cookie JWT (si configuré)

### Vérifier la configuration

Vérifiez que `config/middlewares.ts` contient bien :
- `credentials: true` dans la config CORS
- Des origines spécifiques (pas `['*']`)

## 📝 Si rien ne fonctionne

1. **Créer un nouveau compte admin** directement dans Strapi
2. **Vérifier la version de Strapi** : `npm list @strapi/strapi`
3. **Vérifier la version de Node.js** : `node --version` (doit être >= 18)
4. **Consulter les logs complets** du serveur Strapi
5. **Tester avec un autre navigateur**

## 🆘 Aide supplémentaire

Si le problème persiste :
1. Notez les erreurs exactes dans la console du navigateur
2. Notez les erreurs dans les logs du serveur
3. Notez la version de Strapi et Node.js
4. Contactez l'équipe avec ces informations

