import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyHmac } from '@/lib/hmac';

// POST /api/paiements/webhook - Webhook CinetPay
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-cinetpay-signature') || 
                     request.headers.get('x-signature') || '';

    // Vérification HMAC pour sécurité
    const isValidSignature = verifyHmac(
      rawBody, 
      signature, 
      process.env.CINETPAY_SECRET!
    );

    if (!isValidSignature) {
      console.error('Webhook signature invalide:', signature);
      return NextResponse.json({ error: 'Signature invalide' }, { status: 403 });
    }

    const payload = JSON.parse(rawBody);
    console.log('Webhook CinetPay reçu:', payload);

    const { 
      cpm_trans_id,
      cpm_trans_date,
      cpm_amount,
      cpm_currency,
      cpm_payid,
      cpm_payment_date,
      cpm_payment_time,
      cpm_error_message,
      cpm_result,
      cpm_trans_status,
      signature: payloadSignature
    } = payload;

    // Vérifier que c'est bien notre transaction
    const paiement = await prisma.paiement.findUnique({
      where: { providerRef: cpm_trans_id },
      include: {
        commande: {
          include: {
            utilisateur: {
              select: {
                nom: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!paiement) {
      console.error('Paiement introuvable pour providerRef:', cpm_trans_id);
      return NextResponse.json({ error: 'Paiement introuvable' }, { status: 404 });
    }

    // Vérifier l'idempotence (éviter le double traitement)
    if (paiement.statut === 'REUSSI') {
      console.log('Paiement déjà traité (idempotence):', cpm_trans_id);
      return NextResponse.json({ message: 'Paiement déjà traité' }, { status: 200 });
    }

    let nouveauStatutPaiement = '';
    let nouveauStatutCommande = '';
    let messageAudit = '';

    // Traiter selon le résultat
    if (cpm_result === '00' && cpm_trans_status === 'ACCEPTED') {
      // Paiement réussi
      nouveauStatutPaiement = 'REUSSI';
      nouveauStatutCommande = 'PAYEE';
      messageAudit = `Paiement réussi via CinetPay - PayID: ${cpm_payid}`;

    } else if (cpm_trans_status === 'REFUSED' || cpm_result !== '00') {
      // Paiement échoué
      nouveauStatutPaiement = 'ECHEC';
      nouveauStatutCommande = 'ANNULEE';
      messageAudit = `Paiement échoué - Erreur: ${cpm_error_message}`;

    } else {
      // Statut intermédiaire, on log mais on ne change rien
      console.log('Statut intermédiaire:', cmp_trans_status, cpm_result);
      return NextResponse.json({ message: 'Statut intermédiaire' }, { status: 200 });
    }

    // Transaction atomique pour mettre à jour paiement et commande
    await prisma.$transaction(async (tx) => {
      // Mettre à jour le paiement
      await tx.paiement.update({
        where: { id: paiement.id },
        data: {
          statut: nouveauStatutPaiement,
          datePaiement: nouveauStatutPaiement === 'REUSSI' ? new Date() : null,
          donneesCallback: JSON.stringify(payload),
          dateModification: new Date()
        }
      });

      // Mettre à jour la commande
      await tx.commande.update({
        where: { id: paiement.commandeId! },
        data: {
          statut: nouveauStatutCommande,
          dateModification: new Date()
        }
      });

      // Créer événement d'audit
      await tx.evenementCommande.create({
        data: {
          commandeId: paiement.commandeId!,
          action: `WEBHOOK_${nouveauStatutPaiement}`,
          message: messageAudit,
          metadata: JSON.stringify({
            webhook_payload: payload,
            cpm_payid,
            cpm_result,
            cmp_trans_status
          })
        }
      });
    });

    // TODO: Envoyer notifications
    if (nouveauStatutPaiement === 'REUSSI') {
      // await sendPaymentSuccessNotification(paiement.commande.utilisateur.email, paiement.commande.numero);
      // await sendNewOrderNotificationToAdmin(paiement.commande);
    } else {
      // await sendPaymentFailureNotification(paiement.commande.utilisateur.email, paiement.commande.numero);
    }

    console.log(`Webhook traité avec succès - Commande ${paiement.commande.numero}: ${nouveauStatutCommande}`);
    
    return NextResponse.json({ 
      message: 'Webhook traité avec succès',
      commandeId: paiement.commandeId,
      statut: nouveauStatutCommande
    }, { status: 200 });

  } catch (error) {
    console.error('Erreur traitement webhook:', error);
    
    // En cas d'erreur, on retourne 500 pour que CinetPay retente
    return NextResponse.json(
      { error: 'Erreur interne' }, 
      { status: 500 }
    );
  }
}

// GET /api/paiements/webhook - Pour vérification du endpoint
export async function GET() {
  return NextResponse.json({ 
    message: 'Webhook CinetPay endpoint actif',
    timestamp: new Date().toISOString()
  });
}