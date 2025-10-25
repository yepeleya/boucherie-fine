const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, authorizeRole } = require('../middlewares/auth');
const { PayDunyaService, FusionMoneyService } = require('../services/paymentServices');
const notificationService = require('../services/notificationService');

const prisma = new PrismaClient();
const router = express.Router();

// ✅ Initier un paiement
router.post('/request', authenticateToken, async (req, res) => {
  const { commandeId, modePaiement, montant, returnUrl, cancelUrl } = req.body;
  
  try {
    // Vérifier que la commande existe et appartient à l'utilisateur
    const commande = await prisma.commande.findFirst({
      where: {
        id: parseInt(commandeId),
        utilisateurId: req.user.id
      },
      include: {
        utilisateur: true
      }
    });

    if (!commande) {
      return res.status(404).json({
        error: "Commande non trouvée",
        code: "ORDER_NOT_FOUND"
      });
    }

    // Créer l'enregistrement de paiement
    const paiement = await prisma.paiement.create({
      data: {
        commandeId: parseInt(commandeId),
        montant: parseFloat(montant),
        modePaiement,
        statut: 'EN_ATTENTE'
      }
    });

    let paymentResult = null;
    const callbackUrl = `${req.protocol}://${req.get('host')}/api/paiements/webhook`;

    // Traitement selon le mode de paiement
    switch (modePaiement) {
      case 'PAYDUNYA':
        const paydunyaService = new PayDunyaService();
        paymentResult = await paydunyaService.initiatePayment({
          montant,
          description: `Commande #${commande.numero}`,
          returnUrl,
          cancelUrl,
          callbackUrl,
          customerEmail: commande.utilisateur.email,
          customerName: commande.utilisateur.nom
        });
        break;

      case 'FUSION_MONEY':
        const fusionService = new FusionMoneyService();
        paymentResult = await fusionService.initiatePayment({
          montant,
          description: `Commande #${commande.numero}`,
          returnUrl,
          cancelUrl,
          callbackUrl,
          customerEmail: commande.utilisateur.email,
          customerName: commande.utilisateur.nom
        });
        break;

      case 'MOBILE_MONEY':
      case 'CARTE':
        // Pour ces modes, on utilise PayDunya par défaut
        const defaultService = new PayDunyaService();
        paymentResult = await defaultService.initiatePayment({
          montant,
          description: `Commande #${commande.numero}`,
          returnUrl,
          cancelUrl,
          callbackUrl
        });
        break;

      default:
        return res.status(400).json({
          error: "Mode de paiement non supporté",
          code: "UNSUPPORTED_PAYMENT_METHOD"
        });
    }

    if (paymentResult.success) {
      // Mettre à jour le paiement avec les informations du provider
      await prisma.paiement.update({
        where: { id: paiement.id },
        data: {
          referenceExterne: paymentResult.token || paymentResult.transactionId,
          donneesCallback: JSON.stringify(paymentResult)
        }
      });

      res.json({
        success: true,
        paiementId: paiement.id,
        paymentUrl: paymentResult.paymentUrl,
        reference: paymentResult.token || paymentResult.reference
      });
    } else {
      // Marquer le paiement comme échoué
      await prisma.paiement.update({
        where: { id: paiement.id },
        data: { statut: 'ECHEC' }
      });

      res.status(400).json({
        error: paymentResult.error || "Erreur lors de l'initiation du paiement",
        code: "PAYMENT_INITIATION_FAILED"
      });
    }
  } catch (error) {
    console.error('Erreur initiation paiement:', error);
    res.status(500).json({
      error: "Erreur interne du serveur",
      code: "INTERNAL_ERROR"
    });
  }
});

// ✅ Webhook pour les callbacks de paiement
router.post('/webhook', async (req, res) => {
  try {
    console.log('Webhook reçu:', req.body);
    
    const { token, transaction_id, status, amount, reference } = req.body;
    
    // Identifier le paiement selon le provider
    let paiement = null;
    if (token) {
      // PayDunya
      paiement = await prisma.paiement.findFirst({
        where: { referenceExterne: token },
        include: { commande: true }
      });
    } else if (transaction_id) {
      // Fusion Money
      paiement = await prisma.paiement.findFirst({
        where: { referenceExterne: transaction_id },
        include: { commande: true }
      });
    }

    if (!paiement) {
      console.log('Paiement non trouvé pour le webhook');
      return res.status(404).json({ error: "Paiement non trouvé" });
    }

    // Déterminer le nouveau statut
    let nouveauStatut = 'EN_ATTENTE';
    if (status === 'completed' || status === 'success') {
      nouveauStatut = 'REUSSI';
    } else if (status === 'failed' || status === 'cancelled') {
      nouveauStatut = 'ECHEC';
    }

    // Mettre à jour le paiement
    const paiementMisAJour = await prisma.paiement.update({
      where: { id: paiement.id },
      data: {
        statut: nouveauStatut,
        datePaiement: nouveauStatut === 'REUSSI' ? new Date() : null,
        donneesCallback: JSON.stringify(req.body)
      }
    });

    // Si le paiement est réussi, mettre à jour la commande
    if (nouveauStatut === 'REUSSI') {
      await prisma.commande.update({
        where: { id: paiement.commandeId },
        data: { statut: 'CONFIRMEE' }
      });
    }

    // Envoyer une notification
    await notificationService.notifyPayment(paiementMisAJour, paiement.commande);

    res.json({ success: true, message: "Webhook traité avec succès" });
  } catch (error) {
    console.error('Erreur webhook paiement:', error);
    res.status(500).json({ error: "Erreur interne" });
  }
});

// ✅ Vérifier le statut d'un paiement
router.get('/:id/status', authenticateToken, async (req, res) => {
  try {
    const paiement = await prisma.paiement.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        commande: {
          include: {
            utilisateur: true
          }
        }
      }
    });

    if (!paiement) {
      return res.status(404).json({
        error: "Paiement non trouvé",
        code: "PAYMENT_NOT_FOUND"
      });
    }

    // Vérifier que l'utilisateur a le droit de voir ce paiement
    if (req.user.role !== 'ADMIN' && paiement.commande.utilisateurId !== req.user.id) {
      return res.status(403).json({
        error: "Accès interdit",
        code: "ACCESS_DENIED"
      });
    }

    res.json({
      id: paiement.id,
      numero: paiement.numero,
      montant: paiement.montant,
      statut: paiement.statut,
      modePaiement: paiement.modePaiement,
      date: paiement.date,
      datePaiement: paiement.datePaiement,
      commande: {
        id: paiement.commande.id,
        numero: paiement.commande.numero
      }
    });
  } catch (error) {
    console.error('Erreur vérification paiement:', error);
    res.status(500).json({
      error: "Erreur interne du serveur",
      code: "INTERNAL_ERROR"
    });
  }
});

// ✅ Lister les paiements (admin ou utilisateur propriétaire)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, statut = '', modePaiement = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Construire les filtres
    const where = {};
    if (req.user.role !== 'ADMIN') {
      // Les utilisateurs normaux ne voient que leurs paiements
      where.commande = {
        utilisateurId: req.user.id
      };
    }
    if (statut) {
      where.statut = statut;
    }
    if (modePaiement) {
      where.modePaiement = modePaiement;
    }

    // Récupérer les paiements avec pagination
    const [paiements, total] = await Promise.all([
      prisma.paiement.findMany({
        where,
        include: {
          commande: {
            include: {
              utilisateur: {
                select: {
                  id: true,
                  nom: true,
                  email: true
                }
              }
            }
          }
        },
        skip,
        take: parseInt(limit),
        orderBy: { date: 'desc' }
      }),
      prisma.paiement.count({ where })
    ]);

    res.json({
      paiements,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erreur récupération paiements:', error);
    res.status(500).json({
      error: "Erreur interne du serveur",
      code: "INTERNAL_ERROR"
    });
  }
});

// ✅ Statistiques des paiements (admin seulement)
router.get('/stats/dashboard', authenticateToken, authorizeRole('ADMIN'), async (req, res) => {
  try {
    const [
      totalPaiements,
      paiementsReussis,
      paiementsEnAttente,
      paiementsEchec,
      chiffreAffaires,
      paiementsDuJour,
      paiementsDeLaSemaine
    ] = await Promise.all([
      prisma.paiement.count(),
      prisma.paiement.count({ where: { statut: 'REUSSI' } }),
      prisma.paiement.count({ where: { statut: 'EN_ATTENTE' } }),
      prisma.paiement.count({ where: { statut: 'ECHEC' } }),
      prisma.paiement.aggregate({
        where: { statut: 'REUSSI' },
        _sum: { montant: true }
      }),
      prisma.paiement.count({
        where: {
          date: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      prisma.paiement.count({
        where: {
          date: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      })
    ]);

    const tauxReussite = totalPaiements > 0 
      ? ((paiementsReussis / totalPaiements) * 100).toFixed(1)
      : 0;

    res.json({
      total: totalPaiements,
      reussis: paiementsReussis,
      enAttente: paiementsEnAttente,
      echec: paiementsEchec,
      chiffreAffaires: chiffreAffaires._sum.montant || 0,
      tauxReussite: parseFloat(tauxReussite),
      aujourdhui: paiementsDuJour,
      semaine: paiementsDeLaSemaine
    });
  } catch (error) {
    console.error('Erreur statistiques paiements:', error);
    res.status(500).json({
      error: "Erreur interne du serveur",
      code: "INTERNAL_ERROR"
    });
  }
});

module.exports = router;