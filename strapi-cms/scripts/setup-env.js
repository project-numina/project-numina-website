#!/usr/bin/env node

/**
 * Script d'initialisation de l'environnement Strapi
 * Génère automatiquement un fichier .env avec des secrets aléatoires
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function generateSecret(length = 64) {
  return crypto.randomBytes(length).toString('base64');
}

function generateAppKeys() {
  // Strapi nécessite au moins 4 clés
  return Array.from({ length: 4 }, () => generateSecret(32)).join(',');
}

function setupEnv() {
  const envPath = path.join(__dirname, '..', '.env');

  // Vérifier si .env existe déjà
  if (fs.existsSync(envPath)) {
    console.log('⚠️  Le fichier .env existe déjà.');
    console.log('   Si vous voulez le régénérer, supprimez-le d\'abord : rm .env\n');
    return;
  }

  // Générer les secrets
  console.log('🔐 Génération des secrets...\n');

  const secrets = {
    APP_KEYS: generateAppKeys(),
    ADMIN_JWT_SECRET: generateSecret(),
    JWT_SECRET: generateSecret(),
    API_TOKEN_SALT: generateSecret(),
    TRANSFER_TOKEN_SALT: generateSecret(),
    ENCRYPTION_KEY: generateSecret(),
  };

  // Créer le contenu du fichier .env
  const envContent = `# Configuration Strapi - Project Numina
# Généré automatiquement par setup-env.js
# ⚠️  Ne commitez JAMAIS ce fichier dans Git !

# ============================================
# SECRETS OBLIGATOIRES
# ============================================
APP_KEYS=${secrets.APP_KEYS}
ADMIN_JWT_SECRET=${secrets.ADMIN_JWT_SECRET}
JWT_SECRET=${secrets.JWT_SECRET}
API_TOKEN_SALT=${secrets.API_TOKEN_SALT}
TRANSFER_TOKEN_SALT=${secrets.TRANSFER_TOKEN_SALT}
ENCRYPTION_KEY=${secrets.ENCRYPTION_KEY}

# ============================================
# BASE DE DONNÉES
# ============================================
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=./data.db

# ============================================
# SERVEUR
# ============================================
HOST=0.0.0.0
PORT=1337
NODE_ENV=development

# ============================================
# OPTIONS DE MIGRATION (optionnel)
# ============================================
# Décommentez pour activer la migration automatique au démarrage
# MIGRATE_ON_BOOT=1
# MIGRATE_FORCE=1
`;

  // Écrire le fichier .env
  fs.writeFileSync(envPath, envContent, 'utf8');

  console.log('✅ Fichier .env créé avec succès !\n');
  console.log('📝 Secrets générés :');
  Object.keys(secrets).forEach(key => {
    console.log(`   ✓ ${key}`);
  });
  console.log('\n🚀 Vous pouvez maintenant démarrer Strapi avec : npm run develop\n');
  console.log('⚠️  NOTE IMPORTANTE :');
  console.log('   Si vous avez une base de données existante (data.db) avec des comptes admin,');
  console.log('   vous devrez soit :');
  console.log('   1. Créer un nouveau compte admin dans Strapi');
  console.log('   2. Ou réinitialiser le mot de passe d\'un compte existant avec :');
  console.log('      node scripts/reset-admin-password.js email@example.com nouveau_mot_de_passe\n');
}

try {
  setupEnv();
} catch (error) {
  console.error('❌ Erreur lors de la création du fichier .env :', error.message);
  process.exit(1);
}

