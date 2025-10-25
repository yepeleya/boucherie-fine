const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, authorizeRole } = require('../middlewares/auth');
const { body, param, query, validationResult } = require('express-validator');
const notificationService = require('../services/notificationService');

const prisma = new PrismaClient();
const router = express.Router();

// ✅ Créer une nouvelle commande
router.post('/',
  authenticateToken,
  [
    body('produits').isArray({ min: 1 }).withMessage('Au moins un produit requis'),
    body('produits.*.produitId').isInt().withMessage('ID produit invalide'),
    body('produits.*.quantite').isInt({ min: 1 }).withMessage('Quantité invalide'),
    body('typeCommande').isIn(['LIVRAISON', 'A_EMPORTER']).withMessage('Type de commande invalide'),
    body('adresseLivraison').optional().isLength({ min: 5, max: 200 }).withMessage('Adresse de livraison invalide'),
    body('telephone').isMobilePhone('fr-FR').withMessage('Numéro de téléphone invalide'),
    body('commentaires').optional().isLength({ max: 500 }).withMessage('Commentaires trop longs'),
    body('dateLivraisonSouhaitee').optional().isISO8601().withMessage('Date de livraison invalide')
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
      produits,
      typeCommande,
      adresseLivraison = '',
      telephone,
      commentaires = '',
      dateLivraisonSouhaitee
    } = req.body;

    try {
      // Vérifier que tous les produits existent et sont disponibles
      const produitIds = produits.map(p => p.produitId);
      const produitsExistants = await prisma.produit.findMany({
        where: {
          id: { in: produitIds },
          disponible: true
        }
      });

      if (produitsExistants.length !== produitIds.length) {
        return res.status(400).json({
          error: "Un ou plusieurs produits sont indisponibles",
          code: "PRODUCTS_UNAVAILABLE"
        });
      }

      // Vérifier le stock pour chaque produit
      for (const produitCommande of produits) {
        const produit = produitsExistants.find(p => p.id === produitCommande.produitId);
        if (produit.stock < produitCommande.quantite) {
          return res.status(400).json({
            error: `Stock insuffisant pour ${produit.nom}. Stock disponible: ${produit.stock}`,
            code: "INSUFFICIENT_STOCK",
            produit: produit.nom
          });
        }
      }

      // Calculer le total
      let total = 0;
      const detailsProduits = [];
      
      for (const produitCommande of produits) {
        const produit = produitsExistants.find(p => p.id === produitCommande.produitId);
        const sousTotal = produit.prix * produitCommande.quantite;
        total += sousTotal;
        
        detailsProduits.push({
          produitId: produit.id,
          quantite: produitCommande.quantite,
          prixUnitaire: produit.prix,
          sousTotal
        });
      }

      // Générer un numéro de commande unique
      const numeroCommande = `CMD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      // Créer la commande avec ses produits
      const commande = await prisma.commande.create({
        data: {
          numero: numeroCommande,
          utilisateurId: req.user.id,
          typeCommande,
          adresseLivraison: typeCommande === 'LIVRAISON' ? adresseLivraison : '',
          telephone,
          commentaires,
          dateLivraisonSouhaitee: dateLivraisonSouhaitee ? new Date(dateLivraisonSouhaitee) : null,
          total,
          statut: 'EN_ATTENTE',
          produits: {
            create: detailsProduits
          }
        },
        include: {
          utilisateur: {
            select: {
              id: true,
              nom: true,
              email: true,
              telephone: true
            }
          },
          produits: {
            include: {
              produit: {
                select: {
                  id: true,
                  nom: true,
                  prix: true,
                  imageUrl: true
                }
              }
            }
          }
        }
      });

      // Décrémenter le stock des produits
      for (const produitCommande of produits) {
        await prisma.produit.update({
          where: { id: produitCommande.produitId },
          data: {
            stock: {
              decrement: produitCommande.quantite
            }
          }
        });
      }

      // Envoyer notification
      await notificationService.notifyNewOrder(commande);

      res.status(201).json({
        success: true,
        message: "Commande créée avec succès",
        commande: {
          id: commande.id,
          numero: commande.numero,
          typeCommande: commande.typeCommande,
          total: commande.total,
          statut: commande.statut,
          date: commande.date,
          produits: commande.produits
        }
      });
    } catch (error) {
      console.error('Erreur création commande:', error);
      res.status(500).json({
        error: "Erreur interne du serveur",
        code: "INTERNAL_ERROR"
      });
    }
  }
);

// ✅ Lister toutes les commandes avec filtres
router.get('/',
  authenticateToken,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page doit être un entier positif'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limite doit être entre 1 et 100'),
    query('statut').optional().isIn(['EN_ATTENTE', 'CONFIRMEE', 'EN_PREPARATION', 'PRETE', 'LIVREE', 'ANNULEE']).withMessage('Statut invalide'),
    query('typeCommande').optional().isIn(['LIVRAISON', 'A_EMPORTER']).withMessage('Type de commande invalide'),
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
      typeCommande = '',
      dateDebut = '',
      dateFin = '',
      search = ''
    } = req.query;

    try {
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Construire les filtres
      const where = {};
      
      // Si pas admin, voir seulement ses commandes
      if (req.user.role !== 'ADMIN') {
        where.utilisateurId = req.user.id;
      }

      if (statut) {
        where.statut = statut;
      }

      if (typeCommande) {
        where.typeCommande = typeCommande;
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
          { adresseLivraison: { contains: search } },
          { utilisateur: { nom: { contains: search } } },
          { utilisateur: { email: { contains: search } } }
        ];
      }

      // Récupérer les commandes avec pagination
      const [commandes, total] = await Promise.all([
        prisma.commande.findMany({
          where,
          include: {
            utilisateur: {
              select: {
                id: true,
                nom: true,
                email: true,
                telephone: true
              }
            },
            produits: {
              include: {
                produit: {
                  select: {
                    id: true,
                    nom: true,
                    prix: true,
                    imageUrl: true
                  }
                }
              }
            },
            paiements: {
              select: {
                id: true,
                statut: true,
                montant: true,
                modePaiement: true
              }
            }
          },
          skip,
          take: parseInt(limit),
          orderBy: { date: 'desc' }
        }),
        prisma.commande.count({ where })
      ]);

      res.json({
        commandes,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Erreur récupération commandes:', error);
      res.status(500).json({
        error: "Erreur interne du serveur",
        code: "INTERNAL_ERROR"
      });
    }
  }
);

// ✅ Récupérer une commande par ID
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
      const commande = await prisma.commande.findUnique({
        where: { id: parseInt(req.params.id) },
        include: {
          utilisateur: {
            select: {
              id: true,
              nom: true,
              email: true,
              telephone: true
            }
          },
          produits: {
            include: {
              produit: {
                select: {
                  id: true,
                  nom: true,
                  prix: true,
                  imageUrl: true,
                  description: true
                }
              }
            }
          },
          paiements: {
            select: {
              id: true,
              numero: true,
              statut: true,
              montant: true,
              modePaiement: true,
              date: true,
              datePaiement: true
            }
          }
        }
      });

      if (!commande) {
        return res.status(404).json({
          error: "Commande non trouvée",
          code: "ORDER_NOT_FOUND"
        });
      }

      // Vérifier les droits d'accès
      if (req.user.role !== 'ADMIN' && commande.utilisateurId !== req.user.id) {
        return res.status(403).json({
          error: "Accès interdit",
          code: "ACCESS_DENIED"
        });
      }

      res.json(commande);
    } catch (error) {
      console.error('Erreur récupération commande:', error);
      res.status(500).json({
        error: "Erreur interne du serveur",
        code: "INTERNAL_ERROR"
      });
    }
  }
);

// ✅ Modifier le statut d'une commande (admin seulement)
router.patch('/:id/statut',
  authenticateToken,
  authorizeRole('ADMIN'),
  [
    param('id').isInt().withMessage('ID invalide'),
    body('statut').isIn(['EN_ATTENTE', 'CONFIRMEE', 'EN_PREPARATION', 'PRETE', 'LIVREE', 'ANNULEE']).withMessage('Statut invalide'),
    body('commentaireAdmin').optional().isLength({ max: 500 }).withMessage('Commentaire admin trop long')
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

    const { statut, commentaireAdmin = '' } = req.body;

    try {
      // Vérifier que la commande existe
      const commandeExistante = await prisma.commande.findUnique({
        where: { id: parseInt(req.params.id) },
        include: {
          utilisateur: true,
          produits: {
            include: {
              produit: true
            }
          }
        }
      });

      if (!commandeExistante) {
        return res.status(404).json({
          error: "Commande non trouvée",
          code: "ORDER_NOT_FOUND"
        });
      }

      // Vérifier la logique des transitions de statut
      const statutsOrdonnes = ['EN_ATTENTE', 'CONFIRMEE', 'EN_PREPARATION', 'PRETE', 'LIVREE'];
      const statutActuelIndex = statutsOrdonnes.indexOf(commandeExistante.statut);
      const nouveauStatutIndex = statutsOrdonnes.indexOf(statut);

      // Permettre annulation à tout moment, mais pas de retour en arrière pour les autres statuts
      if (statut !== 'ANNULEE' && nouveauStatutIndex < statutActuelIndex) {
        return res.status(400).json({
          error: "Transition de statut invalide",
          code: "INVALID_STATUS_TRANSITION"
        });
      }

      // Si annulation, remettre les produits en stock
      if (statut === 'ANNULEE' && commandeExistante.statut !== 'ANNULEE') {
        for (const commandeProduit of commandeExistante.produits) {
          await prisma.produit.update({
            where: { id: commandeProduit.produitId },
            data: {
              stock: {
                increment: commandeProduit.quantite
              }
            }
          });
        }
      }

      // Mettre à jour la commande
      const commandeMiseAJour = await prisma.commande.update({
        where: { id: parseInt(req.params.id) },
        data: {
          statut,
          commentaireAdmin,
          dateLivraison: statut === 'LIVREE' ? new Date() : undefined
        },
        include: {
          utilisateur: {
            select: {
              id: true,
              nom: true,
              email: true,
              telephone: true
            }
          },
          produits: {
            include: {
              produit: {
                select: {
                  id: true,
                  nom: true,
                  prix: true,
                  imageUrl: true
                }
              }
            }
          }
        }
      });

      // Envoyer notification de changement de statut
      await notificationService.notifyOrderStatusChange(commandeMiseAJour, commandeExistante.statut);

      res.json({
        success: true,
        message: "Statut de la commande mis à jour avec succès",
        commande: commandeMiseAJour
      });
    } catch (error) {
      console.error('Erreur modification statut commande:', error);
      res.status(500).json({
        error: "Erreur interne du serveur",
        code: "INTERNAL_ERROR"
      });
    }
  }
);

// ✅ Annuler une commande (client ou admin)
router.patch('/:id/annuler',
  authenticateToken,
  [
    param('id').isInt().withMessage('ID invalide'),
    body('raisonAnnulation').optional().isLength({ max: 500 }).withMessage('Raison d\'annulation trop longue')
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

    const { raisonAnnulation = '' } = req.body;

    try {
      // Vérifier que la commande existe
      const commande = await prisma.commande.findUnique({
        where: { id: parseInt(req.params.id) },
        include: {
          produits: {
            include: {
              produit: true
            }
          }
        }
      });

      if (!commande) {
        return res.status(404).json({
          error: "Commande non trouvée",
          code: "ORDER_NOT_FOUND"
        });
      }

      // Vérifier les droits d'annulation
      if (req.user.role !== 'ADMIN' && commande.utilisateurId !== req.user.id) {
        return res.status(403).json({
          error: "Accès interdit",
          code: "ACCESS_DENIED"
        });
      }

      // Vérifier que la commande peut être annulée
      if (commande.statut === 'ANNULEE') {
        return res.status(400).json({
          error: "Cette commande est déjà annulée",
          code: "ORDER_ALREADY_CANCELLED"
        });
      }

      if (commande.statut === 'LIVREE') {
        return res.status(400).json({
          error: "Impossible d'annuler une commande déjà livrée",
          code: "CANNOT_CANCEL_DELIVERED_ORDER"
        });
      }

      // Les clients ne peuvent annuler que si la commande n'est pas encore en préparation
      if (req.user.role !== 'ADMIN' && ['EN_PREPARATION', 'PRETE'].includes(commande.statut)) {
        return res.status(400).json({
          error: "Impossible d'annuler une commande en cours de préparation",
          code: "CANNOT_CANCEL_IN_PREPARATION"
        });
      }

      // Remettre les produits en stock
      for (const commandeProduit of commande.produits) {
        await prisma.produit.update({
          where: { id: commandeProduit.produitId },
          data: {
            stock: {
              increment: commandeProduit.quantite
            }
          }
        });
      }

      // Mettre à jour la commande
      const commandeAnnulee = await prisma.commande.update({
        where: { id: parseInt(req.params.id) },
        data: {
          statut: 'ANNULEE',
          commentaireAdmin: req.user.role === 'ADMIN' ? raisonAnnulation : commande.commentaireAdmin,
          commentaires: req.user.role !== 'ADMIN' ? 
            `${commande.commentaires}\n\nAnnulée par le client: ${raisonAnnulation}`.trim() : 
            commande.commentaires
        },
        include: {
          utilisateur: {
            select: {
              id: true,
              nom: true,
              email: true
            }
          }
        }
      });

      // Notification d'annulation
      await notificationService.notifyOrderCancellation(commandeAnnulee, req.user.role === 'ADMIN');

      res.json({
        success: true,
        message: "Commande annulée avec succès",
        commande: commandeAnnulee
      });
    } catch (error) {
      console.error('Erreur annulation commande:', error);
      res.status(500).json({
        error: "Erreur interne du serveur",
        code: "INTERNAL_ERROR"
      });
    }
  }
);

// ✅ Statistiques des commandes (admin seulement)
router.get('/stats/dashboard',
  authenticateToken,
  authorizeRole('ADMIN'),
  async (req, res) => {
    try {
      const [
        totalCommandes,
        commandesEnAttente,
        commandesEnCours,
        commandesLivrees,
        commandesAnnulees,
        chiffreAffairesTotal,
        commandesAujourdhui,
        commandesSemaine,
        moyennePanier
      ] = await Promise.all([
        prisma.commande.count(),
        prisma.commande.count({ where: { statut: 'EN_ATTENTE' } }),
        prisma.commande.count({ 
          where: { 
            statut: { 
              in: ['CONFIRMEE', 'EN_PREPARATION', 'PRETE'] 
            } 
          } 
        }),
        prisma.commande.count({ where: { statut: 'LIVREE' } }),
        prisma.commande.count({ where: { statut: 'ANNULEE' } }),
        prisma.commande.aggregate({
          where: { statut: { not: 'ANNULEE' } },
          _sum: { total: true }
        }),
        prisma.commande.count({
          where: {
            date: {
              gte: new Date(new Date().setHours(0, 0, 0, 0))
            }
          }
        }),
        prisma.commande.count({
          where: {
            date: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
          }
        }),
        prisma.commande.aggregate({
          where: { statut: { not: 'ANNULEE' } },
          _avg: { total: true }
        })
      ]);

      const tauxLivraison = totalCommandes > 0 
        ? ((commandesLivrees / totalCommandes) * 100).toFixed(1)
        : 0;

      res.json({
        total: totalCommandes,
        enAttente: commandesEnAttente,
        enCours: commandesEnCours,
        livrees: commandesLivrees,
        annulees: commandesAnnulees,
        chiffreAffaires: chiffreAffairesTotal._sum.total || 0,
        tauxLivraison: parseFloat(tauxLivraison),
        aujourdhui: commandesAujourdhui,
        semaine: commandesSemaine,
        moyennePanier: Math.round((moyennePanier._avg.total || 0) * 100) / 100
      });
    } catch (error) {
      console.error('Erreur statistiques commandes:', error);
      res.status(500).json({
        error: "Erreur interne du serveur",
        code: "INTERNAL_ERROR"
      });
    }
  }
);

module.exports = router;