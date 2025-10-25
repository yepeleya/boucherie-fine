const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configuration du stockage Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Déterminer le dossier selon le type d'upload
    let folder = 'boucherie-fine/';
    if (req.path.includes('/produits')) {
      folder += 'produits';
    } else if (req.path.includes('/actualites')) {
      folder += 'actualites';
    } else if (req.path.includes('/categories')) {
      folder += 'categories';
    } else {
      folder += 'general';
    }

    return {
      folder: folder,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [
        { width: 800, height: 600, crop: 'fill', quality: 'auto:good' }
      ]
    };
  },
});

// Middleware Multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: (req, file, cb) => {
    // Vérifier le type de fichier
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Seules les images sont autorisées'), false);
    }
  }
});

// Fonction pour supprimer une image de Cloudinary
const deleteImage = async (imageUrl) => {
  try {
    if (!imageUrl) return true;
    
    // Extraire le public_id de l'URL Cloudinary
    const parts = imageUrl.split('/');
    const filename = parts[parts.length - 1];
    const publicId = filename.split('.')[0];
    const folderPath = parts.slice(-3, -1).join('/'); // Récupérer le chemin du dossier
    
    const fullPublicId = `${folderPath}/${publicId}`;
    
    const result = await cloudinary.uploader.destroy(fullPublicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'image:', error);
    return false;
  }
};

module.exports = {
  upload,
  deleteImage,
  cloudinary
};