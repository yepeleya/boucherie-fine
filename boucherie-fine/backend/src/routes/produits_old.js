const express = require("express");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const router = express.Router();

// ✅ Ajouter produit
router.post("/", async (req, res) => {
  const { nom, description, prix, categorie, image } = req.body;
  const produit = await prisma.produit.create({ data: { nom, description, prix, categorie, image } });
  res.json(produit);
});

// ✅ Liste produits
router.get("/", async (req, res) => {
  const produits = await prisma.produit.findMany();
  res.json(produits);
});

// ✅ Un produit
router.get("/:id", async (req, res) => {
  const produit = await prisma.produit.findUnique({ where: { id: parseInt(req.params.id) } });
  res.json(produit);
});

module.exports = router;
