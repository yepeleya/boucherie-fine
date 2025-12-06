const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middlewares/auth');
const { normalizePhoneNumber } = require('../utils/phoneUtils');
const { validatePhone } = require('../middlewares/phoneValidation');

const router = express.Router();
const prisma = new PrismaClient();

// Validation rules pour la connexion
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email invalide'),
  body('motDePasse')
    .isLength({ min: 1 })
    .withMessage('Mot de passe requis')
];

// Validation rules pour l'inscription
const registerValidation = [
  body('nom')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Le nom doit contenir au moins 2 caractères'),
  body('prenom')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Le prénom doit contenir au moins 2 caractères'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email invalide'),
  body('motDePasse')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre'),
  body('confirmationMotDePasse')
    .custom((value, { req }) => {
      if (value !== req.body.motDePasse) {
        throw new Error('Les mots de passe ne correspondent pas');
      }
      return true;
    })
];

/**
 * @route POST /api/auth/login
 * @desc Connecter un utilisateur
 * @access Public
 */
router.post('/login', loginValidation, async (req, res) => {
  try {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Données invalides',
        details: errors.array()
      });
    }

    const { email, motDePasse } = req.body;

    // Trouver l'utilisateur
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { email }
    });

    if (!utilisateur) {
      return res.status(401).json({
        error: 'Email ou mot de passe incorrect',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Vérifier le mot de passe
    const motDePasseValide = await bcrypt.compare(motDePasse, utilisateur.motDePasse);
    
    if (!motDePasseValide) {
      return res.status(401).json({
        error: 'Email ou mot de passe incorrect',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Vérifier si le compte est actif
    if (!utilisateur.actif) {
      return res.status(403).json({
        error: 'Compte désactivé. Contactez l\'administrateur.',
        code: 'ACCOUNT_DISABLED'
      });
    }

    // Générer le token JWT
    const token = jwt.sign(
      { 
        id: utilisateur.id,
        email: utilisateur.email,
        role: utilisateur.role
      },
      process.env.JWT_SECRET || 'secret_temporaire',
      { expiresIn: '24h' }
    );

    // Mettre à jour la dernière connexion
    await prisma.utilisateur.update({
      where: { id: utilisateur.id },
      data: { 
        derniereConnexion: new Date()
      }
    });

    // Réponse sans le mot de passe
    const { motDePasse: _, ...utilisateurSansMotDePasse } = utilisateur;

    res.json({
      message: 'Connexion réussie',
      token,
      utilisateur: {
        ...utilisateurSansMotDePasse,
        derniereConnexion: new Date()
      }
    });

  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * @route POST /api/auth/register
 * @desc Créer un nouveau compte utilisateur
 * @access Public
 */
router.post('/register', 
  validatePhone({ required: false }), // Validation du téléphone en premier
  registerValidation, 
  async (req, res) => {
  try {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Données invalides',
        details: errors.array()
      });
    }

    const { nom, prenom, email, telephone, motDePasse } = req.body;
    
    // Le téléphone a déjà été validé et normalisé par le middleware validatePhone

    // Vérifier si l'utilisateur existe déjà
    const utilisateurExistant = await prisma.utilisateur.findUnique({
      where: { email }
    });

    if (utilisateurExistant) {
      return res.status(409).json({
        error: 'Un compte avec cet email existe déjà',
        code: 'EMAIL_ALREADY_EXISTS'
      });
    }

    // Vérifier si le téléphone existe déjà (s'il est fourni)
    if (telephone) {
      const utilisateurAvecTelephone = await prisma.utilisateur.findFirst({
        where: { telephone }
      });

      if (utilisateurAvecTelephone) {
        return res.status(409).json({
          error: 'Un compte avec ce numéro de téléphone existe déjà',
          code: 'PHONE_ALREADY_EXISTS'
        });
      }
    }

    // Hasher le mot de passe
    const saltRounds = 12;
    const motDePasseHash = await bcrypt.hash(motDePasse, saltRounds);

    // Créer l'utilisateur
    const nouvelUtilisateur = await prisma.utilisateur.create({
      data: {
        nom,
        prenom,
        email,
        telephone,
        motDePasse: motDePasseHash,
        role: 'CLIENT'
      }
    });

    // Générer le token JWT
    const token = jwt.sign(
      { 
        id: nouvelUtilisateur.id,
        email: nouvelUtilisateur.email,
        role: nouvelUtilisateur.role
      },
      process.env.JWT_SECRET || 'secret_temporaire',
      { expiresIn: '24h' }
    );

    // Réponse sans le mot de passe
    const { motDePasse: _, ...utilisateurSansMotDePasse } = nouvelUtilisateur;

    res.status(201).json({
      message: 'Compte créé avec succès',
      token,
      utilisateur: utilisateurSansMotDePasse
    });

  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * @route GET /api/auth/me
 * @desc Obtenir les informations de l'utilisateur connecté
 * @access Privé
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        telephone: true,
        role: true,
        actif: true,
        dateInscription: true,
        derniereConnexion: true
      }
    });

    if (!utilisateur) {
      return res.status(404).json({
        error: 'Utilisateur introuvable',
        code: 'USER_NOT_FOUND'
      });
    }

    res.json({
      utilisateur
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * @route POST /api/auth/logout
 * @desc Déconnecter l'utilisateur (côté serveur, optionnel)
 * @access Privé
 */
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // Dans une implémentation JWT simple, la déconnexion se fait côté client
    // Ici on peut optionnellement mettre à jour la dernière connexion
    await prisma.utilisateur.update({
      where: { id: req.user.id },
      data: { 
        derniereConnexion: new Date()
      }
    });

    res.json({
      message: 'Déconnexion réussie'
    });

  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * @route POST /api/auth/refresh
 * @desc Rafraîchir le token JWT
 * @access Privé
 */
router.post('/refresh', authenticateToken, async (req, res) => {
  try {
    // Générer un nouveau token
    const nouveauToken = jwt.sign(
      { 
        id: req.user.id,
        email: req.user.email,
        role: req.user.role
      },
      process.env.JWT_SECRET || 'secret_temporaire',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Token rafraîchi',
      token: nouveauToken
    });

  } catch (error) {
    console.error('Erreur lors du rafraîchissement du token:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  }
});

module.exports = router;
