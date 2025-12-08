import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nom, email, telephone, sujet, message } = body;

    // Validation basique
    if (!nom || !email || !sujet || !message) {
      return NextResponse.json(
        { error: 'Tous les champs requis doivent être remplis' },
        { status: 400 }
      );
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Adresse email invalide' },
        { status: 400 }
      );
    }

    // Sauvegarder dans la base de données
    const nouveauContact = await prisma.contact.create({
      data: {
        nom: nom.trim(),
        email: email.toLowerCase().trim(),
        telephone: telephone?.trim() || null,
        sujet: sujet.trim(),
        message: message.trim(),
        statut: 'NON_LU'
      }
    });

    console.log('Nouveau message de contact sauvegardé:', {
      id: nouveauContact.id,
      nom: nouveauContact.nom,
      email: nouveauContact.email,
      sujet: nouveauContact.sujet,
      date: nouveauContact.dateCreation
    });

    // Optionnel : Envoyer une notification email à l'admin
    // TODO: Intégrer un service d'email (SendGrid, Nodemailer, etc.)

    return NextResponse.json(
      { 
        success: true, 
        message: 'Message envoyé avec succès! Nous vous répondrons dans les plus brefs délais.',
        contactId: nouveauContact.id
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Erreur lors du traitement du formulaire de contact:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur. Veuillez réessayer plus tard.' },
      { status: 500 }
    );
  }
}