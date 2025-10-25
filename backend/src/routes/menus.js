const express = require('express');
const router = express.Router();

// Données du menu extérieur
const menuExterieur = {
  id: 'exterieur',
  nom: 'Menu Extérieur',
  categories: [
    {
      id: 'volailles',
      nom: 'VOLAILLES',
      plats: [
        { id: 'poulet-grille', nom: 'Poulet Grillé', prix: 9000, description: 'Poulet grillé à la perfection' },
        { id: 'poulet-braise', nom: 'Poulet braisé', prix: 9000, description: 'Poulet braisé aux épices locales' },
        { id: 'choukouya-poulet', nom: 'Choukouya de Poulet', prix: 9000, description: 'Spécialité grillée au feu de bois' },
        { id: 'poulet-diablo', nom: 'Poulet Diablo', prix: 10000, description: 'Poulet épicé selon notre recette secrète' },
        { id: 'pintade-braisee', nom: 'Pintade Braisée', prix: 12500, description: 'Pintade tendre braisée aux aromates' }
      ]
    },
    {
      id: 'porc',
      nom: 'PORC',
      plats: [
        { id: 'porc-braise', nom: 'Porc Braisé', prix: 9000, description: 'Porc braisé aux légumes' },
        { id: 'porc-grille', nom: 'Porc Grillé', prix: 9000, description: 'Porc grillé aux herbes fraîches' },
        { id: 'choukouya-porc', nom: 'Choukouya de Porc', prix: 9000, description: 'Porc grillé au feu de bois' },
        { id: 'porc-saute', nom: 'Porc Sauté', prix: 9000, description: 'Porc sauté aux légumes croquants' }
      ]
    },
    {
      id: 'mouton',
      nom: 'MOUTON',
      plats: [
        { id: 'choukouya-mouton', nom: 'Choukouya de Mouton', prix: 11000, description: 'Mouton grillé au feu de bois' }
      ]
    },
    {
      id: 'boeuf',
      nom: 'BŒUF',
      plats: [
        { id: 'entrecote-boeuf', nom: 'Entrecôte de Bœuf', prix: 16000, description: 'Entrecôte de bœuf tendre et juteuse' },
        { id: 'cote-boeuf', nom: 'Côte de Bœuf', prix: 20000, description: 'Côte de bœuf grillée à point' },
        { id: 'steak-filet-boeuf', nom: 'Steak de Filet de Bœuf', prix: 11000, description: 'Filet de bœuf fondant' },
        { id: 'brochettes-filet-boeuf', nom: 'Brochettes de Filet de Bœuf', prix: 11000, description: 'Brochettes de filet marinées' }
      ]
    },
    {
      id: 'lapin',
      nom: 'LAPIN',
      plats: [
        { id: 'lapin-braise', nom: 'Lapin braisé', prix: 13000, description: 'Lapin braisé aux petits légumes' },
        { id: 'lapin-moutarde', nom: 'Lapin à la Moutarde', prix: 13000, description: 'Lapin à la moutarde de Dijon' },
        { id: 'choukouya-lapin', nom: 'Choukouya de Lapin', prix: 13000, description: 'Lapin grillé au feu de bois' }
      ]
    },
    {
      id: 'poissons-fruits-mer',
      nom: 'POISSONS ET FRUITS DE MER',
      plats: [
        { id: 'sole-braisee-400', nom: 'Sole Braisée (400g)', prix: 10000, description: 'Sole fraîche braisée' },
        { id: 'sole-braisee-650', nom: 'Sole Braisée (650g)', prix: 15000, description: 'Sole fraîche braisée - grande portion' },
        { id: 'carpe-braisee-500', nom: 'Carpe Braisée (500g)', prix: 10000, description: 'Carpe fraîche braisée' },
        { id: 'carpe-braisee-800', nom: 'Carpe Braisée (800g)', prix: 15000, description: 'Carpe fraîche braisée - grande portion' },
        { id: 'gambas-tigrees', nom: 'Gambas Tigrées à la Plancha', prix: 19000, description: 'Gambas grillées à la plancha' }
      ]
    },
    {
      id: 'soupes',
      nom: 'SOUPES',
      plats: [
        { id: 'soupe-pintade', nom: 'Soupe de Pintade', prix: 13000, description: 'Soupe traditionnelle de pintade' },
        { id: 'soupe-pondeuse', nom: 'Soupe de Pondeuse', prix: 9500, description: 'Soupe de poule pondeuse' },
        { id: 'soupe-abats-mouton', nom: 'Soupe d\'Abats de Mouton', prix: 8000, description: 'Soupe traditionnelle d\'abats' }
      ]
    }
  ],
  formules: [
    {
      id: 'duo-planche-mix',
      nom: 'DUO PLANCHE MIX pour 2',
      prix: 34000,
      description: 'Choukouya de Poulet + Choukouya de Mouton ou Porc'
    },
    {
      id: 'team-planche-mix',
      nom: 'TEAM PLANCHE MIX pour 5',
      prix: 53000,
      description: 'Poulet braisé + Poulet Diablo + Choukouya de Mouton ou Porc + Pintade Braisée + Brochettes de Filet de Bœuf ou Saucisse'
    },
    {
      id: 'porc-lovers-mix',
      nom: 'PORC LOVERS MIX pour 2',
      prix: 18000,
      description: 'Choukouya de Porc + Porc Braisé + Porc Sauté + Porc Grillé'
    },
    {
      id: 'poulet-lovers-mix',
      nom: 'POULET LOVERS MIX pour 2',
      prix: 18000,
      description: 'Choukouya de Poulet + Poulet Braisé + Poulet Diablo + Poulet Grillé'
    }
  ],
  accompagnements: {
    nom: 'ACCOMPAGNEMENTS',
    prix: 2000,
    options: ['Alloco', 'Attiéké', 'Frites d\'igname', 'Frites de Pomme de Terre', 'Frites de Patate Douce', 'Riz']
  },
  desserts: [
    {
      id: 'sorbet-glaces',
      nom: 'SORBET & GLACES SUINI ICE',
      prix: 3500,
      description: '(Douceur en Sorbet)',
      options: ['Mangue', 'Corrosol', 'Coco', 'Dêguê', 'Chocolat']
    },
    {
      id: 'sorbet-alcohol',
      nom: 'SORBET SUINI ICE ALCOHOL',
      prix: 4000,
      description: '(Plaisir en Sorbet)',
      options: ['Baileys', 'Rhum']
    },
    {
      id: 'crepe-chocolat',
      nom: 'CRÊPE AU CHOCOLAT',
      prix: 3500,
      description: 'Crêpe maison au chocolat'
    }
  ]
};

// Données du menu intérieur
const menuInterieur = {
  id: 'interieur',
  nom: 'Menu Intérieur',
  categories: [
    {
      id: 'volailles',
      nom: 'VOLAILLES',
      plats: [
        { id: 'poulet-grille', nom: 'Poulet Grillé', prix: 11000, description: 'Poulet grillé à la perfection' },
        { id: 'poulet-braise', nom: 'Poulet braisé', prix: 11000, description: 'Poulet braisé aux épices locales' },
        { id: 'choukouya-poulet', nom: 'Choukouya de Poulet', prix: 11000, description: 'Spécialité grillée au feu de bois' },
        { id: 'poulet-diablo', nom: 'Poulet Diablo', prix: 12000, description: 'Poulet épicé selon notre recette secrète' },
        { id: 'pintade-braisee', nom: 'Pintade Braisée', prix: 15000, description: 'Pintade tendre braisée aux aromates' }
      ]
    },
    {
      id: 'porc',
      nom: 'PORC',
      plats: [
        { id: 'porc-braise', nom: 'Porc Braisé', prix: 11000, description: 'Porc braisé aux légumes' },
        { id: 'porc-grille', nom: 'Porc Grillé', prix: 11000, description: 'Porc grillé aux herbes fraîches' },
        { id: 'choukouya-porc', nom: 'Choukouya de Porc', prix: 11000, description: 'Porc grillé au feu de bois' },
        { id: 'porc-saute', nom: 'Porc Sauté', prix: 11000, description: 'Porc sauté aux légumes croquants' }
      ]
    },
    {
      id: 'mouton',
      nom: 'MOUTON',
      plats: [
        { id: 'choukouya-mouton', nom: 'Choukouya de Mouton', prix: 13500, description: 'Mouton grillé au feu de bois' }
      ]
    },
    {
      id: 'boeuf',
      nom: 'BŒUF',
      plats: [
        { id: 'entrecote-boeuf', nom: 'Entrecôte de Bœuf', prix: 18000, description: 'Entrecôte de bœuf tendre et juteuse' },
        { id: 'cote-boeuf', nom: 'Côte de Bœuf', prix: 24000, description: 'Côte de bœuf grillée à point' },
        { id: 'steak-filet-boeuf', nom: 'Steak de Filet de Bœuf', prix: 13000, description: 'Filet de bœuf fondant' },
        { id: 'brochettes-filet-boeuf', nom: 'Brochettes de Filet de Bœuf', prix: 13000, description: 'Brochettes de filet marinées' }
      ]
    },
    {
      id: 'lapin',
      nom: 'LAPIN',
      plats: [
        { id: 'lapin-braise', nom: 'Lapin braisé', prix: 15500, description: 'Lapin braisé aux petits légumes' },
        { id: 'lapin-moutarde', nom: 'Lapin à la Moutarde', prix: 15500, description: 'Lapin à la moutarde de Dijon' },
        { id: 'choukouya-lapin', nom: 'Choukouya de Lapin', prix: 15500, description: 'Lapin grillé au feu de bois' }
      ]
    },
    {
      id: 'poissons-fruits-mer',
      nom: 'POISSONS ET FRUITS DE MER',
      plats: [
        { id: 'sole-braisee-400', nom: 'Sole Braisée (400g)', prix: 12000, description: 'Sole fraîche braisée' },
        { id: 'sole-braisee-650', nom: 'Sole Braisée (650g)', prix: 17000, description: 'Sole fraîche braisée - grande portion' },
        { id: 'carpe-braisee-500', nom: 'Carpe Braisée (500g)', prix: 12000, description: 'Carpe fraîche braisée' },
        { id: 'carpe-braisee-800', nom: 'Carpe Braisée (800g)', prix: 17000, description: 'Carpe fraîche braisée - grande portion' },
        { id: 'gambas-tigrees', nom: 'Gambas Tigrées à la Plancha', prix: 23000, description: 'Gambas grillées à la plancha' },
        { id: 'attieke-poisson', nom: 'Attiéké-Poisson Frit', prix: null, description: '(selon arrivage et calibre)' }
      ]
    },
    {
      id: 'soupes',
      nom: 'SOUPES',
      plats: [
        { id: 'soupe-pintade', nom: 'Soupe de Pintade', prix: 15500, description: 'Soupe traditionnelle de pintade' },
        { id: 'soupe-pondeuse', nom: 'Soupe de Pondeuse', prix: 11500, description: 'Soupe de poule pondeuse' },
        { id: 'soupe-abats-mouton', nom: 'Soupe d\'Abats de Mouton', prix: 10000, description: 'Soupe traditionnelle d\'abats (sur réservation)' }
      ]
    }
  ],
  formules: [
    {
      id: 'duo-planche-mix',
      nom: 'FORMULE DUO PLANCHE MIX pour 2',
      prix: 41000,
      description: 'Choukouya de Poulet + Choukouya de Mouton ou Porc'
    },
    {
      id: 'team-planche-mix',
      nom: 'FORMULE TEAM PLANCHE MIX pour 5',
      prix: 64000,
      description: 'Poulet Braisé + Poulet Diablo + Choukouya de Mouton ou Porc + Pintade Braisée + Brochettes de Filet de Bœuf ou Saucisse'
    },
    {
      id: 'porc-lovers-mix',
      nom: 'PORC LOVERS MIX pour 2',
      prix: 22000,
      description: 'Choukouya de Porc + Porc Braisé + Porc Sauté + Porc Grillé'
    },
    {
      id: 'poulet-lovers-mix',
      nom: 'POULET LOVERS MIX pour 2',
      prix: 22000,
      description: 'Choukouya de Poulet + Poulet Braisé + Poulet Diablo + Poulet Grillé'
    }
  ],
  accompagnements: {
    nom: 'ACCOMPAGNEMENTS',
    prix: 2400,
    options: ['Alloco', 'Attiéké', 'Frites d\'Igname', 'Frites de Pomme de Terre', 'Frites de Patate Douce', 'Riz']
  },
  desserts: [
    {
      id: 'sorbet-glaces',
      nom: 'SORBET & GLACES SUINI ICE',
      prix: 3500,
      description: '(Douceur en Sorbet)',
      options: ['Mangue', 'Corrosol', 'Coco', 'Dêguê', 'Chocolat']
    },
    {
      id: 'sorbet-alcohol',
      nom: 'SORBET SUINI ICE ALCOHOL',
      prix: 4000,
      description: '(Plaisir en Sorbet)',
      options: ['Baileys', 'Rhum']
    },
    {
      id: 'crepe-chocolat',
      nom: 'CRÊPE AU CHOCOLAT',
      prix: 4000,
      description: 'Crêpe maison au chocolat'
    }
  ]
};

// Routes API

// GET /api/menus - Récupérer tous les menus
router.get('/', (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        menuInterieur,
        menuExterieur
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des menus',
      error: error.message
    });
  }
});

// GET /api/menus/interieur - Récupérer le menu intérieur
router.get('/interieur', (req, res) => {
  try {
    res.json({
      success: true,
      data: menuInterieur
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du menu intérieur',
      error: error.message
    });
  }
});

// GET /api/menus/exterieur - Récupérer le menu extérieur
router.get('/exterieur', (req, res) => {
  try {
    res.json({
      success: true,
      data: menuExterieur
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du menu extérieur',
      error: error.message
    });
  }
});

// GET /api/menus/:type/categories - Récupérer les catégories d'un menu
router.get('/:type/categories', (req, res) => {
  try {
    const { type } = req.params;
    const menu = type === 'interieur' ? menuInterieur : menuExterieur;
    
    if (!menu) {
      return res.status(404).json({
        success: false,
        message: 'Menu non trouvé'
      });
    }

    res.json({
      success: true,
      data: menu.categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des catégories',
      error: error.message
    });
  }
});

// GET /api/menus/:type/plats - Récupérer tous les plats d'un menu
router.get('/:type/plats', (req, res) => {
  try {
    const { type } = req.params;
    const menu = type === 'interieur' ? menuInterieur : menuExterieur;
    
    if (!menu) {
      return res.status(404).json({
        success: false,
        message: 'Menu non trouvé'
      });
    }

    // Extraire tous les plats de toutes les catégories
    const tousLesPlats = menu.categories.reduce((acc, categorie) => {
      return acc.concat(categorie.plats.map(plat => ({
        ...plat,
        categorie: categorie.nom
      })));
    }, []);

    res.json({
      success: true,
      data: tousLesPlats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des plats',
      error: error.message
    });
  }
});

// GET /api/menus/:type/formules - Récupérer les formules d'un menu
router.get('/:type/formules', (req, res) => {
  try {
    const { type } = req.params;
    const menu = type === 'interieur' ? menuInterieur : menuExterieur;
    
    if (!menu) {
      return res.status(404).json({
        success: false,
        message: 'Menu non trouvé'
      });
    }

    res.json({
      success: true,
      data: menu.formules
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des formules',
      error: error.message
    });
  }
});

module.exports = router;