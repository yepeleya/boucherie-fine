const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seeding...');

  // Nettoyer les données existantes
  await prisma.commandeProduit.deleteMany();
  await prisma.paiement.deleteMany();
  await prisma.commande.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.produit.deleteMany();
  await prisma.categorie.deleteMany();
  await prisma.actualite.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.utilisateur.deleteMany();

  console.log('🗑️  Données existantes supprimées');

  // Créer l'utilisateur admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.utilisateur.create({
    data: {
      nom: 'Administrateur',
      prenom: 'La Boucherie Fine',
      email: 'admin@boucheriefine.com',
      motDePasse: adminPassword,
      role: 'ADMIN'
    }
  });

  console.log('👤 Administrateur créé:', admin.email);

  // Créer quelques clients de test
  const clientPassword = await bcrypt.hash('client123', 10);
  const clients = await Promise.all([
    prisma.utilisateur.create({
      data: {
        nom: 'Dupont',
        prenom: 'Jean',
        email: 'jean.dupont@email.com',
        motDePasse: clientPassword,
        role: 'CLIENT'
      }
    }),
    prisma.utilisateur.create({
      data: {
        nom: 'Martin',
        prenom: 'Marie',
        email: 'marie.martin@email.com',
        motDePasse: clientPassword,
        role: 'CLIENT'
      }
    })
  ]);

  console.log('👥 Clients créés:', clients.length);

  // Créer les catégories
  const categories = await Promise.all([
    prisma.categorie.create({
      data: {
        nom: 'Viandes Bovines',
        description: 'Sélection de viandes bovines de qualité premium',
        ordre: 1
      }
    }),
    prisma.categorie.create({
      data: {
        nom: 'Viandes Porcines',
        description: 'Cochon fermier et spécialités de porc',
        ordre: 2
      }
    }),
    prisma.categorie.create({
      data: {
        nom: 'Volailles',
        description: 'Poulets, canards et autres volailles fraîches',
        ordre: 3
      }
    }),
    prisma.categorie.create({
      data: {
        nom: 'Agneau & Mouton',
        description: 'Viandes d\'agneau et de mouton tendres',
        ordre: 4
      }
    }),
    prisma.categorie.create({
      data: {
        nom: 'Charcuterie',
        description: 'Saucissons, pâtés et spécialités maison',
        ordre: 5
      }
    }),
    prisma.categorie.create({
      data: {
        nom: 'Plats Préparés',
        description: 'Plats cuisinés prêts à réchauffer',
        ordre: 6
      }
    })
  ]);

  console.log('📂 Catégories créées:', categories.length);

  // Créer les produits
  const produits = await Promise.all([
    // Viandes Bovines
    prisma.produit.create({
      data: {
        nom: 'Entrecôte de Bœuf',
        description: 'Entrecôte de bœuf maturée 21 jours, origine France',
        prix: 28.50,
        stock: 15,
        poids: 0.3,
        unite: 'kg',
        categorieId: categories[0].id
      }
    }),
    prisma.produit.create({
      data: {
        nom: 'Filet de Bœuf',
        description: 'Filet de bœuf premium, tendre et savoureux',
        prix: 45.00,
        stock: 8,
        poids: 0.4,
        unite: 'kg',
        categorieId: categories[0].id
      }
    }),
    prisma.produit.create({
      data: {
        nom: 'Côte de Bœuf',
        description: 'Côte de bœuf pour 4-6 personnes, parfaite pour les grillades',
        prix: 35.00,
        stock: 5,
        poids: 1.2,
        unite: 'kg',
        categorieId: categories[0].id
      }
    }),

    // Viandes Porcines
    prisma.produit.create({
      data: {
        nom: 'Côtelettes de Porc',
        description: 'Côtelettes de porc fermier, élevé au grain',
        prix: 16.80,
        stock: 20,
        poids: 0.2,
        unite: 'kg',
        categorieId: categories[1].id
      }
    }),
    prisma.produit.create({
      data: {
        nom: 'Rôti de Porc',
        description: 'Rôti de porc dans l\'échine, idéal pour dimanche',
        prix: 14.90,
        stock: 12,
        poids: 0.8,
        unite: 'kg',
        categorieId: categories[1].id
      }
    }),

    // Volailles
    prisma.produit.create({
      data: {
        nom: 'Poulet Fermier Entier',
        description: 'Poulet fermier Label Rouge élevé en plein air',
        prix: 12.50,
        stock: 25,
        poids: 1.5,
        unite: 'kg',
        categorieId: categories[2].id
      }
    }),
    prisma.produit.create({
      data: {
        nom: 'Cuisses de Canard',
        description: 'Cuisses de canard confites, spécialité maison',
        prix: 18.00,
        stock: 10,
        poids: 0.4,
        unite: 'kg',
        categorieId: categories[2].id
      }
    }),

    // Agneau & Mouton
    prisma.produit.create({
      data: {
        nom: 'Côtelettes d\'Agneau',
        description: 'Côtelettes d\'agneau de lait des Pyrénées',
        prix: 32.00,
        stock: 15,
        poids: 0.25,
        unite: 'kg',
        categorieId: categories[3].id
      }
    }),
    prisma.produit.create({
      data: {
        nom: 'Gigot d\'Agneau',
        description: 'Gigot d\'agneau parfait pour les grandes occasions',
        prix: 26.50,
        stock: 6,
        poids: 2.0,
        unite: 'kg',
        categorieId: categories[3].id
      }
    }),

    // Charcuterie
    prisma.produit.create({
      data: {
        nom: 'Saucisson Sec Artisanal',
        description: 'Saucisson sec fabriqué selon la tradition',
        prix: 24.00,
        stock: 30,
        poids: 0.3,
        unite: 'kg',
        categorieId: categories[4].id
      }
    }),
    prisma.produit.create({
      data: {
        nom: 'Pâté de Campagne',
        description: 'Pâté de campagne maison aux herbes de Provence',
        prix: 8.50,
        stock: 15,
        poids: 0.2,
        unite: 'kg',
        categorieId: categories[4].id
      }
    }),

    // Plats Préparés
    prisma.produit.create({
      data: {
        nom: 'Bœuf Bourguignon',
        description: 'Bœuf bourguignon mijoté 3h, pour 2 personnes',
        prix: 15.00,
        stock: 8,
        poids: 0.5,
        unite: 'kg',
        categorieId: categories[5].id
      }
    }),
    prisma.produit.create({
      data: {
        nom: 'Cassoulet Maison',
        description: 'Cassoulet traditionnel aux haricots de Tarbes',
        prix: 12.00,
        stock: 10,
        poids: 0.6,
        unite: 'kg',
        categorieId: categories[5].id
      }
    })
  ]);

  console.log('🥩 Produits créés:', produits.length);

  // Créer quelques actualités
  const actualites = await Promise.all([
    prisma.actualite.create({
      data: {
        titre: 'Nouvelle sélection de viandes d\'automne',
        slug: 'nouvelle-selection-viandes-automne',
        extrait: 'Découvrez notre nouvelle collection de viandes de saison sélectionnées avec soin par nos maîtres bouchers.',
        contenu: '<p>Cette saison, La Boucherie Fine vous propose une sélection exceptionnelle de viandes d\'automne. Nos maîtres bouchers ont sélectionné pour vous les meilleures pièces de la région, issues d\'élevages respectueux du bien-être animal.</p><p>Au menu de cette nouvelle collection : côte de bœuf maturée 28 jours, agneau de pré-salé, cochon noir de Bigorre, et bien d\'autres délices qui raviront vos papilles.</p>',
        categorie: 'Nouveautés',
        auteur: 'Chef Boucher - La Boucherie Fine',
        imageUrl: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?q=80&w=1000&auto=format&fit=crop'
      }
    }),
    prisma.actualite.create({
      data: {
        titre: 'Promotion exceptionnelle sur les volailles fermières',
        slug: 'promotion-volailles-fermieres',
        extrait: 'Profitez de -20% sur toutes nos volailles fermières jusqu\'à dimanche prochain. Une opportunité à ne pas manquer !',
        contenu: '<p>Cette semaine, bénéficiez d\'une réduction exceptionnelle de 20% sur toute notre gamme de volailles fermières. Une occasion unique de découvrir la qualité exceptionnelle de nos produits.</p><p>Nos volailles sont élevées en plein air dans des fermes partenaires de la région, garantissant une chair tendre et savoureuse. Poulets de Bresse, canards du Périgord, pintades fermières... Tous nos produits sont certifiés Label Rouge.</p><p>Offre valable du mardi au dimanche en magasin et sur commande.</p>',
        categorie: 'Promotions',
        auteur: 'Équipe Commerciale - La Boucherie Fine',
        imageUrl: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?q=80&w=1000&auto=format&fit=crop'
      }
    }),
    prisma.actualite.create({
      data: {
        titre: 'Lancement de notre service traiteur haut de gamme',
        slug: 'lancement-service-traiteur',
        extrait: 'La Boucherie Fine étend ses services avec un nouveau service traiteur pour vos événements et réceptions.',
        contenu: '<p>Nous sommes fiers d\'annoncer l\'ouverture de notre service traiteur ! Forte de son expertise en matière de viandes d\'exception, La Boucherie Fine propose désormais des plateaux raffinés pour vos événements.</p><p>Notre chef et nos maîtres bouchers ont élaboré une gamme complète : plateaux de charcuteries artisanales, terrines maison, rôtis tranchés, et nos célèbres préparations signature.</p><p>Que ce soit pour un événement professionnel, une réception familiale ou un apéritif entre amis, nous mettons notre savoir-faire à votre service.</p><p>Commandes à effectuer 48h à l\'avance. Devis gratuit sur demande.</p>',
        categorie: 'Services',
        auteur: 'Direction - La Boucherie Fine',
        imageUrl: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?q=80&w=1000&auto=format&fit=crop'
      }
    }),
    prisma.actualite.create({
      data: {
        titre: 'Nouveau menu spécial fêtes de fin d\'année',
        slug: 'nouveau-menu-special-fetes-de-fin-dannee',
        extrait: 'Préparez dès maintenant vos repas de fête avec notre sélection premium : foie gras, chapons, dinde aux marrons...',
        contenu: '<p>Les fêtes approchent et La Boucherie Fine vous dévoile sa sélection premium pour des repas inoubliables !</p><p>Notre menu spécial fêtes comprend :<br/>• Foie gras du Sud-Ouest<br/>• Chapons fermiers<br/>• Dindes fermières aux marrons<br/>• Saumons fumés artisanalement<br/>• Plateaux d\'huîtres de Belon<br/>• Bûches glacées maison</p><p>Nos produits sont disponibles sur commande uniquement, pour garantir la fraîcheur et la qualité. Pensez à réserver dès maintenant pour être sûr de ne pas être déçu !</p><p>Commandes ouvertes jusqu\'au 20 décembre. Retrait du 23 au 31 décembre.</p>',
        categorie: 'Événements',
        auteur: 'Chef Boucher - La Boucherie Fine',
        imageUrl: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?q=80&w=1000&auto=format&fit=crop'
      }
    })
  ]);

  console.log('📰 Actualités créées:', actualites.length);

  // Créer quelques commandes de démonstration
  const commande1 = await prisma.commande.create({
    data: {
      utilisateurId: clients[0].id,
      statut: 'CONFIRMEE',
      total: 57.00,
      notes: 'Livraison demain matin'
    }
  });

  await Promise.all([
    prisma.commandeProduit.create({
      data: {
        commandeId: commande1.id,
        produitId: produits[0].id, // Entrecôte
        quantite: 2,
        prixUnitaire: 28.50
      }
    })
  ]);

  const commande2 = await prisma.commande.create({
    data: {
      utilisateurId: clients[1].id,
      statut: 'EN_COURS',
      total: 25.00
    }
  });

  await Promise.all([
    prisma.commandeProduit.create({
      data: {
        commandeId: commande2.id,
        produitId: produits[5].id, // Poulet fermier
        quantite: 2,
        prixUnitaire: 12.50
      }
    })
  ]);

  console.log('🛒 Commandes de démonstration créées');

  // Créer quelques réservations
  const reservations = await Promise.all([
    prisma.reservation.create({
      data: {
        utilisateurId: clients[0].id,
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Dans 3 jours
        heure: '19:30',
        nbPersonnes: 4,
        salle: 'Salle principale',
        telephone: '0123456789',
        commentaires: 'Table près de la fenêtre si possible',
        statut: 'CONFIRMEE'
      }
    }),
    prisma.reservation.create({
      data: {
        utilisateurId: clients[1].id,
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Dans 7 jours
        heure: '20:00',
        nbPersonnes: 2,
        salle: 'Salon privé',
        telephone: '0987654321',
        statut: 'EN_ATTENTE'
      }
    })
  ]);

  console.log('📅 Réservations créées:', reservations.length);

  // Créer quelques notifications
  const notifications = await Promise.all([
    prisma.notification.create({
      data: {
        type: 'commande',
        titre: 'Nouvelle commande',
        message: `Nouvelle commande #${commande1.numero} de ${clients[0].nom}`,
        donnees: JSON.stringify({ commandeId: commande1.id, montant: 57.00 })
      }
    }),
    prisma.notification.create({
      data: {
        type: 'reservation',
        titre: 'Nouvelle réservation',
        message: `Nouvelle réservation de ${clients[0].nom} pour 4 personnes`,
        donnees: JSON.stringify({ reservationId: reservations[0].id, nbPersonnes: 4 })
      }
    })
  ]);

  console.log('🔔 Notifications créées:', notifications.length);

  console.log('✅ Seeding terminé avec succès !');
  console.log('');
  console.log('📊 Résumé:');
  console.log(`   👤 Utilisateurs: ${1 + clients.length} (1 admin + ${clients.length} clients)`);
  console.log(`   📂 Catégories: ${categories.length}`);
  console.log(`   🥩 Produits: ${produits.length}`);
  console.log(`   📰 Actualités: ${actualites.length}`);
  console.log(`   🛒 Commandes: 2`);
  console.log(`   📅 Réservations: ${reservations.length}`);
  console.log(`   🔔 Notifications: ${notifications.length}`);
  console.log('');
  console.log('🔑 Identifiants admin:');
  console.log('   Email: admin@boucheriefine.com');
  console.log('   Mot de passe: admin123');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });