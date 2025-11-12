# Migration scripts

## Prérequis
- Démarrer Strapi: `npm run develop`
- Créer un API Token (Full access) et l’exporter:

```
export STRAPI_URL=http://localhost:1337
export STRAPI_TOKEN=xxxxx
```

## Ordre d’exécution
```
node scripts/seed-tags.js
node scripts/migrate-members.js
node scripts/migrate-projects.js
node scripts/migrate-articles.js
node scripts/migrate-community-photos.js
```

Les scripts sont idempotents (upsert par slug ou titre) et ré-uploadent les médias si fournis.

