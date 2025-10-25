const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, authorizeRole } = require('../middlewares/auth');
const { upload } = require('../middlewares/upload');
const { body, param, query, validationResult } = require('express-validator');

const prisma = new PrismaClient();
const router = express.Router();

// ✅ Lister toutes les actualités avec filtres et pagination
router.get('/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page doit être un entier positif'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limite doit être entre 1 et 100'),
    query('statut').optional().isIn(['BROUILLON', 'PUBLIEE', 'ARCHIVEE']).withMessage('Statut invalide'),
    query('dateDebut').optional().isISO8601().withMessage('Date de début invalide'),
    query('dateFin').optional().isISO8601().withMessage('Date de fin invalide'),
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
      limit = 10,
      statut = '',
      dateDebut = '',
      dateFin = '',
      search = '',
      publiquesOnly = 'false'
    } = req.query;

    try {
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Construire les filtres
      const where = {};

      // Si publiquesOnly=true ou utilisateur non authentifié, ne montrer que les actualités publiées
      if (publiquesOnly === 'true' || !req.user) {
        where.statut = 'PUBLIEE';
        where.dateExpiration = {
          OR: [
            { gt: new Date() },
            { equals: null }
          ]
        };
      } else if (statut) {
        where.statut = statut;
      }

      if (dateDebut || dateFin) {
        where.datePublication = {};
        if (dateDebut) {
          where.datePublication.gte = new Date(dateDebut);
        }
        if (dateFin) {
          where.datePublication.lte = new Date(dateFin);
        }
      }

      if (search) {
        where.OR = [
          { titre: { contains: search } },
          { contenu: { contains: search } },
          { resume: { contains: search } }
        ];
      }

      // Récupérer les actualités avec pagination
      const [actualites, total] = await Promise.all([
        prisma.actualite.findMany({
          where,
          include: {
            auteur: {
              select: {
                id: true,
                nom: true,
                email: true
              }
            }
          },
          skip,
          take: parseInt(limit),
          orderBy: { datePublication: 'desc' }
        }),
        prisma.actualite.count({ where })
      ]);

      res.json({
        actualites,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Erreur récupération actualités:', error);
      res.status(500).json({
        error: "Erreur interne du serveur",
        code: "INTERNAL_ERROR"
      });
    }
  }
);

// ✅ Récupérer une actualité par ID
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
      const actualite = await prisma.actualite.findUnique({
        where: { id: parseInt(req.params.id) },
        include: {
          auteur: {
            select: {
              id: true,
              nom: true,
              email: true
            }
          }
        }
      });

      if (!actualite) {
        return res.status(404).json({
          error: "Actualité non trouvée",
          code: "NEWS_NOT_FOUND"
        });
      }

      // Vérifier les droits d'accès pour les actualités non publiées
      if (actualite.statut !== 'PUBLIEE') {
        if (!req.user || req.user.role !== 'ADMIN') {
          return res.status(403).json({
            error: "Accès interdit",
            code: "ACCESS_DENIED"
          });
        }
      }

      // Vérifier si l'actualité n'est pas expirée (pour les utilisateurs non admin)
      if (actualite.dateExpiration && actualite.dateExpiration < new Date()) {
        if (!req.user || req.user.role !== 'ADMIN') {
          return res.status(404).json({
            error: "Actualité non trouvée",
            code: "NEWS_NOT_FOUND"
          });
        }
      }

      // Incrémenter le nombre de vues (seulement pour les actualités publiées)
      if (actualite.statut === 'PUBLIEE') {
        await prisma.actualite.update({
          where: { id: parseInt(req.params.id) },
          data: { vues: { increment: 1 } }
        });
        actualite.vues += 1;
      }

      res.json(actualite);
    } catch (error) {
      console.error('Erreur récupération actualité:', error);
      res.status(500).json({
        error: "Erreur interne du serveur",
        code: "INTERNAL_ERROR"
      });
    }
  }
);

// ✅ Créer une nouvelle actualité (admin seulement)
router.post('/',
  authenticateToken,
  authorizeRole('ADMIN'),
  upload.single('image'),
  [
    body('titre').isLength({ min: 1, max: 200 }).withMessage('Titre requis (1-200 caractères)'),
    body('resume').isLength({ min: 1, max: 500 }).withMessage('Résumé requis (1-500 caractères)'),
    body('contenu').isLength({ min: 1, max: 10000 }).withMessage('Contenu requis (1-10000 caractères)'),
    body('statut').isIn(['BROUILLON', 'PUBLIEE']).withMessage('Statut invalide'),
    body('datePublication').optional().isISO8601().withMessage('Date de publication invalide'),
    body('dateExpiration').optional().isISO8601().withMessage('Date d\'expiration invalide'),
    body('important').optional().isBoolean().withMessage('Important doit être un booléen')
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
      titre,
      resume,
      contenu,
      statut,
      datePublication,
      dateExpiration,
      important = false
    } = req.body;

    try {
      // Vérifier que la date d'expiration est après la date de publication
      if (dateExpiration && datePublication) {
        const datePub = new Date(datePublication);
        const dateExp = new Date(dateExpiration);
        if (dateExp <= datePub) {
          return res.status(400).json({
            error: "La date d'expiration doit être postérieure à la date de publication",
            code: "INVALID_EXPIRATION_DATE"
          });
        }
      }

      // Données de l'actualité
      const actualiteData = {
        titre,
        resume,
        contenu,
        statut,
        auteurId: req.user.id,
        datePublication: datePublication ? new Date(datePublication) : new Date(),
        dateExpiration: dateExpiration ? new Date(dateExpiration) : null,
        important: important === 'true'
      };

      // Ajouter l'image si uploadée
      if (req.file && req.file.cloudinary) {
        actualiteData.imageUrl = req.file.cloudinary.secure_url;
        actualiteData.imagePublicId = req.file.cloudinary.public_id;
      }

      // Créer l'actualité
      const actualite = await prisma.actualite.create({
        data: actualiteData,
        include: {
          auteur: {
            select: {
              id: true,
              nom: true,
              email: true
            }
          }
        }
      });

      res.status(201).json({
        success: true,
        message: "Actualité créée avec succès",
        actualite
      });
    } catch (error) {
      console.error('Erreur création actualité:', error);
      res.status(500).json({
        error: "Erreur interne du serveur",
        code: "INTERNAL_ERROR"
      });
    }
  }
);

// ✅ Modifier une actualité (admin seulement)
router.put('/:id',
  authenticateToken,
  authorizeRole('ADMIN'),
  upload.single('image'),
  [
    param('id').isInt().withMessage('ID invalide'),
    body('titre').optional().isLength({ min: 1, max: 200 }).withMessage('Titre invalide (1-200 caractères)'),
    body('resume').optional().isLength({ min: 1, max: 500 }).withMessage('Résumé invalide (1-500 caractères)'),
    body('contenu').optional().isLength({ min: 1, max: 10000 }).withMessage('Contenu invalide (1-10000 caractères)'),
    body('statut').optional().isIn(['BROUILLON', 'PUBLIEE', 'ARCHIVEE']).withMessage('Statut invalide'),
    body('datePublication').optional().isISO8601().withMessage('Date de publication invalide'),
    body('dateExpiration').optional().isISO8601().withMessage('Date d\'expiration invalide'),
    body('important').optional().isBoolean().withMessage('Important doit être un booléen')
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
      // Vérifier que l'actualité existe
      const actualiteExistante = await prisma.actualite.findUnique({
        where: { id: parseInt(req.params.id) }
      });

      if (!actualiteExistante) {
        return res.status(404).json({
          error: "Actualité non trouvée",
          code: "NEWS_NOT_FOUND"
        });
      }

      // Préparer les données de mise à jour
      const updateData = {};
      const allowedFields = [
        'titre', 'resume', 'contenu', 'statut', 
        'datePublication', 'dateExpiration', 'important'
      ];

      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          if (field === 'datePublication' || field === 'dateExpiration') {
            updateData[field] = req.body[field] ? new Date(req.body[field]) : null;
          } else if (field === 'important') {
            updateData[field] = req.body[field] === 'true';
          } else {
            updateData[field] = req.body[field];
          }
        }
      });

      // Vérifier la logique des dates
      const datePublication = updateData.datePublication || actualiteExistante.datePublication;
      const dateExpiration = updateData.dateExpiration || actualiteExistante.dateExpiration;
      
      if (dateExpiration && datePublication && dateExpiration <= datePublication) {
        return res.status(400).json({
          error: "La date d'expiration doit être postérieure à la date de publication",
          code: "INVALID_EXPIRATION_DATE"
        });
      }

      // Gérer l'upload d'image
      if (req.file && req.file.cloudinary) {
        updateData.imageUrl = req.file.cloudinary.secure_url;
        updateData.imagePublicId = req.file.cloudinary.public_id;

        // Supprimer l'ancienne image de Cloudinary si elle existe
        if (actualiteExistante.imagePublicId) {
          const cloudinary = require('cloudinary').v2;
          try {
            await cloudinary.uploader.destroy(actualiteExistante.imagePublicId);
          } catch (cloudinaryError) {
            console.error('Erreur suppression ancienne image:', cloudinaryError);
          }
        }
      }

      // Mettre à jour l'actualité
      const actualiteMiseAJour = await prisma.actualite.update({
        where: { id: parseInt(req.params.id) },
        data: updateData,
        include: {
          auteur: {
            select: {
              id: true,
              nom: true,
              email: true
            }
          }
        }
      });

      res.json({
        success: true,
        message: "Actualité mise à jour avec succès",
        actualite: actualiteMiseAJour
      });
    } catch (error) {
      console.error('Erreur modification actualité:', error);
      res.status(500).json({
        error: "Erreur interne du serveur",
        code: "INTERNAL_ERROR"
      });
    }
  }
);

// ✅ Supprimer une actualité (admin seulement)
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
      // Vérifier que l'actualité existe
      const actualite = await prisma.actualite.findUnique({
        where: { id: parseInt(req.params.id) }
      });

      if (!actualite) {
        return res.status(404).json({
          error: "Actualité non trouvée",
          code: "NEWS_NOT_FOUND"
        });
      }

      // Supprimer l'image de Cloudinary si elle existe
      if (actualite.imagePublicId) {
        const cloudinary = require('cloudinary').v2;
        try {
          await cloudinary.uploader.destroy(actualite.imagePublicId);
        } catch (cloudinaryError) {
          console.error('Erreur suppression image Cloudinary:', cloudinaryError);
        }
      }

      // Supprimer l'actualité
      await prisma.actualite.delete({
        where: { id: parseInt(req.params.id) }
      });

      res.json({
        success: true,
        message: "Actualité supprimée avec succès"
      });
    } catch (error) {
      console.error('Erreur suppression actualité:', error);
      res.status(500).json({
        error: "Erreur interne du serveur",
        code: "INTERNAL_ERROR"
      });
    }
  }
);

// ✅ Obtenir les actualités récentes pour l'accueil
router.get('/public/recentes',
  [query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limite invalide')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Paramètres invalides",
        details: errors.array(),
        code: "VALIDATION_ERROR"
      });
    }

    const { limit = 5 } = req.query;

    try {
      const actualites = await prisma.actualite.findMany({
        where: {
          statut: 'PUBLIEE',
          OR: [
            { dateExpiration: { gt: new Date() } },
            { dateExpiration: null }
          ]
        },
        select: {
          id: true,
          titre: true,
          resume: true,
          imageUrl: true,
          datePublication: true,
          vues: true,
          important: true
        },
        take: parseInt(limit),
        orderBy: [
          { important: 'desc' },
          { datePublication: 'desc' }
        ]
      });

      res.json(actualites);
    } catch (error) {
      console.error('Erreur récupération actualités récentes:', error);
      res.status(500).json({
        error: "Erreur interne du serveur",
        code: "INTERNAL_ERROR"
      });
    }
  }
);

// ✅ Archiver automatiquement les actualités expirées (endpoint interne pour CRON)
router.post('/internal/archive-expired',
  async (req, res) => {
    try {
      // Vérifier que l'appel vient du serveur local (protection basique)
      const clientIP = req.ip || req.connection.remoteAddress;
      if (!['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(clientIP)) {
        return res.status(403).json({
          error: "Accès interdit",
          code: "ACCESS_DENIED"
        });
      }

      const result = await prisma.actualite.updateMany({
        where: {
          statut: 'PUBLIEE',
          dateExpiration: {
            lte: new Date()
          }
        },
        data: {
          statut: 'ARCHIVEE'
        }
      });

      res.json({
        success: true,
        message: `${result.count} actualités archivées automatiquement`
      });
    } catch (error) {
      console.error('Erreur archivage automatique:', error);
      res.status(500).json({
        error: "Erreur interne du serveur",
        code: "INTERNAL_ERROR"
      });
    }
  }
);

// ✅ Statistiques des actualités (admin seulement)
router.get('/stats/dashboard',
  authenticateToken,
  authorizeRole('ADMIN'),
  async (req, res) => {
    try {
      const [
        totalActualites,
        actualitesPubliees,
        actualitesBrouillon,
        actualitesArchivees,
        actualitesImportantes,
        totalVues,
        actualitesPopulaires
      ] = await Promise.all([
        prisma.actualite.count(),
        prisma.actualite.count({ where: { statut: 'PUBLIEE' } }),
        prisma.actualite.count({ where: { statut: 'BROUILLON' } }),
        prisma.actualite.count({ where: { statut: 'ARCHIVEE' } }),
        prisma.actualite.count({ where: { important: true } }),
        prisma.actualite.aggregate({
          _sum: { vues: true }
        }),
        prisma.actualite.findMany({
          where: { statut: 'PUBLIEE' },
          select: {
            id: true,
            titre: true,
            vues: true,
            datePublication: true
          },
          take: 5,
          orderBy: { vues: 'desc' }
        })
      ]);

      res.json({
        total: totalActualites,
        publiees: actualitesPubliees,
        brouillon: actualitesBrouillon,
        archivees: actualitesArchivees,
        importantes: actualitesImportantes,
        totalVues: totalVues._sum.vues || 0,
        populaires: actualitesPopulaires
      });
    } catch (error) {
      console.error('Erreur statistiques actualités:', error);
      res.status(500).json({
        error: "Erreur interne du serveur",
        code: "INTERNAL_ERROR"
      });
    }
  }
);

module.exports = router;