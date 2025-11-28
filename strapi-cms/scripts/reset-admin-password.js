const sqlite3 = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

function resetAdminPassword() {
  const dbPath = path.join(__dirname, '..', 'data.db');
  const db = sqlite3(dbPath);
  
  // Récupérer tous les admins
  const admins = db.prepare('SELECT id, email, username FROM admin_users').all();
  
  console.log('\n📋 Utilisateurs admin trouvés :');
  admins.forEach(admin => {
    console.log(`  - ID: ${admin.id}, Email: ${admin.email}, Username: ${admin.username || 'N/A'}`);
  });
  
  // Demander quel admin réinitialiser (par défaut le premier)
  const emailToReset = process.argv[2] || admins[0]?.email;
  
  if (!emailToReset) {
    console.error('❌ Aucun utilisateur admin trouvé');
    db.close();
    process.exit(1);
  }
  
  const admin = admins.find(a => a.email === emailToReset);
  
  if (!admin) {
    console.error(`❌ Utilisateur avec l'email ${emailToReset} non trouvé`);
    db.close();
    process.exit(1);
  }
  
  // Nouveau mot de passe (par défaut "admin123" ou depuis l'argument)
  const newPassword = process.argv[3] || 'admin123';
  
  // Hasher le nouveau mot de passe (Strapi utilise bcrypt avec 10 rounds)
  const hashedPassword = bcrypt.hashSync(newPassword, 10);
  
  // Mettre à jour le mot de passe dans la base de données
  const update = db.prepare('UPDATE admin_users SET password = ? WHERE id = ?');
  update.run(hashedPassword, admin.id);
  
  console.log(`\n✅ Mot de passe réinitialisé pour ${emailToReset}`);
  console.log(`   Nouveau mot de passe: ${newPassword}`);
  console.log(`\n⚠️  N'oubliez pas de changer ce mot de passe après la première connexion !\n`);
  
  db.close();
}

try {
  resetAdminPassword();
} catch (error) {
  console.error('❌ Erreur:', error);
  process.exit(1);
}

