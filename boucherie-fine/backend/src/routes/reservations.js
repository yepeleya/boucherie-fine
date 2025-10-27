const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, authorizeRole } = require('../middlewares/auth');
const { body, param, query, validationResult } = require('express-validator');
const notificationService = require('../services/notificationService');

const prisma = new PrismaClient();
const router = express.Router();

// ✅ Créer une nouvelle réservation (utilisateurs connectés)
router.post('/',
  authenticateToken,
  [
    body('dateReservation').isISO8601().withMessage('Date de réservation invalide'),
    body('heureReservation').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Heure invalide (format HH:MM)'),
    body('nombrePersonnes').isInt({ min: 1, max: 20 }).withMessage('Nombre de personnes doit être entre 1 et 20'),
    body('commentaires').optional().isLength({ max: 500 }).withMessage('Commentaires trop longs'),
    body('telephone').isMobilePhone('fr-FR').withMessage('Numéro de téléphone invalide')
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

    const { date, heure, nbPersonnes, commentaires, telephone } = req.body;

    try {
      // Vérifier que la date n'est pas dans le passé
      const dateTime = new Date(`${date}T${heure}:00`);
      if (dateTime < new Date()) {
        return res.status(400).json({
          error: "Impossible de réserver dans le passé",
          code: "PAST_DATE_ERROR"
        });
      }

      // Vérifier les disponibilités (exemple: max 50 personnes par créneau)
      const reservationsExistantes = await prisma.reservation.aggregate({
        where: {
          date: new Date(date),
          heure: heure,
          statut: {
            in: ['EN_ATTENTE', 'CONFIRMEE']
          }
        },
        _sum: {
          nbPersonnes: true
        }
      });

      const personnesDejaReservees = reservationsExistantes._sum.nbPersonnes || 0;
      const capaciteMax = 50; // À configurer selon les besoins
      
      if (personnesDejaReservees + nbPersonnes > capaciteMax) {
        return res.status(400).json({
          error: `Capacité insuffisante. Seulement ${capaciteMax - personnesDejaReservees} places disponibles`,
          code: "INSUFFICIENT_CAPACITY"
        });
      }

      // Générer un numéro de réservation unique
      const numeroReservation = `RES-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      // Créer la réservation
      const reservation = await prisma.reservation.create({
        data: {
          numero: numeroReservation,
          utilisateurId: req.user.id,
          date: new Date(date),
          heure: heure,
          nbPersonnes: parseInt(nbPersonnes),
          commentaires,
          telephone,
          statut: 'EN_ATTENTE'
        },
        include: {
          utilisateur: {
            select: {
              id: true,
              nom: true,
              email: true,
              telephone: true
            }
          }
        }
      });

      // Envoyer notification
      await notificationService.notifyNewReservation(reservation);

      res.status(201).json({
        success: true,
        message: "Réservation créée avec succès",
        reservation: {
          id: reservation.id,
          numero: reservation.numero,
          date: reservation.date,
          heure: reservation.heure,
          nbPersonnes: reservation.nbPersonnes,
          statut: reservation.statut,
          commentaires: reservation.commentaires,
          telephone: reservation.telephone
        }
      });
    } catch (error) {
      console.error('Erreur création réservation:', error);
      res.status(500).json({
        error: "Erreur interne du serveur",
        code: "INTERNAL_ERROR"
      });
    }
  }
);

// ✅ Créer une nouvelle réservation publique (sans authentification)
router.post('/public', async (req, res) => {
  try {
    const { nom, email, telephone, date, heure, nbPersonnes, commentaires = '' } = req.body;

    // Validations simples et claires
    if (!nom || nom.length < 2 || nom.length > 50) {
      return res.status(400).json({
        success: false,
        message: "Nom requis (2-50 caractères)",
        details: ["Le nom doit contenir entre 2 et 50 caractères."]
      });
    }

    if (!email || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        message: "Email invalide",
        details: ["Veuillez entrer une adresse email valide."]
      });
    }

    // Validation téléphone simplifiée
    const phoneRegex = /^[0-9+\s\-()]{8,20}$/;
    if (!telephone || !phoneRegex.test(telephone)) {
      return res.status(400).json({
        success: false,
        message: "Numéro de téléphone invalide",
        details: ["Le numéro doit contenir entre 8 et 20 caractères (chiffres, espaces, +, -, () autorisés)."]
      });
    }

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date de réservation requise",
        details: ["Veuillez sélectionner une date de réservation."]
      });
    }

    if (!heure || !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(heure)) {
      return res.status(400).json({
        success: false,
        message: "Heure invalide",
        details: ["L'heure doit être au format HH:MM (ex: 19:30)."]
      });
    }

    const personnes = parseInt(nbPersonnes);
    if (isNaN(personnes) || personnes < 1 || personnes > 20) {
      return res.status(400).json({
        success: false,
        message: "Nombre de personnes invalide",
        details: ["Le nombre de personnes doit être entre 1 et 20."]
      });
    }

    // Vérifier que la date n'est pas dans le passé
    const dateTime = new Date(`${date}T${heure}:00`);
    if (dateTime < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Impossible de réserver dans le passé",
        details: ["Veuillez choisir une date et heure futures."]
      });
    }

    // Vérifier les disponibilités
    const reservationsExistantes = await prisma.reservation.aggregate({
      where: {
        date: new Date(date),
        heure: heure,
        statut: {
          in: ['EN_ATTENTE', 'CONFIRMEE']
        }
      },
      _sum: {
        nbPersonnes: true
      }
    });

    const personnesDejaReservees = reservationsExistantes._sum.nbPersonnes || 0;
    const capaciteMax = 50;
    
    if (personnesDejaReservees + personnes > capaciteMax) {
      return res.status(400).json({
        success: false,
        message: `Capacité insuffisante. Seulement ${capaciteMax - personnesDejaReservees} places disponibles`,
        details: [`Il ne reste que ${capaciteMax - personnesDejaReservees} places pour ce créneau.`]
      });
    }

    // Créer ou récupérer un utilisateur temporaire
    let utilisateur = await prisma.utilisateur.findUnique({
      where: { email }
    });

    if (!utilisateur) {
      // Créer un utilisateur temporaire
      const bcrypt = require('bcrypt');
      const tempPassword = await bcrypt.hash('temp_' + Date.now(), 12);
      
      utilisateur = await prisma.utilisateur.create({
        data: {
          nom,
          email,
          telephone,
          motDePasse: tempPassword,
          role: 'CLIENT',
          adresse: ''
        }
      });
    }

    // Générer un numéro de réservation unique
    const numeroReservation = `RES-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Créer la réservation
    const reservation = await prisma.reservation.create({
      data: {
        numero: numeroReservation,
        utilisateurId: utilisateur.id,
        date: new Date(date),
        heure: heure,
        nbPersonnes: personnes,
        commentaires,
        telephone,
        statut: 'EN_ATTENTE'
      },
      include: {
        utilisateur: {
          select: {
            id: true,
            nom: true,
            email: true,
            telephone: true
          }
        }
      }
    });

    // Envoyer notification (temporairement désactivé pour debug)
    // await notificationService.notifyNewReservation(reservation);

    res.status(201).json({
      success: true,
      message: "Réservation enregistrée avec succès",
      data: {
        id: reservation.id,
        numero: reservation.numero,
        date: reservation.date,
        heure: reservation.heure,
        nbPersonnes: reservation.nbPersonnes,
        statut: reservation.statut,
        commentaires: reservation.commentaires,
        telephone: reservation.telephone,
        utilisateur: {
          nom: reservation.utilisateur.nom,
          email: reservation.utilisateur.email
        }
      }
    });
  } catch (error) {
    console.error('Erreur création réservation publique:', error);
    res.status(500).json({
      success: false,
      message: "Erreur interne du serveur",
      details: [error.message]
    });
  }
});

// ✅ Récupérer les réservations de l'utilisateur connecté
router.get('/mes-reservations',
  authenticateToken,
  async (req, res) => {
    try {
      const userId = req.user.id;
      
      console.log('🔍 GET /mes-reservations - Utilisateur ID:', userId);
      
      const reservations = await prisma.reservation.findMany({
        where: {
          utilisateurId: userId
        },
        orderBy: {
          dateCreation: 'desc'
        },
        include: {
          utilisateur: {
            select: {
              nom: true,
              email: true,
              telephone: true
            }
          }
        }
      });

      console.log('📦 Réservations trouvées:', reservations.length);
      if (reservations.length > 0) {
        reservations.forEach((res, index) => {
          console.log(`  ${index + 1}. ${res.numero} - ${res.date} ${res.heure}`);
        });
      }

      // Formatage des données pour le frontend
      const formattedReservations = reservations.map(reservation => ({
        id: reservation.id.toString(),
        numero: reservation.numero,
        dateCreation: reservation.dateCreation.toISOString(),
        dateReservation: reservation.date.toISOString().split('T')[0],
        heureReservation: reservation.heure,
        nombrePersonnes: reservation.nbPersonnes,
        telephone: reservation.telephone || reservation.utilisateur.telephone,
        commentaires: reservation.commentaires,
        tableSpeciale: reservation.salle,
        statut: reservation.statut,
        restaurant: {
          nom: 'La Boucherie Fine',
          adresse: 'Riviera 3, Abidjan',
          telephone: '0544 54 47 35'
        }
      }));

      console.log('✅ Nombre de réservations formatées:', formattedReservations.length);
      res.json(formattedReservations);

    } catch (error) {
      console.error('Erreur lors de la récupération des réservations:', error);
      res.status(500).json({
        error: "Erreur serveur lors de la récupération des réservations",
        code: "SERVER_ERROR"
      });
    }
  }
);

// ✅ Lister toutes les réservations avec filtres
router.get('/',
  authenticateToken,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page doit être un entier positif'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limite doit être entre 1 et 100'),
    query('statut').optional().isIn(['EN_ATTENTE', 'CONFIRMEE', 'ANNULEE', 'TERMINEE']).withMessage('Statut invalide'),
    query('dateDebut').optional().isISO8601().withMessage('Date de début invalide'),
    query('dateFin').optional().isISO8601().withMessage('Date de fin invalide')
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
      search = ''
    } = req.query;

    try {
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Construire les filtres
      const where = {};
      
      // Si pas admin, voir seulement ses réservations
      if (req.user.role !== 'ADMIN') {
        where.utilisateurId = req.user.id;
      }

      if (statut) {
        where.statut = statut;
      }

      if (dateDebut || dateFin) {
        where.date = {};
        if (dateDebut) {
          where.date.gte = new Date(dateDebut);
        }
        if (dateFin) {
          where.date.lte = new Date(dateFin);
        }
      }

      if (search) {
        where.OR = [
          { numero: { contains: search } },
          { telephone: { contains: search } },
          { commentaires: { contains: search } },
          { utilisateur: { nom: { contains: search } } },
          { utilisateur: { email: { contains: search } } }
        ];
      }

      // Récupérer les réservations avec pagination
      const [reservations, total] = await Promise.all([
        prisma.reservation.findMany({
          where,
          include: {
            utilisateur: {
              select: {
                id: true,
                nom: true,
                email: true,
                telephone: true
              }
            }
          },
          skip,
          take: parseInt(limit),
          orderBy: [
            { date: 'desc' },
            { heure: 'desc' }
          ]
        }),
        prisma.reservation.count({ where })
      ]);

      res.json({
        reservations,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Erreur récupération réservations:', error);
      res.status(500).json({
        error: "Erreur interne du serveur",
        code: "INTERNAL_ERROR"
      });
    }
  }
);

// ✅ Récupérer une réservation par ID
router.get('/:id',
  authenticateToken,
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
      const reservation = await prisma.reservation.findUnique({
        where: { id: parseInt(req.params.id) },
        include: {
          utilisateur: {
            select: {
              id: true,
              nom: true,
              email: true,
              telephone: true
            }
          }
        }
      });

      if (!reservation) {
        return res.status(404).json({
          error: "Réservation non trouvée",
          code: "RESERVATION_NOT_FOUND"
        });
      }

      // Vérifier les droits d'accès
      if (req.user.role !== 'ADMIN' && reservation.utilisateurId !== req.user.id) {
        return res.status(403).json({
          error: "Accès interdit",
          code: "ACCESS_DENIED"
        });
      }

      res.json(reservation);
    } catch (error) {
      console.error('Erreur récupération réservation:', error);
      res.status(500).json({
        error: "Erreur interne du serveur",
        code: "INTERNAL_ERROR"
      });
    }
  }
);

// ✅ Modifier une réservation
router.put('/:id',
  authenticateToken,
  [
    param('id').isInt().withMessage('ID invalide'),
    body('date').optional().isISO8601().withMessage('Date de réservation invalide'),
    body('heure').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Heure invalide'),
    body('nPersonnes').optional().isInt({ min: 1, max: 20 }).withMessage('Nombre de personnes invalide'),
    body('commentaires').optional().isLength({ max: 500 }).withMessage('Commentaires trop longs'),
    body('telephone').optional().isMobilePhone('fr-FR').withMessage('Téléphone invalide'),
    body('statut').optional().isIn(['EN_ATTENTE', 'CONFIRMEE', 'ANNULEE', 'TERMINEE']).withMessage('Statut invalide')
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
      // Vérifier que la réservation existe
      const reservationExistante = await prisma.reservation.findUnique({
        where: { id: parseInt(req.params.id) }
      });

      if (!reservationExistante) {
        return res.status(404).json({
          error: "Réservation non trouvée",
          code: "RESERVATION_NOT_FOUND"
        });
      }

      // Vérifier les droits de modification
      if (req.user.role !== 'ADMIN' && reservationExistante.utilisateurId !== req.user.id) {
        return res.status(403).json({
          error: "Accès interdit",
          code: "ACCESS_DENIED"
        });
      }

      // Les utilisateurs normaux ne peuvent modifier que certains champs
      const allowedFields = req.user.role === 'ADMIN' 
        ? req.body 
        : {
            date: req.body.date,
            heure: req.body.heure,
            nbPersonnes: req.body.nbPersonnes,
            commentaires: req.body.commentaires,
            telephone: req.body.telephone
          };

      // Filtrer les champs undefined
      const updateData = {};
      Object.keys(allowedFields).forEach(key => {
        if (allowedFields[key] !== undefined) {
          if (key === 'dateReservation') {
            updateData[key] = new Date(allowedFields[key]);
          } else if (key === 'nombrePersonnes') {
            updateData[key] = parseInt(allowedFields[key]);
          } else {
            updateData[key] = allowedFields[key];
          }
        }
      });

      // Vérifier si changement de date/heure et disponibilité
      if (updateData.date || updateData.heure || updateData.nbPersonnes) {
        const nouvelleDateReservation = updateData.date || reservationExistante.date;
        const nouvelleHeureReservation = updateData.heure || reservationExistante.heure;
        const nouveauNombrePersonnes = updateData.nbPersonnes || reservationExistante.nbPersonnes;

        // Vérifier capacité (exclure la réservation actuelle)
        const reservationsExistantes = await prisma.reservation.aggregate({
          where: {
            id: { not: parseInt(req.params.id) },
            date: nouvelleDateReservation,
            heure: nouvelleHeureReservation,
            statut: { in: ['EN_ATTENTE', 'CONFIRMEE'] }
          },
          _sum: { nbPersonnes: true }
        });

        const personnesDejaReservees = reservationsExistantes._sum.nbPersonnes || 0;
        const capaciteMax = 50;
        
        if (personnesDejaReservees + nouveauNombrePersonnes > capaciteMax) {
          return res.status(400).json({
            error: `Capacité insuffisante. Seulement ${capaciteMax - personnesDejaReservees} places disponibles`,
            code: "INSUFFICIENT_CAPACITY"
          });
        }
      }

      // Mettre à jour la réservation
      const reservationMiseAJour = await prisma.reservation.update({
        where: { id: parseInt(req.params.id) },
        data: updateData,
        include: {
          utilisateur: {
            select: {
              id: true,
              nom: true,
              email: true,
              telephone: true
            }
          }
        }
      });

      // Notification si changement de statut par admin
      if (req.user.role === 'ADMIN' && updateData.statut && updateData.statut !== reservationExistante.statut) {
        await notificationService.notifyReservationStatusChange(reservationMiseAJour, reservationExistante.statut);
      }

      res.json({
        success: true,
        message: "Réservation mise à jour avec succès",
        reservation: reservationMiseAJour
      });
    } catch (error) {
      console.error('Erreur modification réservation:', error);
      res.status(500).json({
        error: "Erreur interne du serveur",
        code: "INTERNAL_ERROR"
      });
    }
  }
);

// ✅ Supprimer une réservation
router.delete('/:id',
  authenticateToken,
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
      // Vérifier que la réservation existe
      const reservation = await prisma.reservation.findUnique({
        where: { id: parseInt(req.params.id) }
      });

      if (!reservation) {
        return res.status(404).json({
          error: "Réservation non trouvée",
          code: "RESERVATION_NOT_FOUND"
        });
      }

      // Vérifier les droits de suppression
      if (req.user.role !== 'ADMIN' && reservation.utilisateurId !== req.user.id) {
        return res.status(403).json({
          error: "Accès interdit",
          code: "ACCESS_DENIED"
        });
      }

      // Supprimer la réservation
      await prisma.reservation.delete({
        where: { id: parseInt(req.params.id) }
      });

      res.json({
        success: true,
        message: "Réservation supprimée avec succès"
      });
    } catch (error) {
      console.error('Erreur suppression réservation:', error);
      res.status(500).json({
        error: "Erreur interne du serveur",
        code: "INTERNAL_ERROR"
      });
    }
  }
);

// ✅ Créneaux disponibles pour une date donnée
router.get('/availability/:date',
  [param('date').isISO8601().withMessage('Date invalide')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Date invalide",
        details: errors.array(),
        code: "VALIDATION_ERROR"
      });
    }

    try {
      const date = new Date(req.params.date);
      
      // Créneaux horaires disponibles
      const creneaux = [
        '11:30', '12:00', '12:30', '13:00', '13:30',
        '19:00', '19:30', '20:00', '20:30', '21:00'
      ];

      const capaciteMax = 50;
      const disponibilites = [];

      for (const creneau of creneaux) {
        const reservationsExistantes = await prisma.reservation.aggregate({
          where: {
            date: date,
            heure: creneau,
            statut: { in: ['EN_ATTENTE', 'CONFIRMEE'] }
          },
          _sum: { nombrePersonnes: true }
        });

        const personnesReservees = reservationsExistantes._sum.nombrePersonnes || 0;
        const placesDisponibles = capaciteMax - personnesReservees;

        disponibilites.push({
          heure: creneau,
          placesDisponibles,
          complet: placesDisponibles <= 0
        });
      }

      res.json({
        date: req.params.date,
        creneaux: disponibilites
      });
    } catch (error) {
      console.error('Erreur vérification disponibilités:', error);
      res.status(500).json({
        error: "Erreur interne du serveur",
        code: "INTERNAL_ERROR"
      });
    }
  }
);

// ✅ Statistiques des réservations (admin seulement)
router.get('/stats/dashboard',
  authenticateToken,
  authorizeRole('ADMIN'),
  async (req, res) => {
    try {
      const [
        totalReservations,
        reservationsEnAttente,
        reservationsConfirmees,
        reservationsAnnulees,
        reservationsAujourdhui,
        reservationsSemaine,
        moyennePersonnesParReservation
      ] = await Promise.all([
        prisma.reservation.count(),
        prisma.reservation.count({ where: { statut: 'EN_ATTENTE' } }),
        prisma.reservation.count({ where: { statut: 'CONFIRMEE' } }),
        prisma.reservation.count({ where: { statut: 'ANNULEE' } }),
        prisma.reservation.count({
          where: {
            dateReservation: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
              lt: new Date(new Date().setHours(23, 59, 59, 999))
            }
          }
        }),
        prisma.reservation.count({
          where: {
            dateReservation: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
          }
        }),
        prisma.reservation.aggregate({
          _avg: { nombrePersonnes: true }
        })
      ]);

      res.json({
        total: totalReservations,
        enAttente: reservationsEnAttente,
        confirmees: reservationsConfirmees,
        annulees: reservationsAnnulees,
        aujourdhui: reservationsAujourdhui,
        semaine: reservationsSemaine,
        moyennePersonnes: Math.round(moyennePersonnesParReservation._avg.nombrePersonnes || 0)
      });
    } catch (error) {
      console.error('Erreur statistiques réservations:', error);
      res.status(500).json({
        error: "Erreur interne du serveur",
        code: "INTERNAL_ERROR"
      });
    }
  }
);

// ✅ Annuler une réservation
router.patch('/:id/annuler',
  authenticateToken,
  async (req, res) => {
    try {
      const reservationId = parseInt(req.params.id);
      const userId = req.user.id;

      console.log('🚫 Demande d\'annulation - Réservation ID:', reservationId, 'par utilisateur ID:', userId);

      // Vérifier que la réservation existe et appartient à l'utilisateur
      const reservation = await prisma.reservation.findFirst({
        where: {
          id: reservationId,
          utilisateurId: userId
        }
      });

      if (!reservation) {
        return res.status(404).json({
          error: "Réservation non trouvée",
          code: "RESERVATION_NOT_FOUND"
        });
      }

      // Vérifier que la réservation peut être annulée
      if (!['EN_ATTENTE', 'CONFIRMEE'].includes(reservation.statut)) {
        return res.status(400).json({
          error: "Cette réservation ne peut pas être annulée",
          code: "CANNOT_CANCEL"
        });
      }

      // Vérifier que la réservation n'est pas passée
      const reservationDateTime = new Date(`${reservation.date.toISOString().split('T')[0]}T${reservation.heure}:00`);
      if (reservationDateTime < new Date()) {
        return res.status(400).json({
          error: "Impossible d'annuler une réservation passée",
          code: "PAST_RESERVATION"
        });
      }

      // Annuler la réservation
      const reservationAnnulee = await prisma.reservation.update({
        where: { id: reservationId },
        data: { 
          statut: 'ANNULEE',
          dateModification: new Date()
        },
        include: {
          utilisateur: {
            select: {
              nom: true,
              email: true,
              telephone: true
            }
          }
        }
      });

      console.log('✅ Réservation annulée:', reservationAnnulee.numero);

      res.json({
        success: true,
        message: "Réservation annulée avec succès",
        reservation: {
          id: reservationAnnulee.id.toString(),
          numero: reservationAnnulee.numero,
          statut: reservationAnnulee.statut,
          dateModification: reservationAnnulee.dateModification.toISOString()
        }
      });

    } catch (error) {
      console.error('❌ Erreur lors de l\'annulation:', error);
      res.status(500).json({
        error: "Erreur serveur lors de l'annulation",
        code: "SERVER_ERROR"
      });
    }
  }
);

module.exports = router;