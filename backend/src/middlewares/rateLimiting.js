const rateLimit = require('express-rate-limit');

// Rate limiting général
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limite à 100 requêtes par IP
  message: {
    error: 'Trop de requêtes, veuillez réessayer plus tard',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting pour l'authentification
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limite à 5 tentatives de connexion
  message: {
    error: 'Trop de tentatives de connexion, veuillez réessayer plus tard',
    code: 'AUTH_RATE_LIMIT_EXCEEDED'
  },
  skipSuccessfulRequests: true,
});

// Rate limiting pour les uploads
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 20, // limite à 20 uploads par heure
  message: {
    error: 'Trop d\'uploads, veuillez réessayer plus tard',
    code: 'UPLOAD_RATE_LIMIT_EXCEEDED'
  },
});

module.exports = {
  generalLimiter,
  authLimiter,
  uploadLimiter
};