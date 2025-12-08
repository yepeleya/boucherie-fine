import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyHmac } from '@/lib/hmac';
import crypto from 'crypto';

// POST /api/paiements/init - Initialiser un paiement
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paiementId, returnUrl, cancelUrl } = body;

    if (!paiementId) {
      return NextResponse.json({ error: 'ID de paiement requis' }, { status: 400 });
    }

    // Récupérer les infos du paiement
    const paiement = await prisma.paiement.findUnique({
      where: { id: parseInt(paiementId) },
      include: {
        commande: {
          include: {
            utilisateur: {
              select: {
                nom: true,
                email: true,
                telephone: true
              }
            }
          }
        }
      }
    });

    if (!paiement) {
      return NextResponse.json({ error: 'Paiement introuvable' }, { status: 404 });
    }

    if (paiement.statut !== 'EN_ATTENTE') {
      return NextResponse.json({ error: 'Paiement déjà traité' }, { status: 400 });
    }

    // Générer une référence unique pour le PSP
    const providerRef = `BF_${paiement.commande.numero}_${Date.now()}`;
    
    // Configuration CinetPay
    const cinetpayConfig = {
      apikey: process.env.CINETPAY_API_KEY!,
      site_id: process.env.CINETPAY_SITE_ID!,
      transaction_id: providerRef,
      amount: Math.round(paiement.montant),
      currency: 'XOF',
      description: `Commande ${paiement.commande.numero} - La Boucherie Fine`,
      return_url: returnUrl || `${process.env.NEXTAUTH_URL}/commandes/${paiement.commande.id}/success`,
      cancel_url: cancelUrl || `${process.env.NEXTAUTH_URL}/commandes/${paiement.commande.id}/cancel`,
      notify_url: `${process.env.NEXTAUTH_URL}/api/paiements/webhook`,
      customer_name: paiement.commande.utilisateur.nom,
      customer_email: paiement.commande.utilisateur.email,
      customer_phone_number: paiement.commande.utilisateur.telephone || '',
      customer_address: paiement.commande.adresseLivraison || '',
      customer_city: 'Abidjan',
      customer_country: 'CI'
    };

    // Appel à l'API CinetPay
    const cinetpayResponse = await fetch('https://api-checkout.cinetpay.com/v2/payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cinetpayConfig)
    });

    if (!cinetpayResponse.ok) {
      throw new Error(`Erreur CinetPay: ${cinetpayResponse.statusText}`);
    }

    const cinetpayData = await cinetpayResponse.json();

    if (cinetpayData.code !== '201') {
      throw new Error(`Erreur CinetPay: ${cinetpayData.message}`);
    }

    // Mettre à jour le paiement avec les infos CinetPay
    const paiementMisAJour = await prisma.paiement.update({
      where: { id: paiement.id },
      data: {
        providerRef,
        paymentUrl: cinetpayData.data.payment_url,
        metadata: JSON.stringify({
          cinetpay_token: cinetpayData.data.payment_token,
          cinetpay_response: cinetpayData
        }),
        dateModification: new Date()
      }
    });

    // Créer un événement d'audit
    await prisma.evenementCommande.create({
      data: {
        commandeId: paiement.commandeId!,
        action: 'PAIEMENT_INIT',
        message: `Paiement initialisé via CinetPay - Référence: ${providerRef}`,
        metadata: JSON.stringify({
          paiementId: paiement.id,
          montant: paiement.montant,
          providerRef
        })
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        paymentUrl: cinetpayData.data.payment_url,
        paymentToken: cinetpayData.data.payment_token,
        providerRef,
        montant: paiement.montant
      }
    });

  } catch (error) {
    console.error('Erreur initialisation paiement:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'initialisation du paiement' }, 
      { status: 500 }
    );
  }
}

// GET /api/paiements/status/[providerRef] - Vérifier le statut d'un paiement
export async function GET(
  request: NextRequest,
  { params }: { params: { providerRef: string } }
) {
  try {
    const { providerRef } = params;

    const paiement = await prisma.paiement.findUnique({
      where: { providerRef },
      include: {
        commande: {
          select: {
            id: true,
            numero: true,
            statut: true
          }
        }
      }
    });

    if (!paiement) {
      return NextResponse.json({ error: 'Paiement introuvable' }, { status: 404 });
    }

    // Vérifier le statut auprès de CinetPay
    const statusResponse = await fetch('https://api-checkout.cinetpay.com/v2/payment/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apikey: process.env.CINETPAY_API_KEY!,
        site_id: process.env.CINETPAY_SITE_ID!,
        transaction_id: providerRef
      })
    });

    const statusData = await statusResponse.json();

    return NextResponse.json({
      success: true,
      data: {
        paiement: {
          id: paiement.id,
          statut: paiement.statut,
          montant: paiement.montant,
          providerRef: paiement.providerRef
        },
        commande: paiement.commande,
        cinetpayStatus: statusData
      }
    });

  } catch (error) {
    console.error('Erreur vérification statut paiement:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification' }, 
      { status: 500 }
    );
  }
}