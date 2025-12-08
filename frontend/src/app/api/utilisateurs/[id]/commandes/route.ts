import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET /api/utilisateurs/[id]/commandes - Commandes d'un utilisateur
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
    }

    const user = await verifyToken(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const userId = parseInt(params.id);
    
    // Vérifier que l'utilisateur accède à ses propres commandes ou est admin
    if (user.id !== userId && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const [commandes, total] = await Promise.all([
      prisma.commande.findMany({
        where: { utilisateurId: userId },
        include: {
          produits: {
            include: {
              produit: {
                select: {
                  id: true,
                  nom: true,
                  imageUrl: true
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
      prisma.commande.count({
        where: { utilisateurId: userId }
      })
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
    console.error('Erreur récupération commandes utilisateur:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' }, 
      { status: 500 }
    );
  }
}