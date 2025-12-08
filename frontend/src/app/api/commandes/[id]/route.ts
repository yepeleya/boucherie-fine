import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET /api/commandes/[id] - Détail d'une commande
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const commandeId = parseInt(params.id);
    
    if (isNaN(commandeId)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
    }

    const commande = await prisma.commande.findUnique({
      where: { id: commandeId },
      include: {
        utilisateur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
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
                description: true,
                prix: true,
                imageUrl: true
              }
            }
          }
        },
        paiements: {
          orderBy: {
            date: 'desc'
          }
        },
        evenements: {
          orderBy: {
            dateCreation: 'desc'
          }
        }
      }
    });

    if (!commande) {
      return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: commande
    });

  } catch (error) {
    console.error('Erreur récupération commande:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' }, 
      { status: 500 }
    );
  }
}

// PUT /api/commandes/[id]/statut - Modifier le statut d'une commande (admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
    }

    const user = await verifyToken(authHeader.replace('Bearer ', ''));
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const commandeId = parseInt(params.id);
    const { statut, message } = await request.json();
    
    if (isNaN(commandeId)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
    }

    if (!statut) {
      return NextResponse.json({ error: 'Statut requis' }, { status: 400 });
    }

    // Vérifier que la commande existe
    const commandeExistante = await prisma.commande.findUnique({
      where: { id: commandeId },
      include: {
        utilisateur: {
          select: {
            nom: true,
            email: true
          }
        }
      }
    });

    if (!commandeExistante) {
      return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });
    }

    // Vérifier les transitions de statut autorisées
    const transitionsAutorisees: { [key: string]: string[] } = {
      'EN_ATTENTE': ['PAYEE', 'ANNULEE'],
      'PAYEE': ['CONFIRMEE', 'ANNULEE', 'REMBOURSEE'],
      'CONFIRMEE': ['EN_PREPARATION', 'ANNULEE'],
      'EN_PREPARATION': ['PRETE', 'ANNULEE'],
      'PRETE': ['EN_LIVRAISON', 'LIVREE', 'ANNULEE'],
      'EN_LIVRAISON': ['LIVREE', 'ANNULEE'],
      'LIVREE': ['REMBOURSEE'],
      'ANNULEE': [],
      'REMBOURSEE': []
    };

    if (!transitionsAutorisees[commandeExistante.statut]?.includes(statut)) {
      return NextResponse.json(
        { error: `Transition de ${commandeExistante.statut} vers ${statut} non autorisée` }, 
        { status: 400 }
      );
    }

    // Mettre à jour la commande
    const commande = await prisma.commande.update({
      where: { id: commandeId },
      data: { 
        statut,
        dateModification: new Date()
      },
      include: {
        utilisateur: {
          select: {
            nom: true,
            email: true
          }
        }
      }
    });

    // Créer un événement d'audit
    await prisma.evenementCommande.create({
      data: {
        commandeId: commandeId,
        action: `STATUT_CHANGE_${statut}`,
        message: message || `Statut changé vers ${statut} par ${user.nom}`,
        utilisateurId: user.id,
        metadata: JSON.stringify({
          ancienStatut: commandeExistante.statut,
          nouveauStatut: statut,
          changedBy: user.nom
        })
      }
    });

    // TODO: Envoyer notification email/SMS au client
    // await sendOrderStatusNotification(commande.utilisateur.email, statut, commande.numero);

    return NextResponse.json({
      success: true,
      data: commande,
      message: `Statut de la commande mis à jour vers ${statut}`
    });

  } catch (error) {
    console.error('Erreur mise à jour statut:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' }, 
      { status: 500 }
    );
  }
}