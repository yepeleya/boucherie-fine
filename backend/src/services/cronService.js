const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class CronService {
  constructor() {
    this.jobs = [];
  }

  // Démarrer tous les jobs CRON
  start() {
    console.log('🕐 Démarrage des tâches CRON...');

    // Job pour désactiver les actualités expirées - tous les jours à 00:01
    this.jobs.push(
      cron.schedule('1 0 * * *', async () => {
        await this.disableExpiredNews();
      }, {
        scheduled: true,
        timezone: "Europe/Paris"
      })
    );

    // Job pour nettoyer les notifications anciennes - tous les dimanches à 02:00
    this.jobs.push(
      cron.schedule('0 2 * * 0', async () => {
        await this.cleanOldNotifications();
      }, {
        scheduled: true,
        timezone: "Europe/Paris"
      })
    );

    // Job pour rappel des réservations - tous les jours à 09:00
    this.jobs.push(
      cron.schedule('0 9 * * *', async () => {
        await this.sendReservationReminders();
      }, {
        scheduled: true,
        timezone: "Europe/Paris"
      })
    );

    console.log(`✅ ${this.jobs.length} tâches CRON démarrées`);
  }

  // Arrêter tous les jobs CRON
  stop() {
    this.jobs.forEach(job => job.stop());
    console.log('🛑 Tâches CRON arrêtées');
  }

  // Désactiver les actualités expirées
  async disableExpiredNews() {
    try {
      const now = new Date();
      const result = await prisma.actualite.updateMany({
        where: {
          AND: [
            { actif: true },
            { dateFin: { not: null } },
            { dateFin: { lt: now } }
          ]
        },
        data: {
          actif: false
        }
      });

      if (result.count > 0) {
        console.log(`📰 ${result.count} actualité(s) expirée(s) désactivée(s)`);
      }

      return result;
    } catch (error) {
      console.error('❌ Erreur lors de la désactivation des actualités expirées:', error);
    }
  }

  // Nettoyer les anciennes notifications (plus de 30 jours)
  async cleanOldNotifications() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const result = await prisma.notification.deleteMany({
        where: {
          AND: [
            { lu: true },
            { dateCreation: { lt: thirtyDaysAgo } }
          ]
        }
      });

      if (result.count > 0) {
        console.log(`🧹 ${result.count} notification(s) ancienne(s) supprimée(s)`);
      }

      return result;
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage des notifications:', error);
    }
  }

  // Envoyer des rappels pour les réservations du jour
  async sendReservationReminders() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const reservations = await prisma.reservation.findMany({
        where: {
          AND: [
            { statut: 'CONFIRMEE' },
            { date: { gte: today } },
            { date: { lt: tomorrow } }
          ]
        },
        include: {
          utilisateur: true
        }
      });

      if (reservations.length > 0) {
        console.log(`📅 ${reservations.length} réservation(s) confirmée(s) pour aujourd'hui`);
        
        // Ici vous pourriez ajouter l'envoi d'emails ou SMS
        // await this.sendEmailReminders(reservations);
        // await this.sendSMSReminders(reservations);
      }

      return reservations;
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi des rappels:', error);
    }
  }

  // Exécuter manuellement la désactivation des actualités expirées
  async manualDisableExpiredNews() {
    console.log('🔧 Exécution manuelle: désactivation des actualités expirées');
    return await this.disableExpiredNews();
  }

  // Exécuter manuellement le nettoyage des notifications
  async manualCleanNotifications() {
    console.log('🔧 Exécution manuelle: nettoyage des notifications');
    return await this.cleanOldNotifications();
  }
}

// Instance singleton
const cronService = new CronService();

module.exports = cronService;