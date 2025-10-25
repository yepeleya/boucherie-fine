const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authenticateToken } = require("../middlewares/auth");
const prisma = new PrismaClient();
const router = express.Router();

// ✅ Nouveau paiement (utilisateur connecté uniquement)
router.post("/", authenticateToken, async (req, res) => {
  const { commandeId, montant, modePaiement, statut } = req.body;
  const paiement = await prisma.paiement.create({
    data: { commandeId, montant, modePaiement, statut: statut || "en attente" }
  });
  res.json(paiement);
});

// ✅ Liste paiements (utilisateur connecté uniquement)
router.get("/", authenticateToken, async (req, res) => {
  const paiements = await prisma.paiement.findMany();
  res.json(paiements);
});

module.exports = router;
