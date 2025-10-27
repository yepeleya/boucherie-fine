const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('🔍 Vérification des utilisateurs...');
    
    const users = await prisma.utilisateur.findMany({
      select: {
        id: true,
        nom: true,
        email: true,
        reservations: {
          select: {
            id: true,
            numero: true,
            date: true,
            heure: true,
            nbPersonnes: true
          }
        }
      }
    });
    
    console.log('👥 Utilisateurs trouvés:', users.length);
    
    users.forEach(user => {
      console.log(`\n📍 Utilisateur ID: ${user.id}`);
      console.log(`   Nom: ${user.nom}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Réservations: ${user.reservations.length}`);
      
      user.reservations.forEach(res => {
        console.log(`     - ${res.numero} (${res.date.toLocaleDateString()} ${res.heure}) - ${res.nbPersonnes} pers.`);
      });
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();