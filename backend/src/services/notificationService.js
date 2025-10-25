const { Server } = require('socket.io');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class NotificationService {
  constructor() {
    this.io = null;
    this.connectedAdmins = new Map();
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5176",
        methods: ["GET", "POST"]
      }
    });

    this.io.on('connection', (socket) => {
      console.log('Client connecté:', socket.id);

      // Authentification du socket
      socket.on('authenticate', (data) => {
        if (data.role === 'ADMIN') {
          this.connectedAdmins.set(socket.id, {
            userId: data.userId,
            email: data.email
          });
          socket.join('admins');
          console.log('Admin connecté:', data.email);
        }
      });

      socket.on('disconnect', () => {
        this.connectedAdmins.delete(socket.id);
        console.log('Client déconnecté:', socket.id);
      });
    });

    return this.io;
  }

  // Créer et envoyer une notification
  async createNotification(type, titre, message, donnees = null) {
    try {
      // Sauvegarder en base de données
      const notification = await prisma.notification.create({
        data: {
          type,
          titre,
          message,
          donnees: donnees ? JSON.stringify(donnees) : null
        }
      });

      // Envoyer en temps réel aux admins connectés
      if (this.io) {
        this.io.to('admins').emit('nouvelle_notification', {
          id: notification.id,
          type: notification.type,
          titre: notification.titre,
          message: notification.message,
          donnees: donnees,
          dateCreation: notification.dateCreation
        });
      }

      return notification;
    } catch (error) {
      console.error('Erreur création notification:', error);
      return null;
    }
  }

  // Notification pour nouvelle commande
  async notifyNewOrder(commande, utilisateur) {
    await this.createNotification(
      'commande',
      'Nouvelle commande',
      `Nouvelle commande #${commande.numero} de ${utilisateur.nom} (${commande.total}€)`,
      {
        commandeId: commande.id,
        numero: commande.numero,
        total: commande.total,
        utilisateur: {
          nom: utilisateur.nom,
          email: utilisateur.email
        }
      }
    );
  }

  // Notification pour nouvelle réservation
  async notifyNewReservation(reservation, utilisateur) {
    await this.createNotification(
      'reservation',
      'Nouvelle réservation',
      `Nouvelle réservation de ${utilisateur.nom} pour ${reservation.nbPersonnes} personnes le ${new Date(reservation.date).toLocaleDateString()}`,
      {
        reservationId: reservation.id,
        numero: reservation.numero,
        date: reservation.date,
        heure: reservation.heure,
        nbPersonnes: reservation.nbPersonnes,
        utilisateur: {
          nom: utilisateur.nom,
          email: utilisateur.email
        }
      }
    );
  }

  // Notification pour paiement
  async notifyPayment(paiement, commande = null) {
    const titre = paiement.statut === 'REUSSI' ? 'Paiement confirmé' : 'Échec de paiement';
    const message = commande 
      ? `Paiement ${paiement.statut.toLowerCase()} pour la commande #${commande.numero} (${paiement.montant}€)`
      : `Paiement ${paiement.statut.toLowerCase()} de ${paiement.montant}€`;

    await this.createNotification(
      'paiement',
      titre,
      message,
      {
        paiementId: paiement.id,
        numero: paiement.numero,
        montant: paiement.montant,
        statut: paiement.statut,
        commande: commande ? {
          id: commande.id,
          numero: commande.numero
        } : null
      }
    );
  }

  // Récupérer les notifications non lues
  async getUnreadNotifications() {
    try {
      return await prisma.notification.findMany({
        where: { lu: false },
        orderBy: { dateCreation: 'desc' },
        take: 50
      });
    } catch (error) {
      console.error('Erreur récupération notifications:', error);
      return [];
    }
  }

  // Marquer une notification comme lue
  async markAsRead(notificationId) {
    try {
      return await prisma.notification.update({
        where: { id: parseInt(notificationId) },
        data: { lu: true }
      });
    } catch (error) {
      console.error('Erreur marquage notification:', error);
      return null;
    }
  }

  // Marquer toutes les notifications comme lues
  async markAllAsRead() {
    try {
      return await prisma.notification.updateMany({
        where: { lu: false },
        data: { lu: true }
      });
    } catch (error) {
      console.error('Erreur marquage toutes notifications:', error);
      return null;
    }
  }

  // Compter les notifications non lues
  async countUnread() {
    try {
      return await prisma.notification.count({
        where: { lu: false }
      });
    } catch (error) {
      console.error('Erreur comptage notifications:', error);
      return 0;
    }
  }
}

// Instance singleton
const notificationService = new NotificationService();

module.exports = notificationService;