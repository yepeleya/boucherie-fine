const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authenticateToken } = require("../middlewares/auth");
const prisma = new PrismaClient();
const router = express.Router();

// ✅ Nouvelle réservation (utilisateur connecté uniquement)
router.post("/", authenticateToken, async (req, res) => {
  const { date, heure, nbPersonnes, salle } = req.body;
  const reservation = await prisma.reservation.create({ 
    data: { 
      utilisateurId: req.user.id, // récupéré depuis le token
      date, 
      heure, 
      nbPersonnes, 
      salle 
    } 
  });
  res.json(reservation);
});

// ✅ Liste réservations (utilisateur connecté uniquement)
router.get("/", authenticateToken, async (req, res) => {
  const reservations = await prisma.reservation.findMany();
  res.json(reservations);
});

module.exports = router;
