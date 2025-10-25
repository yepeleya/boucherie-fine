const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authenticateToken, authorizeRole } = require("../middlewares/auth");
const prisma = new PrismaClient();
const router = express.Router();

// ✅ Créer actualité (admin uniquement)
router.post("/", authenticateToken, authorizeRole("admin"), async (req, res) => {
  const { titre, contenu, image } = req.body;
  const actualite = await prisma.actualite.create({
    data: { titre, contenu, image, date: new Date() }
  });
  res.json(actualite);
});

// ✅ Liste actualités (public)
router.get("/", async (req, res) => {
  const actualites = await prisma.actualite.findMany({ orderBy: { date: "desc" } });
  res.json(actualites);
});

// ✅ Supprimer actualité (admin uniquement)
router.delete("/:id", authenticateToken, authorizeRole("admin"), async (req, res) => {
  try {
    const actualite = await prisma.actualite.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ message: "Actualité supprimée avec succès", actualite });
  } catch (error) {
    res.status(400).json({ error: "Erreur lors de la suppression", details: error });
  }
});

// ✅ Modifier actualité (admin uniquement)
router.put("/:id", authenticateToken, authorizeRole("admin"), async (req, res) => {
  const { titre, contenu, image } = req.body;
  try {
    const actualite = await prisma.actualite.update({
      where: { id: parseInt(req.params.id) },
      data: { titre, contenu, image }
    });
    res.json(actualite);
  } catch (error) {
    res.status(400).json({ error: "Erreur lors de la modification", details: error });
  }
});

module.exports = router;