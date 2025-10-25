const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, authorizeRole } = require('../middlewares/auth');
const { body, param, query, validationResult } = require('express-validator');

const prisma = new PrismaClient();
const router = express.Router();

// Inscription d'un nouvel utilisateur
router.post('/register',
  [
    body('nom').isLength({ min: 2, max: 50 }).withMessage('Nom requis'),
    body('email').isEmail().withMessage('Email invalide'),
    body('telephone').isMobilePhone('fr-FR').withMessage('Téléphone invalide'),
    body('motDePasse').isLength({ min: 6, max: 100 }).withMessage('Mot de passe requis'),
    body('adresse').optional().isLength({ min: 5, max: 200 }).withMessage('Adresse invalide')
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

    const { nom, email, telephone, motDePasse, adresse = '' } = req.body;

    try {
      const utilisateurExistant = await prisma.utilisateur.findUnique({
        where: { email }
      });

      if (utilisateurExistant) {
        return res.status(400).json({
          error: "Un compte avec cet email existe déjà",
          code: "EMAIL_ALREADY_EXISTS"
        });
      }

      const motDePasseHache = await bcrypt.hash(motDePasse, 12);

      const utilisateur = await prisma.utilisateur.create({
        data: {
          nom,
          email,
          telephone,
          motDePasse: motDePasseHache,
          adresse,
          role: 'CLIENT'
        },
        select: {
          id: true,
          nom: true,
          email: true,
          telephone: true,
          adresse: true,
          role: true,
          dateCreation: true
        }
      });

      const token = jwt.sign(
        { 
          id: utilisateur.id, 
          email: utilisateur.email, 
          role: utilisateur.role 
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        success: true,
        message: "Compte créé avec succès",
        token,
        utilisateur
      });
    } catch (error) {
      console.error('Erreur création utilisateur:', error);
      res.status(500).json({
        error: "Erreur interne du serveur",
        code: "INTERNAL_ERROR"
      });
    }
  }
);

// Connexion utilisateur
router.post('/login',
  [
    body('email').isEmail().withMessage('Email invalide'),
    body('motDePasse').isLength({ min: 1 }).withMessage('Mot de passe requis')
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

    const { email, motDePasse } = req.body;

    try {
      const utilisateur = await prisma.utilisateur.findUnique({
        where: { email }
      });

      if (!utilisateur) {
        return res.status(401).json({
          error: "Email ou mot de passe incorrect",
          code: "INVALID_CREDENTIALS"
        });
      }

      const motDePasseValide = await bcrypt.compare(motDePasse, utilisateur.motDePasse);
      if (!motDePasseValide) {
        return res.status(401).json({
          error: "Email ou mot de passe incorrect",
          code: "INVALID_CREDENTIALS"
        });
      }

      await prisma.utilisateur.update({
        where: { id: utilisateur.id },
        data: { derniereConnexion: new Date() }
      });

      const token = jwt.sign(
        { 
          id: utilisateur.id, 
          email: utilisateur.email, 
          role: utilisateur.role 
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        message: "Connexion réussie",
        token,
        utilisateur: {
          id: utilisateur.id,
          nom: utilisateur.nom,
          email: utilisateur.email,
          telephone: utilisateur.telephone,
          adresse: utilisateur.adresse,
          role: utilisateur.role,
          dateCreation: utilisateur.dateCreation,
          derniereConnexion: new Date()
        }
      });
    } catch (error) {
      console.error('Erreur connexion:', error);
      res.status(500).json({
        error: "Erreur interne du serveur",
        code: "INTERNAL_ERROR"
      });
    }
  }
);

// Récupérer les informations de l'utilisateur connecté
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        nom: true,
        email: true,
        telephone: true,
        adresse: true,
        role: true,
        dateCreation: true,
        derniereConnexion: true,
        _count: {
          select: {
            commandes: true,
            reservations: true
          }
        }
      }
    });

    if (!utilisateur) {
      return res.status(404).json({
        error: "Utilisateur non trouvé",
        code: "USER_NOT_FOUND"
      });
    }

    res.json(utilisateur);
  } catch (error) {
    console.error('Erreur récupération utilisateur:', error);
    res.status(500).json({
      error: "Erreur interne du serveur",
      code: "INTERNAL_ERROR"
    });
  }
});

module.exports = router;
