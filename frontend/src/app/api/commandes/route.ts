import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// POST /api/commandes - Créer une nouvelle commande
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
    }

    const user = await verifyToken(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      items, 
      total, 
      adresseLivraison, 
      telephone, 
      typeCommande = 'CLICK_COLLECT',
      heureRetrait,
      notes,
      modePaiement = 'CINETPAY'
    } = body;

    // Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Articles requis' }, 
        { status: 400 }
      );
    }

    if (!total || total <= 0) {
      return NextResponse.json(
        { error: 'Total invalide' }, 
        { status: 400 }
      );
    }

    if (typeCommande === 'LIVRAISON' && !adresseLivraison) {
      return NextResponse.json(
        { error: 'Adresse de livraison requise' }, 
        { status: 400 }
      );
    }

    // Vérifier la disponibilité des produits et calculer le total réel
    let totalCalcule = 0;
    const produitsDetails = [];

    for (const item of items) {
      const produit = await prisma.produit.findUnique({
        where: { id: item.produitId }
      });

      if (!produit) {
        return NextResponse.json(
          { error: `Produit ${item.produitId} introuvable` }, 
          { status: 400 }
        );
      }

      if (!produit.disponible) {
        return NextResponse.json(
          { error: `Produit ${produit.nom} non disponible` }, 
          { status: 400 }
        );
      }

      if (produit.stock && produit.stock < item.quantite) {
        return NextResponse.json(
          { error: `Stock insuffisant pour ${produit.nom}` }, 
          { status: 400 }
        );
      }

      const sousTotal = produit.prix * item.quantite;
      totalCalcule += sousTotal;

      produitsDetails.push({
        produitId: produit.id,
        quantite: item.quantite,
        prixUnitaire: produit.prix,
        sousTotal
      });
    }

    // Vérifier que le total envoyé correspond au total calculé
    if (Math.abs(totalCalcule - total) > 0.01) {
      return NextResponse.json(
        { error: 'Total incorrect' }, 
        { status: 400 }
      );
    }

    // Créer la commande avec les produits
    const commande = await prisma.commande.create({
      data: {
        utilisateurId: user.id,
        total: totalCalcule,
        adresseLivraison,
        telephone: telephone || user.telephone,
        typeCommande,
        heureRetrait: heureRetrait ? new Date(heureRetrait) : null,
        notes,
        statut: 'EN_ATTENTE',
        produits: {
          create: produitsDetails
        }
      },
      include: {
        produits: {
          include: {
            produit: true
          }
        },
        utilisateur: {
          select: {
            id: true,
            nom: true,
            email: true
          }
        }
      }
    });

    // Créer un événement d'audit
    await prisma.evenementCommande.create({
      data: {
        commandeId: commande.id,
        action: 'COMMANDE_CREEE',
        message: `Commande créée par ${user.nom}`,
        utilisateurId: user.id,
        metadata: JSON.stringify({
          total: totalCalcule,
          typeCommande,
          itemsCount: items.length
        })
      }
    });

    // Réduire le stock des produits
    for (const item of produitsDetails) {
      if ((await prisma.produit.findUnique({ where: { id: item.produitId } }))?.stock) {
        await prisma.produit.update({
          where: { id: item.produitId },
          data: {
            stock: {
              decrement: item.quantite
            }
          }
        });
      }
    }

    // Si paiement en ligne requis, créer l'entrée paiement
    let paymentInit = null;
    if (modePaiement !== 'ESPECES') {
      const paiement = await prisma.paiement.create({
        data: {
          commandeId: commande.id,
          montant: totalCalcule,
          modePaiement,
          statut: 'EN_ATTENTE'
        }
      });

      // Retourner les infos pour redirection vers PSP
      paymentInit = {
        paiementId: paiement.id,
        montant: totalCalcule,
        redirectUrl: `/paiement/init/${paiement.id}`
      };
    }

    return NextResponse.json({
      success: true,
      data: {
        commande: {
          id: commande.id,
          numero: commande.numero,
          statut: commande.statut,
          total: commande.total,
          dateCommande: commande.dateCommande
        },
        paymentInit
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Erreur création commande:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' }, 
      { status: 500 }
    );
  }
}

// GET /api/commandes - Liste des commandes (admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const statut = searchParams.get('statut');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const utilisateurId = searchParams.get('utilisateurId');

    interface CommandeWhereInput {
      statut?: string;
      utilisateurId?: number;
    }
    
    const where: CommandeWhereInput = {};
    
    if (statut) {
      where.statut = statut;
    }
    
    if (utilisateurId) {
      where.utilisateurId = parseInt(utilisateurId);
    }

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
                  prix: true
                }
              }
            }
          },
          paiements: {
            orderBy: {
              date: 'desc'
            },
            take: 1
          }
        },
        orderBy: {
          dateCommande: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.commande.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        commandes,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Erreur récupération commandes:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' }, 
      { status: 500 }
    );
  }
}