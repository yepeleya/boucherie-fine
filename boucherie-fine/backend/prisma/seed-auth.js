const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seeding pour l\'authentification...');

  try {
    // Supprimer seulement les utilisateurs existants
    await prisma.utilisateur.deleteMany();
    console.log('🗑️  Utilisateurs existants supprimés');
  } catch (error) {
    console.log('ℹ️  Pas d\'utilisateurs existants à supprimer');
  }

  // Créer l'utilisateur admin
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.utilisateur.create({
    data: {
      nom: 'Administrateur',
      prenom: 'Système',
      email: 'admin@boucheriefine.ci',
      motDePasse: adminPassword,
      telephone: '0544544735',
      adresse: 'Riviera 3, Abidjan',
      role: 'ADMIN'
    }
  });

  console.log('✅ Administrateur créé:', admin.email);

  // Créer quelques clients de test
  const clientPassword = await bcrypt.hash('client123', 12);
  
  const client1 = await prisma.utilisateur.create({
    data: {
      nom: 'Kouassi',
      prenom: 'Ama',
      email: 'ama.kouassi@email.com',
      motDePasse: clientPassword,
      telephone: '0787654321',
      adresse: 'Cocody, Abidjan',
      role: 'CLIENT'
    }
  });

  const client2 = await prisma.utilisateur.create({
    data: {
      nom: 'Diallo',
      prenom: 'Fatou',
      email: 'fatou.diallo@email.com',
      motDePasse: clientPassword,
      telephone: '0512345678',
      adresse: 'Marcory, Abidjan',
      role: 'CLIENT'
    }
  });

  console.log('✅ Clients créés:', [client1.email, client2.email]);

  console.log('\n🎉 Seeding terminé avec succès !');
  console.log('\n📋 Comptes de test créés :');
  console.log('👑 Admin: admin@boucheriefine.ci (mot de passe: admin123)');
  console.log('👤 Client 1: ama.kouassi@email.com (mot de passe: client123)');
  console.log('👤 Client 2: fatou.diallo@email.com (mot de passe: client123)');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });