const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
require('dotenv').config();

// Import des services
const prisma = require('./prisma');
const notificationService = require('./services/notificationService');
const cronService = require('./services/cronService');

// Import des middlewares
const { generalLimiter } = require('./middlewares/rateLimiting');

// Import des routes
const authRoutes = require('./routes/auth');
const utilisateursRoutes = require('./routes/utilisateurs');
const produitsRoutes = require('./routes/produits');
const commandesRoutes = require('./routes/commandes');
const reservationsRoutes = require('./routes/reservations');
const paiementsRoutes = require('./routes/paiements');
const actualitesRoutes = require('./routes/actualites');
const menusRoutes = require('./routes/menus');

const app = express();
const server = http.createServer(app);

// Configuration de la sécurité
app.use(helmet());
app.use(generalLimiter);

// Configuration CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5176'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Configuration des routes
app.use('/api/auth', authRoutes);
app.use('/api/utilisateurs', utilisateursRoutes);
app.use('/api/produits', produitsRoutes);
app.use('/api/commandes', commandesRoutes);
app.use('/api/reservations', reservationsRoutes);
app.use('/api/paiements', paiementsRoutes);
app.use('/api/actualites', actualitesRoutes);
app.use('/api/menus', menusRoutes);

// Route pour les notifications
app.get('/api/notifications', async (req, res) => {
  try {
    const notifications = await notificationService.getUnreadNotifications();
    const count = await notificationService.countUnread();
    
    res.json({
      notifications,
      count
    });
  } catch (error) {
    console.error('Erreur récupération notifications:', error);
    res.status(500).json({ error: 'Erreur interne' });
  }
});

app.put('/api/notifications/:id/read', async (req, res) => {
  try {
    await notificationService.markAsRead(req.params.id);
    res.json({ message: 'Notification marquée comme lue' });
  } catch (error) {
    console.error('Erreur marquage notification:', error);
    res.status(500).json({ error: 'Erreur interne' });
  }
});

app.put('/api/notifications/read-all', async (req, res) => {
  try {
    await notificationService.markAllAsRead();
    res.json({ message: 'Toutes les notifications marquées comme lues' });
  } catch (error) {
    console.error('Erreur marquage notifications:', error);
    res.status(500).json({ error: 'Erreur interne' });
  }
});

// Route de test
app.get('/', (req, res) => {
  res.json({
    message: "🍖 Bienvenue à l'API La Boucherie Fine",
    version: "1.0.0",
    endpoints: {
      utilisateurs: "/api/utilisateurs",
      produits: "/api/produits", 
      commandes: "/api/commandes",
      reservations: "/api/reservations",
      paiements: "/api/paiements",
      actualites: "/api/actualites",
      menus: "/api/menus",
      notifications: "/api/notifications"
    }
  });
});

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({
    error: "Endpoint non trouvé",
    code: "NOT_FOUND",
    path: req.path
  });
});

// Gestion des erreurs générales
app.use((error, req, res, next) => {
  console.error('Erreur non gérée:', error);
  res.status(500).json({
    error: "Erreur interne du serveur",
    code: "INTERNAL_ERROR"
  });
});

const PORT = process.env.PORT || 3002;

// Initialisation du serveur
const startServer = async () => {
  try {
    // Initialiser Socket.IO pour les notifications
    notificationService.initialize(server);
    
    // Démarrer les tâches CRON
    cronService.start();
    
    // Démarrer le serveur
    server.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
      console.log(`📡 Socket.IO activé pour les notifications temps réel`);
      console.log(`⏰ Tâches CRON activées`);
      console.log(`🌐 CORS configuré pour: ${process.env.FRONTEND_URL || ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5176'].join(', ')}`);
    });
  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
};

// Gestion propre de l'arrêt du serveur
process.on('SIGINT', async () => {
  console.log('\n🛑 Arrêt du serveur...');
  cronService.stop();
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Arrêt du serveur...');
  cronService.stop();
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
