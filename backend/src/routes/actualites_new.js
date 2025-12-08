/**
 * Routes pour la gestion des actualités
 * La Boucherie Fine - Blog/Actualités
 */

const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const { authenticateToken, authorizeRole } = require('../middlewares/auth');
const actualitesController = require('../controllers/actualites');

const router = express.Router();

// Middleware de validation des erreurs
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Données invalides',
      details: errors.array(),
      code: 'VALIDATION_ERROR'
    });
  }
  next();
};

// =====================================
// ROUTES PUBLIQUES (Frontend)
// =====================================

/**
 * GET /api/actualites
 * Récupérer toutes les actualités publiques
 */
router.get('/',
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('La page doit être un entier positif'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('La limite doit être entre 1 et 50'),
    query('categorie')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('La catégorie doit faire entre 1 et 100 caractères'),
    query('search')
      .optional()
      .isLength({ min: 1, max: 200 })
      .withMessage('La recherche doit faire entre 1 et 200 caractères')
  ],
  handleValidationErrors,
  actualitesController.getActualites
);

/**
 * GET /api/actualites/categories
 * Récupérer toutes les catégories d'actualités
 */
router.get('/categories', actualitesController.getCategories);

/**
 * GET /api/actualites/:slug
 * Récupérer une actualité par son slug
 */
router.get('/:slug',
  [
    param('slug')
      .isLength({ min: 1, max: 200 })
      .matches(/^[a-z0-9-]+$/)
      .withMessage('Le slug doit contenir uniquement des lettres minuscules, chiffres et tirets')
  ],
  handleValidationErrors,
  actualitesController.getActualiteBySlug
);

// =====================================
// ROUTES ADMIN (Dashboard)
// =====================================

/**
 * GET /api/admin/actualites
 * Récupérer toutes les actualités pour l'admin
 */
router.get('/admin/all',
  authenticateToken,
  authorizeRole('ADMIN'),
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('La page doit être un entier positif'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('La limite doit être entre 1 et 100'),
    query('categorie')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('La catégorie doit faire entre 1 et 100 caractères'),
    query('search')
      .optional()
      .isLength({ min: 1, max: 200 })
      .withMessage('La recherche doit faire entre 1 et 200 caractères'),
    query('actif')
      .optional()
      .isIn(['true', 'false'])
      .withMessage('Le statut actif doit être true ou false')
  ],
  handleValidationErrors,
  actualitesController.getAllActualitesAdmin
);

/**
 * POST /api/admin/actualites
 * Créer une nouvelle actualité
 */
router.post('/admin/create',
  authenticateToken,
  authorizeRole('ADMIN'),
  [
    body('titre')
      .trim()
      .isLength({ min: 5, max: 200 })
      .withMessage('Le titre doit faire entre 5 et 200 caractères'),
    body('contenu')
      .trim()
      .isLength({ min: 50 })
      .withMessage('Le contenu doit faire au moins 50 caractères'),
    body('extrait')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('L\'extrait ne peut pas dépasser 500 caractères'),
    body('imageUrl')
      .optional()
      .isURL()
      .withMessage('L\'URL de l\'image doit être valide'),
    body('categorie')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('La catégorie doit faire entre 1 et 100 caractères'),
    body('datePublication')
      .optional()
      .isISO8601()
      .withMessage('La date de publication doit être au format ISO8601')
  ],
  handleValidationErrors,
  actualitesController.createActualite
);

/**
 * PUT /api/admin/actualites/:id
 * Modifier une actualité existante
 */
router.put('/admin/:id',
  authenticateToken,
  authorizeRole('ADMIN'),
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage('L\'ID doit être un entier positif'),
    body('titre')
      .optional()
      .trim()
      .isLength({ min: 5, max: 200 })
      .withMessage('Le titre doit faire entre 5 et 200 caractères'),
    body('contenu')
      .optional()
      .trim()
      .isLength({ min: 50 })
      .withMessage('Le contenu doit faire au moins 50 caractères'),
    body('extrait')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('L\'extrait ne peut pas dépasser 500 caractères'),
    body('imageUrl')
      .optional()
      .isURL()
      .withMessage('L\'URL de l\'image doit être valide'),
    body('categorie')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('La catégorie doit faire entre 1 et 100 caractères'),
    body('actif')
      .optional()
      .isBoolean()
      .withMessage('Le statut actif doit être un booléen'),
    body('datePublication')
      .optional()
      .isISO8601()
      .withMessage('La date de publication doit être au format ISO8601')
  ],
  handleValidationErrors,
  actualitesController.updateActualite
);

/**
 * DELETE /api/admin/actualites/:id
 * Supprimer une actualité
 */
router.delete('/admin/:id',
  authenticateToken,
  authorizeRole('ADMIN'),
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage('L\'ID doit être un entier positif')
  ],
  handleValidationErrors,
  actualitesController.deleteActualite
);

module.exports = router;