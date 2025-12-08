/**
 * Contrôleur pour la gestion des actualités
 * La Boucherie Fine - Blog/Actualités
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Fonction utilitaire pour générer un slug à partir d'un titre
 */
function generateSlug(titre) {
  return titre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
    .replace(/[^a-z0-9\s-]/g, '') // Garder seulement lettres, chiffres, espaces et tirets
    .replace(/\s+/g, '-') // Remplacer espaces par des tirets
    .replace(/-+/g, '-') // Éviter les tirets multiples
    .trim('-'); // Supprimer les tirets en début/fin
}

/**
 * Fonction utilitaire pour générer un extrait automatique
 */
function generateExtrait(contenu, maxLength = 300) {
  if (!contenu) return '';
  
  // Supprimer les balises HTML
  const textOnly = contenu.replace(/<[^>]*>/g, '');
  
  if (textOnly.length <= maxLength) return textOnly;
  
  // Couper au dernier mot complet
  const truncated = textOnly.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return lastSpace > 0 
    ? truncated.substring(0, lastSpace) + '...'
    : truncated + '...';
}

/**
 * GET /api/actualites
 * Récupérer toutes les actualités publiques (actives)
 * @param {Object} req - Requête
 * @param {Object} res - Réponse
 */
exports.getActualites = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 9, 
      categorie, 
      search 
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Construire les filtres
    const where = {
      actif: true,
      datePublication: {
        lte: new Date() // Seulement les articles publiés
      }
    };

    if (categorie) {
      where.categorie = categorie;
    }

    if (search) {
      where.OR = [
        { titre: { contains: search, mode: 'insensitive' } },
        { extrait: { contains: search, mode: 'insensitive' } },
        { contenu: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Récupérer les actualités avec pagination
    const [actualites, total] = await Promise.all([
      prisma.actualite.findMany({
        where,
        orderBy: { datePublication: 'desc' },
        skip,
        take: parseInt(limit),
        select: {
          id: true,
          titre: true,
          slug: true,
          extrait: true,
          imageUrl: true,
          categorie: true,
          auteur: true,
          datePublication: true,
          vues: true
        }
      }),
      prisma.actualite.count({ where })
    ]);

    // Calculer les métadonnées de pagination
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasMore = parseInt(page) < totalPages;

    res.json({
      actualites,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasMore
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des actualités:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  }
};

/**
 * GET /api/actualites/:slug
 * Récupérer une actualité par son slug
 * @param {Object} req - Requête
 * @param {Object} res - Réponse
 */
exports.getActualiteBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const actualite = await prisma.actualite.findUnique({
      where: { 
        slug,
        actif: true,
        datePublication: {
          lte: new Date()
        }
      }
    });

    if (!actualite) {
      return res.status(404).json({
        error: 'Actualité introuvable',
        code: 'ARTICLE_NOT_FOUND'
      });
    }

    // Incrémenter le compteur de vues
    await prisma.actualite.update({
      where: { id: actualite.id },
      data: { vues: { increment: 1 } }
    });

    // Récupérer les articles similaires (même catégorie, exclusion de l'article actuel)
    const articlesSimilaires = await prisma.actualite.findMany({
      where: {
        categorie: actualite.categorie,
        id: { not: actualite.id },
        actif: true,
        datePublication: { lte: new Date() }
      },
      orderBy: { datePublication: 'desc' },
      take: 3,
      select: {
        id: true,
        titre: true,
        slug: true,
        extrait: true,
        imageUrl: true,
        datePublication: true
      }
    });

    res.json({
      actualite: {
        ...actualite,
        vues: actualite.vues + 1 // Retourner le nouveau nombre de vues
      },
      articlesSimilaires
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'actualité:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  }
};

/**
 * GET /api/actualites/categories
 * Récupérer toutes les catégories d'actualités
 */
exports.getCategories = async (req, res) => {
  try {
    const categories = await prisma.actualite.groupBy({
      by: ['categorie'],
      where: { 
        actif: true,
        datePublication: { lte: new Date() }
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    });

    const formattedCategories = categories.map(cat => ({
      nom: cat.categorie,
      count: cat._count.id
    }));

    res.json({ categories: formattedCategories });

  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  }
};

/**
 * POST /api/admin/actualites
 * Créer une nouvelle actualité (ADMIN UNIQUEMENT)
 */
exports.createActualite = async (req, res) => {
  try {
    const {
      titre,
      contenu,
      extrait,
      imageUrl,
      categorie = 'Actualités',
      datePublication
    } = req.body;

    // Validation des champs requis
    if (!titre || !contenu) {
      return res.status(400).json({
        error: 'Le titre et le contenu sont requis',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }

    // Générer le slug
    let baseSlug = generateSlug(titre);
    let slug = baseSlug;
    let counter = 1;

    // Vérifier l'unicité du slug
    while (await prisma.actualite.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Générer l'extrait automatiquement s'il n'est pas fourni
    const finalExtrait = extrait || generateExtrait(contenu);

    const actualite = await prisma.actualite.create({
      data: {
        titre,
        slug,
        contenu,
        extrait: finalExtrait,
        imageUrl,
        categorie,
        datePublication: datePublication ? new Date(datePublication) : new Date()
      }
    });

    res.status(201).json({
      message: 'Actualité créée avec succès',
      actualite
    });

  } catch (error) {
    console.error('Erreur lors de la création de l\'actualité:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  }
};

/**
 * PUT /api/admin/actualites/:id
 * Modifier une actualité existante (ADMIN UNIQUEMENT)
 */
exports.updateActualite = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      titre,
      contenu,
      extrait,
      imageUrl,
      categorie,
      actif,
      datePublication
    } = req.body;

    // Vérifier que l'actualité existe
    const actualiteExistante = await prisma.actualite.findUnique({
      where: { id: parseInt(id) }
    });

    if (!actualiteExistante) {
      return res.status(404).json({
        error: 'Actualité introuvable',
        code: 'ARTICLE_NOT_FOUND'
      });
    }

    // Préparer les données à mettre à jour
    const dataToUpdate = {};

    if (titre) {
      dataToUpdate.titre = titre;
      // Regénérer le slug si le titre change
      if (titre !== actualiteExistante.titre) {
        let baseSlug = generateSlug(titre);
        let slug = baseSlug;
        let counter = 1;

        while (await prisma.actualite.findFirst({ 
          where: { 
            slug, 
            id: { not: parseInt(id) } 
          } 
        })) {
          slug = `${baseSlug}-${counter}`;
          counter++;
        }
        dataToUpdate.slug = slug;
      }
    }

    if (contenu) {
      dataToUpdate.contenu = contenu;
      // Régénérer l'extrait si pas fourni explicitement
      if (!extrait) {
        dataToUpdate.extrait = generateExtrait(contenu);
      }
    }

    if (extrait) dataToUpdate.extrait = extrait;
    if (imageUrl !== undefined) dataToUpdate.imageUrl = imageUrl;
    if (categorie) dataToUpdate.categorie = categorie;
    if (actif !== undefined) dataToUpdate.actif = actif;
    if (datePublication) dataToUpdate.datePublication = new Date(datePublication);

    const actualiteUpdated = await prisma.actualite.update({
      where: { id: parseInt(id) },
      data: dataToUpdate
    });

    res.json({
      message: 'Actualité mise à jour avec succès',
      actualite: actualiteUpdated
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'actualité:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  }
};

/**
 * DELETE /api/admin/actualites/:id
 * Supprimer une actualité (ADMIN UNIQUEMENT)
 */
exports.deleteActualite = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que l'actualité existe
    const actualite = await prisma.actualite.findUnique({
      where: { id: parseInt(id) }
    });

    if (!actualite) {
      return res.status(404).json({
        error: 'Actualité introuvable',
        code: 'ARTICLE_NOT_FOUND'
      });
    }

    await prisma.actualite.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      message: 'Actualité supprimée avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de l\'actualité:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  }
};

/**
 * GET /api/admin/actualites
 * Récupérer toutes les actualités pour l'admin (y compris inactives)
 */
exports.getAllActualitesAdmin = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      categorie, 
      search,
      actif 
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Construire les filtres
    const where = {};

    if (categorie) where.categorie = categorie;
    if (actif !== undefined) where.actif = actif === 'true';

    if (search) {
      where.OR = [
        { titre: { contains: search, mode: 'insensitive' } },
        { extrait: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [actualites, total] = await Promise.all([
      prisma.actualite.findMany({
        where,
        orderBy: { dateCreation: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.actualite.count({ where })
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      actualites,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des actualités admin:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  }
};