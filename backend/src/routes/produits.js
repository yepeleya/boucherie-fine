const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, authorizeRole } = require('../middlewares/auth');
const { upload } = require('../middlewares/upload');
const { body, param, query, validationResult } = require('express-validator');

const prisma = new PrismaClient();
const router = express.Router();

// ✅ Lister tous les produits avec filtres et pagination
router.get('/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page doit être un entier positif'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limite doit être entre 1 et 100'),
    query('categorieId').optional().isInt().withMessage('ID catégorie invalide'),
    query('disponible').optional().isBoolean().withMessage('Disponible doit être un booléen'),
    query('prixMin').optional().isFloat({ min: 0 }).withMessage('Prix minimum invalide'),
    query('prixMax').optional().isFloat({ min: 0 }).withMessage('Prix maximum invalide'),
    query('search').optional().isLength({ min: 1, max: 100 }).withMessage('Recherche doit faire entre 1 et 100 caractères')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Paramètres de requête invalides",
        details: errors.array(),
        code: "VALIDATION_ERROR"
      });
    }

    const {
      page = 1,
      limit = 12,
      categorieId = '',
      disponible = '',
      prixMin = '',
      prixMax = '',
      search = '',
      sortBy = 'nom',
      sortOrder = 'asc'
    } = req.query;

    try {
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Construire les filtres
      const where = {};
      
      if (categorieId) {
        where.categorieId = parseInt(categorieId);
      }

      if (disponible !== '') {
        where.disponible = disponible === 'true';
      }

      if (prixMin || prixMax) {
        where.prix = {};
        if (prixMin) where.prix.gte = parseFloat(prixMin);
        if (prixMax) where.prix.lte = parseFloat(prixMax);
      }

      if (search) {
        where.OR = [
          { nom: { contains: search } },
          { description: { contains: search } },
          { categorie: { nom: { contains: search } } }
        ];
      }

      // Options de tri
      const orderBy = {};
      const validSortFields = ['nom', 'prix', 'dateCreation', 'stock'];
      const sortField = validSortFields.includes(sortBy) ? sortBy : 'nom';
      orderBy[sortField] = sortOrder === 'desc' ? 'desc' : 'asc';

      // Récupérer les produits avec pagination
      const [produits, total] = await Promise.all([
        prisma.produit.findMany({
          where,
          include: {
            categorie: {
              select: {
                id: true,
                nom: true,
                description: true
              }
            }
          },
          skip,
          take: parseInt(limit),
          orderBy
        }),
        prisma.produit.count({ where })
      ]);

      res.json({
        produits,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Erreur récupération produits:', error);
      res.status(500).json({
        error: "Erreur interne du serveur",
        code: "INTERNAL_ERROR"
      });
    }
  }
);

// ✅ Récupérer un produit par ID
router.get('/:id',
  [param('id').isInt().withMessage('ID invalide')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "ID invalide",
        details: errors.array(),
        code: "VALIDATION_ERROR"
      });
    }

    try {
      const produit = await prisma.produit.findUnique({
        where: { id: parseInt(req.params.id) },
        include: {
          categorie: {
            select: {
              id: true,
              nom: true,
              description: true
            }
          }
        }
      });

      if (!produit) {
        return res.status(404).json({
          error: "Produit non trouvé",
          code: "PRODUCT_NOT_FOUND"
        });
      }

      res.json(produit);
    } catch (error) {
      console.error('Erreur récupération produit:', error);
      res.status(500).json({
        error: "Erreur interne du serveur",
        code: "INTERNAL_ERROR"
      });
    }
  }
);

// ✅ Créer un nouveau produit (admin seulement)
router.post('/',
  authenticateToken,
  authorizeRole('ADMIN'),
  upload.single('image'),
  [
    body('nom').isLength({ min: 1, max: 100 }).withMessage('Nom requis (1-100 caractères)'),
    body('description').isLength({ min: 1, max: 1000 }).withMessage('Description requise (1-1000 caractères)'),
    body('prix').isFloat({ min: 0 }).withMessage('Prix invalide'),
    body('stock').isInt({ min: 0 }).withMessage('Stock invalide'),
    body('categorieId').isInt().withMessage('ID catégorie invalide'),
    body('disponible').optional().isBoolean().withMessage('Disponible doit être un booléen'),
    body('ingredients').optional().isLength({ max: 500 }).withMessage('Ingrédients trop longs'),
    body('allergenes').optional().isLength({ max: 500 }).withMessage('Allergènes trop longs'),
    body('valeurNutritionnelle').optional().isLength({ max: 1000 }).withMessage('Valeur nutritionnelle trop longue')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Données invalides",
        details: errors.array(),
        code: "VALIDATION_ERROR"
      });
    }

    const {
      nom,
      description,
      prix,
      stock,
      categorieId,
      disponible = true,
      ingredients = '',
      allergenes = '',
      valeurNutritionnelle = ''
    } = req.body;

    try {
      // Vérifier que la catégorie existe
      const categorie = await prisma.categorie.findUnique({
        where: { id: parseInt(categorieId) }
      });

      if (!categorie) {
        return res.status(400).json({
          error: "Catégorie non trouvée",
          code: "CATEGORY_NOT_FOUND"
        });
      }

      // Données du produit
      const produitData = {
        nom,
        description,
        prix: parseFloat(prix),
        stock: parseInt(stock),
        categorieId: parseInt(categorieId),
        disponible: disponible === 'true',
        ingredients,
        allergenes,
        valeurNutritionnelle
      };

      // Ajouter l'image si uploadée
      if (req.file && req.file.cloudinary) {
        produitData.imageUrl = req.file.cloudinary.secure_url;
        produitData.imagePublicId = req.file.cloudinary.public_id;
      }

      // Créer le produit
      const produit = await prisma.produit.create({
        data: produitData,
        include: {
          categorie: {
            select: {
              id: true,
              nom: true,
              description: true
            }
          }
        }
      });

      res.status(201).json({
        success: true,
        message: "Produit créé avec succès",
        produit
      });
    } catch (error) {
      console.error('Erreur création produit:', error);
      res.status(500).json({
        error: "Erreur interne du serveur",
        code: "INTERNAL_ERROR"
      });
    }
  }
);

// ✅ Modifier un produit (admin seulement)
router.put('/:id',
  authenticateToken,
  authorizeRole('ADMIN'),
  upload.single('image'),
  [
    param('id').isInt().withMessage('ID invalide'),
    body('nom').optional().isLength({ min: 1, max: 100 }).withMessage('Nom invalide (1-100 caractères)'),
    body('description').optional().isLength({ min: 1, max: 1000 }).withMessage('Description invalide (1-1000 caractères)'),
    body('prix').optional().isFloat({ min: 0 }).withMessage('Prix invalide'),
    body('stock').optional().isInt({ min: 0 }).withMessage('Stock invalide'),
    body('categorieId').optional().isInt().withMessage('ID catégorie invalide'),
    body('disponible').optional().isBoolean().withMessage('Disponible doit être un booléen'),
    body('ingredients').optional().isLength({ max: 500 }).withMessage('Ingrédients trop longs'),
    body('allergenes').optional().isLength({ max: 500 }).withMessage('Allergènes trop longs'),
    body('valeurNutritionnelle').optional().isLength({ max: 1000 }).withMessage('Valeur nutritionnelle trop longue')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Données invalides",
        details: errors.array(),
        code: "VALIDATION_ERROR"
      });
    }

    try {
      // Vérifier que le produit existe
      const produitExistant = await prisma.produit.findUnique({
        where: { id: parseInt(req.params.id) }
      });

      if (!produitExistant) {
        return res.status(404).json({
          error: "Produit non trouvé",
          code: "PRODUCT_NOT_FOUND"
        });
      }

      // Préparer les données de mise à jour
      const updateData = {};
      const allowedFields = [
        'nom', 'description', 'prix', 'stock', 'categorieId',
        'disponible', 'ingredients', 'allergenes', 'valeurNutritionnelle'
      ];

      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          if (field === 'prix') {
            updateData[field] = parseFloat(req.body[field]);
          } else if (field === 'stock' || field === 'categorieId') {
            updateData[field] = parseInt(req.body[field]);
          } else if (field === 'disponible') {
            updateData[field] = req.body[field] === 'true';
          } else {
            updateData[field] = req.body[field];
          }
        }
      });

      // Vérifier la catégorie si changée
      if (updateData.categorieId) {
        const categorie = await prisma.categorie.findUnique({
          where: { id: updateData.categorieId }
        });

        if (!categorie) {
          return res.status(400).json({
            error: "Catégorie non trouvée",
            code: "CATEGORY_NOT_FOUND"
          });
        }
      }

      // Gérer l'upload d'image
      if (req.file && req.file.cloudinary) {
        updateData.imageUrl = req.file.cloudinary.secure_url;
        updateData.imagePublicId = req.file.cloudinary.public_id;

        // Supprimer l'ancienne image de Cloudinary si elle existe
        if (produitExistant.imagePublicId) {
          const cloudinary = require('cloudinary').v2;
          try {
            await cloudinary.uploader.destroy(produitExistant.imagePublicId);
          } catch (cloudinaryError) {
            console.error('Erreur suppression ancienne image:', cloudinaryError);
          }
        }
      }

      // Mettre à jour le produit
      const produitMisAJour = await prisma.produit.update({
        where: { id: parseInt(req.params.id) },
        data: updateData,
        include: {
          categorie: {
            select: {
              id: true,
              nom: true,
              description: true
            }
          }
        }
      });

      res.json({
        success: true,
        message: "Produit mis à jour avec succès",
        produit: produitMisAJour
      });
    } catch (error) {
      console.error('Erreur modification produit:', error);
      res.status(500).json({
        error: "Erreur interne du serveur",
        code: "INTERNAL_ERROR"
      });
    }
  }
);

// ✅ Supprimer un produit (admin seulement)
router.delete('/:id',
  authenticateToken,
  authorizeRole('ADMIN'),
  [param('id').isInt().withMessage('ID invalide')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "ID invalide",
        details: errors.array(),
        code: "VALIDATION_ERROR"
      });
    }

    try {
      // Vérifier que le produit existe
      const produit = await prisma.produit.findUnique({
        where: { id: parseInt(req.params.id) }
      });

      if (!produit) {
        return res.status(404).json({
          error: "Produit non trouvé",
          code: "PRODUCT_NOT_FOUND"
        });
      }

      // Vérifier qu'il n'y a pas de commandes en cours avec ce produit
      const commandesEnCours = await prisma.commande.count({
        where: {
          produits: {
            some: {
              produitId: parseInt(req.params.id)
            }
          },
          statut: {
            in: ['EN_ATTENTE', 'CONFIRMEE', 'EN_PREPARATION']
          }
        }
      });

      if (commandesEnCours > 0) {
        return res.status(400).json({
          error: "Impossible de supprimer ce produit car il est présent dans des commandes en cours",
          code: "PRODUCT_IN_ACTIVE_ORDERS"
        });
      }

      // Supprimer l'image de Cloudinary si elle existe
      if (produit.imagePublicId) {
        const cloudinary = require('cloudinary').v2;
        try {
          await cloudinary.uploader.destroy(produit.imagePublicId);
        } catch (cloudinaryError) {
          console.error('Erreur suppression image Cloudinary:', cloudinaryError);
        }
      }

      // Supprimer le produit
      await prisma.produit.delete({
        where: { id: parseInt(req.params.id) }
      });

      res.json({
        success: true,
        message: "Produit supprimé avec succès"
      });
    } catch (error) {
      console.error('Erreur suppression produit:', error);
      res.status(500).json({
        error: "Erreur interne du serveur",
        code: "INTERNAL_ERROR"
      });
    }
  }
);

// ✅ Lister toutes les catégories
router.get('/categories/all', async (req, res) => {
  try {
    const categories = await prisma.categorie.findMany({
      include: {
        _count: {
          select: {
            produits: true
          }
        }
      },
      orderBy: { nom: 'asc' }
    });

    res.json(categories);
  } catch (error) {
    console.error('Erreur récupération catégories:', error);
    res.status(500).json({
      error: "Erreur interne du serveur",
      code: "INTERNAL_ERROR"
    });
  }
});

// ✅ Créer une nouvelle catégorie (admin seulement)
router.post('/categories',
  authenticateToken,
  authorizeRole('ADMIN'),
  [
    body('nom').isLength({ min: 1, max: 50 }).withMessage('Nom requis (1-50 caractères)'),
    body('description').optional().isLength({ max: 200 }).withMessage('Description trop longue (max 200 caractères)')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Données invalides",
        details: errors.array(),
        code: "VALIDATION_ERROR"
      });
    }

    const { nom, description = '' } = req.body;

    try {
      // Vérifier que le nom n'existe pas déjà
      const categorieExistante = await prisma.categorie.findFirst({
        where: { nom: { equals: nom } }
      });

      if (categorieExistante) {
        return res.status(400).json({
          error: "Une catégorie avec ce nom existe déjà",
          code: "CATEGORY_NAME_EXISTS"
        });
      }

      const categorie = await prisma.categorie.create({
        data: { nom, description }
      });

      res.status(201).json({
        success: true,
        message: "Catégorie créée avec succès",
        categorie
      });
    } catch (error) {
      console.error('Erreur création catégorie:', error);
      res.status(500).json({
        error: "Erreur interne du serveur",
        code: "INTERNAL_ERROR"
      });
    }
  }
);

// ✅ Statistiques des produits (admin seulement)
router.get('/stats/dashboard',
  authenticateToken,
  authorizeRole('ADMIN'),
  async (req, res) => {
    try {
      const [
        totalProduits,
        produitsDisponibles,
        produitsEnRupture,
        moyennePrix,
        categoriesAvecProduits,
        produitsPlusVendus
      ] = await Promise.all([
        prisma.produit.count(),
        prisma.produit.count({ where: { disponible: true } }),
        prisma.produit.count({ where: { stock: 0 } }),
        prisma.produit.aggregate({ _avg: { prix: true } }),
        prisma.categorie.count({
          where: {
            produits: {
              some: {}
            }
          }
        }),
        prisma.produit.findMany({
          take: 5,
          include: {
            _count: {
              select: {
                commandeProduits: true
              }
            },
            categorie: {
              select: {
                nom: true
              }
            }
          },
          orderBy: {
            commandeProduits: {
              _count: 'desc'
            }
          }
        })
      ]);

      res.json({
        total: totalProduits,
        disponibles: produitsDisponibles,
        enRupture: produitsEnRupture,
        moyennePrix: Math.round((moyennePrix._avg.prix || 0) * 100) / 100,
        categoriesAvecProduits,
        produitsPlusVendus
      });
    } catch (error) {
      console.error('Erreur statistiques produits:', error);
      res.status(500).json({
        error: "Erreur interne du serveur",
        code: "INTERNAL_ERROR"
      });
    }
  }
);

module.exports = router;