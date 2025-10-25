const { body, validationResult } = require('express-validator');

// Middleware pour gérer les erreurs de validation
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Données invalides',
      code: 'VALIDATION_ERROR',
      details: errors.array()
    });
  }
  next();
};

// Validations pour l'authentification
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email invalide'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Le mot de passe doit contenir au moins 6 caractères'),
  handleValidationErrors
];

const validateRegister = [
  body('nom')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le nom doit contenir entre 2 et 50 caractères'),
  body('prenom')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Le prénom ne peut pas dépasser 50 caractères'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email invalide'),
  body('motDePasse')
    .isLength({ min: 6 })
    .withMessage('Le mot de passe doit contenir au moins 6 caractères'),
  handleValidationErrors
];

// Validations pour les produits
const validateProduct = [
  body('nom')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Le nom doit contenir entre 2 et 100 caractères'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('La description ne peut pas dépasser 500 caractères'),
  body('prix')
    .isFloat({ min: 0 })
    .withMessage('Le prix doit être un nombre positif'),
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Le stock doit être un nombre entier positif'),
  body('categorieId')
    .isInt({ min: 1 })
    .withMessage('L\'ID de catégorie doit être un nombre entier valide'),
  handleValidationErrors
];

// Validations pour les réservations
const validateReservation = [
  body('date')
    .isISO8601()
    .toDate()
    .withMessage('Date invalide'),
  body('heure')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Heure invalide (format HH:MM)'),
  body('nbPersonnes')
    .isInt({ min: 1, max: 20 })
    .withMessage('Le nombre de personnes doit être entre 1 et 20'),
  body('telephone')
    .optional()
    .isMobilePhone('fr-FR')
    .withMessage('Numéro de téléphone invalide'),
  handleValidationErrors
];

// Validations pour les actualités
const validateActualite = [
  body('titre')
    .trim()
    .isLength({ min: 5, max: 150 })
    .withMessage('Le titre doit contenir entre 5 et 150 caractères'),
  body('contenu')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Le contenu doit contenir au moins 10 caractères'),
  body('resume')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Le résumé ne peut pas dépasser 300 caractères'),
  body('dateDebut')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Date de début invalide'),
  body('dateFin')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Date de fin invalide'),
  handleValidationErrors
];

module.exports = {
  validateLogin,
  validateRegister,
  validateProduct,
  validateReservation,
  validateActualite,
  handleValidationErrors
};