const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Fonction pour générer un slug à partir d'un titre
function generateSlug(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
    .replace(/[^\w\s-]/g, '') // Supprimer les caractères spéciaux
    .replace(/\s+/g, '-') // Remplacer les espaces par des tirets
    .replace(/-+/g, '-') // Supprimer les tirets multiples
    .trim('-'); // Supprimer les tirets en début/fin
}

async function seedActualites() {
  try {
    console.log('🌱 Création des actualités de test...');

    // Vérifier si l'utilisateur admin existe, sinon le créer
    let adminUser = await prisma.utilisateur.findUnique({
      where: { email: 'admin@boucheriefine.com' }
    });

    if (!adminUser) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      adminUser = await prisma.utilisateur.create({
        data: {
          nom: 'Admin',
          prenom: 'Boucherie Fine',
          email: 'admin@boucheriefine.com',
          telephone: '+22507000001',
          motDePasse: hashedPassword,
          role: 'ADMIN'
        }
      });
      console.log('✅ Utilisateur admin créé');
    }

    const actualitesData = [
      {
        titre: 'Nouveau menu spécial Fêtes de fin d\'année',
        slug: generateSlug('Nouveau menu spécial Fêtes de fin d\'année'),
        extrait: 'Découvrez notre menu exclusif pour célébrer les fêtes de fin d\'année avec nos spécialités ivoiriennes revisitées.',
        contenu: `<h2>Un menu festif exceptionnel</h2><p>Nous sommes ravis de vous présenter notre nouveau menu spécial pour les fêtes de fin d'année ! Notre chef a créé une sélection unique de plats traditionnels ivoiriens revisités avec une touche moderne.</p><h3>Au menu :</h3><ul><li><strong>Kedjenou de pintade aux épices festives</strong> - Notre plat signature revisité pour les fêtes</li><li><strong>Attiéké doré aux crevettes géantes</strong> - Une fusion parfaite entre tradition et raffinement</li><li><strong>Mousse au chocolat ivoirien avec fruits tropicaux</strong> - Notre dessert signature</li></ul><p>Réservations recommandées du 20 décembre au 5 janvier. Profitez également de notre ambiance festive avec décoration traditionnelle et musique live le weekend.</p>`,
        categorie: 'Menu',
        imageUrl: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=800&h=600&fit=crop',
        datePublication: new Date('2024-12-15'),
        auteur: 'Chef Kouadio',
        vues: 45,
        actif: true
      },
      {
        titre: 'Ouverture du service livraison express',
        slug: generateSlug('Ouverture du service livraison express'),
        extrait: 'Commandez en ligne et recevez vos plats préférés en moins de 30 minutes dans toute la zone d\'Abidjan.',
        contenu: `<h2>Livraison express maintenant disponible !</h2><p>Grande nouvelle ! Nous lançons officiellement notre service de livraison express. Désormais, vous pouvez commander vos plats préférés en ligne et les recevoir chez vous en moins de 30 minutes.</p><h3>Détails du service :</h3><ul><li><strong>Zone de livraison :</strong> Riviera 3, Cocody, Marcory, Treichville, Adjamé et Yopougon</li><li><strong>Frais de livraison :</strong> 1000 FCFA</li><li><strong>Commande minimum :</strong> 5000 FCFA</li><li><strong>Horaires :</strong> 11h30 - 22h00, 7j/7</li></ul><p>Notre équipe de livreurs professionnels garantit la fraîcheur et la qualité de vos plats jusqu'à votre porte.</p>`,
        categorie: 'Service',
        imageUrl: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=800&h=600&fit=crop',
        datePublication: new Date('2024-12-10'),
        auteur: 'Direction',
        vues: 78,
        actif: true
      },
      {
        titre: 'Formation culinaire : Atelier Kedjenou',
        slug: generateSlug('Formation culinaire : Atelier Kedjenou'),
        extrait: 'Apprenez à préparer le fameux Kedjenou traditionnel lors de notre atelier culinaire mensuel.',
        contenu: `<h2>Apprenez les secrets du Kedjenou</h2><p>Rejoignez-nous pour notre atelier culinaire mensuel ! Ce mois-ci, notre chef vous apprendra les secrets du Kedjenou traditionnel, ce plat emblématique de la Côte d'Ivoire.</p><h3>Au programme :</h3><ul><li>Histoire et origine du Kedjenou</li><li>Choix des ingrédients et épices</li><li>Technique de cuisson dans la poterie</li><li>Dégustation et conseils du chef</li></ul><h3>Informations pratiques :</h3><ul><li><strong>Date :</strong> Samedi 23 décembre à 14h</li><li><strong>Durée :</strong> 3 heures</li><li><strong>Tarif :</strong> 15 000 FCFA par personne (repas inclus)</li><li><strong>Places limitées :</strong> 12 participants</li></ul>`,
        categorie: 'Événement',
        imageUrl: 'https://images.unsplash.com/photo-1556909114-d5b5ae80a0d5?w=800&h=600&fit=crop',
        datePublication: new Date('2024-12-08'),
        auteur: 'Chef Kouadio',
        vues: 23,
        actif: true
      },
      {
        titre: 'Partenariat avec les producteurs locaux',
        slug: generateSlug('Partenariat avec les producteurs locaux'),
        extrait: 'Nous renforçons notre engagement pour la qualité en nous associant directement avec les producteurs locaux.',
        contenu: `<h2>Soutenir l'économie locale</h2><p>Dans notre démarche de qualité et de soutien à l'économie locale, nous avons signé des partenariats exclusifs avec plusieurs producteurs locaux de Côte d'Ivoire.</p><h3>Nos nouveaux partenaires :</h3><ul><li><strong>Ferme bio de Yamoussoukro</strong> pour nos légumes frais</li><li><strong>Coopérative de pêcheurs de Grand-Bassam</strong> pour nos poissons</li><li><strong>Producteurs de riz de Bouaké</strong> pour notre riz local</li><li><strong>Éleveurs de volaille de Korhogo</strong> pour nos viandes</li></ul><p>Cette démarche nous permet de garantir la fraîcheur de nos produits tout en soutenant nos agriculteurs et pêcheurs locaux. Une démarche gagnant-gagnant pour tous !</p>`,
        categorie: 'Partenariat',
        imageUrl: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=800&h=600&fit=crop',
        datePublication: new Date('2024-12-05'),
        auteur: 'Direction',
        vues: 67,
        actif: true
      },
      {
        titre: 'Nouvelle décoration inspirée de l\'art baoulé',
        slug: generateSlug('Nouvelle décoration inspirée de l\'art baoulé'),
        extrait: 'Découvrez notre nouvelle décoration intérieure qui met à l\'honneur l\'art traditionnel baoulé.',
        contenu: `<h2>Une ambiance authentiquement ivoirienne</h2><p>Nous avons le plaisir de vous dévoiler notre nouvelle décoration intérieure, fruit d'une collaboration avec des artisans baoulés de la région de Bouaké.</p><h3>Nouveautés :</h3><ul><li><strong>Sculptures en bois précieux</strong> dans l'espace d'accueil</li><li><strong>Tissus kente authentiques</strong> pour les nappes</li><li><strong>Masques traditionnels</strong> exposés dans la salle</li><li><strong>Poteries décoratives de Katiola</strong></li></ul><p>Cette ambiance authentique vous plonge encore plus dans la culture ivoirienne tout en dégustant nos spécialités. Une expérience complète pour tous vos sens !</p>`,
        categorie: 'Décoration',
        imageUrl: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?w=800&h=600&fit=crop',
        datePublication: new Date('2024-12-01'),
        auteur: 'Équipe Design',
        vues: 34,
        actif: true
      }
    ];

    // Supprimer les anciennes actualités de test si elles existent
    await prisma.actualite.deleteMany({
      where: {
        titre: {
          in: actualitesData.map(a => a.titre)
        }
      }
    });

    // Créer les nouvelles actualités
    for (const actualiteData of actualitesData) {
      await prisma.actualite.create({
        data: actualiteData
      });
    }

    console.log(`✅ ${actualitesData.length} actualités créées avec succès !`);

  } catch (error) {
    console.error('❌ Erreur lors de la création des actualités:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
seedActualites();