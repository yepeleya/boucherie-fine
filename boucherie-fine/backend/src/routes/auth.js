const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middlewares/auth');

const prisma = new PrismaClient();
const router = express.Router();

// Configuration JWT
const JWT_SECRET = process.env.JWT_SECRET || 'boucherie_fine_secret_key_2025';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// ✅ INSCRIPTION - POST /api/auth/register
router.post('/register',
  [
    body('nom').trim().isLength({ min: 2, max: 50 }).withMessage('Le nom doit contenir entre 2 et 50 caractères'),
    body('email').isEmail().normalizeEmail().withMessage('Adresse email invalide'),
    body('motDePasse').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),
    body('telephone').optional().isMobilePhone('any').withMessage('Numéro de téléphone invalide'),
    body('prenom').optional().trim().isLength({ max: 50 }).withMessage('Le prénom ne peut pas dépasser 50 caractères'),
  ],
  async (req, res) => {
    try {
      // Vérifier les erreurs de validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Données invalides',
          errors: errors.array()
        });
      }

      const { nom, prenom, email, motDePasse, telephone, adresse } = req.body;

      // Vérifier si l'utilisateur existe déjà
      const utilisateurExistant = await prisma.utilisateur.findUnique({
        where: { email }
      });

      if (utilisateurExistant) {
        return res.status(409).json({
          success: false,
          message: 'Un compte avec cette adresse email existe déjà'
        });
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
          motDePasse: motDePasseHash,
          telephone,
          adresse,
          role: 'CLIENT' // Par défaut
        }
      });

      // Générer le token JWT
      const token = jwt.sign(
        { 
          userId: nouvelUtilisateur.id,
          email: nouvelUtilisateur.email,
          role: nouvelUtilisateur.role
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      // Réponse sans le mot de passe
      const { motDePasse: _, ...utilisateurSansMotDePasse } = nouvelUtilisateur;

      res.status(201).json({
        success: true,
        message: 'Compte créé avec succès',
        data: {
          utilisateur: utilisateurSansMotDePasse,
          token
        }
      });

    } catch (error) {
      console.error('Erreur inscription:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }
);

// ✅ CONNEXION - POST /api/auth/login
router.post('/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Adresse email invalide'),
    body('motDePasse').notEmpty().withMessage('Mot de passe requis'),
  ],
  async (req, res) => {
    try {
      // Vérifier les erreurs de validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Données invalides',
          errors: errors.array()
        });
      }

      const { email, motDePasse } = req.body;

      // Trouver l'utilisateur
      const utilisateur = await prisma.utilisateur.findUnique({
        where: { email }
      });

      if (!utilisateur) {
        return res.status(401).json({
          success: false,
          message: 'Email ou mot de passe incorrect'
        });
      }

      // Vérifier le mot de passe
      const motDePasseValide = await bcrypt.compare(motDePasse, utilisateur.motDePasse);

      if (!motDePasseValide) {
        return res.status(401).json({
          success: false,
          message: 'Email ou mot de passe incorrect'
        });
      }

      // Générer le token JWT
      const token = jwt.sign(
        { 
          userId: utilisateur.id,
          email: utilisateur.email,
          role: utilisateur.role
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      // Réponse sans le mot de passe
      const { motDePasse: _, ...utilisateurSansMotDePasse } = utilisateur;

      res.json({
        success: true,
        message: 'Connexion réussie',
        data: {
          utilisateur: utilisateurSansMotDePasse,
          token
        }
      });

    } catch (error) {
      console.error('Erreur connexion:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }
);

// ✅ PROFIL UTILISATEUR - GET /api/auth/me
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
        adresse: true,
        role: true,
        dateCreation: true,
        dateModification: true,
        _count: {
          select: {
            reservations: true,
            commandes: true
          }
        }
      }
    });

    if (!utilisateur) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    res.json({
      success: true,
      data: { utilisateur }
    });

  } catch (error) {
    console.error('Erreur récupération profil:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// ✅ DÉCONNEXION - POST /api/auth/logout
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // Note: Avec JWT, la déconnexion se fait côté client en supprimant le token
    // Ici on peut ajouter une logique de blacklist si nécessaire
    
    res.json({
      success: true,
      message: 'Déconnexion réussie'
    });

  } catch (error) {
    console.error('Erreur déconnexion:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// ✅ MODIFICATION DU PROFIL - PUT /api/auth/profile
router.put('/profile', 
  authenticateToken,
  [
    body('nom').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Le nom doit contenir entre 2 et 50 caractères'),
    body('prenom').optional().trim().isLength({ max: 50 }).withMessage('Le prénom ne peut pas dépasser 50 caractères'),
    body('telephone').optional().isMobilePhone('any').withMessage('Numéro de téléphone invalide'),
    body('adresse').optional().trim().isLength({ max: 255 }).withMessage('L\'adresse ne peut pas dépasser 255 caractères'),
  ],
  async (req, res) => {
    try {
      // Vérifier les erreurs de validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Données invalides',
          errors: errors.array()
        });
      }

      const { nom, prenom, telephone, adresse } = req.body;
      const donneesModification = {};

      // Ne modifier que les champs fournis
      if (nom !== undefined) donneesModification.nom = nom;
      if (prenom !== undefined) donneesModification.prenom = prenom;
      if (telephone !== undefined) donneesModification.telephone = telephone;
      if (adresse !== undefined) donneesModification.adresse = adresse;

      const utilisateurModifie = await prisma.utilisateur.update({
        where: { id: req.user.id },
        data: donneesModification,
        select: {
          id: true,
          nom: true,
          prenom: true,
          email: true,
          telephone: true,
          adresse: true,
          role: true,
          dateCreation: true,
          dateModification: true
        }
      });

      res.json({
        success: true,
        message: 'Profil mis à jour avec succès',
        data: { utilisateur: utilisateurModifie }
      });

    } catch (error) {
      console.error('Erreur modification profil:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }
);

// ✅ CHANGEMENT DE MOT DE PASSE - PUT /api/auth/change-password
router.put('/change-password',
  authenticateToken,
  [
    body('motDePasseActuel').notEmpty().withMessage('Mot de passe actuel requis'),
    body('nouveauMotDePasse').isLength({ min: 6 }).withMessage('Le nouveau mot de passe doit contenir au moins 6 caractères'),
  ],
  async (req, res) => {
    try {
      // Vérifier les erreurs de validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Données invalides',
          errors: errors.array()
        });
      }

      const { motDePasseActuel, nouveauMotDePasse } = req.body;

      // Récupérer l'utilisateur avec son mot de passe
      const utilisateur = await prisma.utilisateur.findUnique({
        where: { id: req.user.id }
      });

      // Vérifier le mot de passe actuel
      const motDePasseValide = await bcrypt.compare(motDePasseActuel, utilisateur.motDePasse);

      if (!motDePasseValide) {
        return res.status(401).json({
          success: false,
          message: 'Mot de passe actuel incorrect'
        });
      }

      // Hasher le nouveau mot de passe
      const saltRounds = 12;
      const nouveauMotDePasseHash = await bcrypt.hash(nouveauMotDePasse, saltRounds);

      // Mettre à jour le mot de passe
      await prisma.utilisateur.update({
        where: { id: req.user.id },
        data: { motDePasse: nouveauMotDePasseHash }
      });

      res.json({
        success: true,
        message: 'Mot de passe modifié avec succès'
      });

    } catch (error) {
      console.error('Erreur changement mot de passe:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }
);

// ✅ VÉRIFICATION DU TOKEN - POST /api/auth/verify
router.post('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token manquant'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Vérifier que l'utilisateur existe toujours
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        nom: true,
        email: true,
        role: true
      }
    });

    if (!utilisateur) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    res.json({
      success: true,
      message: 'Token valide',
      data: { utilisateur }
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token invalide'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expiré'
      });
    }

    console.error('Erreur vérification token:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

module.exports = router;