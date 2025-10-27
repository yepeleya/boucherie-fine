const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authenticateToken } = require("../middlewares/auth");
const prisma = new PrismaClient();
const router = express.Router();

// ✅ Créer commande (utilisateur connecté uniquement)
router.post("/", authenticateToken, async (req, res) => {
  const { produits } = req.body;
  try {
    const commande = await prisma.commande.create({
      data: {
        utilisateurId: req.user.id, // récupéré depuis le token
        statut: "en cours",
        commande_produits: {
          create: produits.map(p => ({ produitId: p.id, quantite: p.quantite }))
        }
      },
      include: { commande_produits: true }
    });
    res.json(commande);
  } catch (err) {
    res.status(400).json({ error: "Erreur création commande", details: err });
  }
});

// ✅ Liste commandes (utilisateur connecté uniquement)
router.get("/", authenticateToken, async (req, res) => {
  const commandes = await prisma.commande.findMany({ include: { commande_produits: true } });
  res.json(commandes);
});

module.exports = router;
