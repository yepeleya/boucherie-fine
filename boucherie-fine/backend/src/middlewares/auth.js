const jwt = require("jsonwebtoken");

// Configuration JWT
const JWT_SECRET = process.env.JWT_SECRET || 'boucherie_fine_secret_key_2025';

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: "Token d'authentification requis",
      code: "NO_TOKEN"
    });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      let message = "Token invalide ou expiré";
      if (err.name === 'TokenExpiredError') {
        message = "Token expiré";
      } else if (err.name === 'JsonWebTokenError') {
        message = "Token invalide";
      }
      
      return res.status(403).json({ 
        success: false,
        message,
        code: "INVALID_TOKEN"
      });
    }
    
    // Adapter la structure pour être cohérente
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };
    next();
  });
}

function authorizeRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ 
        success: false,
        message: "Accès interdit - privilèges insuffisants",
        code: "INSUFFICIENT_PRIVILEGES",
        required: role,
        current: req.user.role
      });
    }
    next();
  };
}

// Middleware pour vérifier que l'utilisateur est admin OU propriétaire de la ressource
function authorizeOwnerOrAdmin(req, res, next) {
  const resourceUserId = parseInt(req.params.userId || req.body.utilisateurId);
  
  if (req.user.role === 'ADMIN' || req.user.id === resourceUserId) {
    next();
  } else {
    return res.status(403).json({ 
      success: false,
      message: "Accès interdit - vous ne pouvez modifier que vos propres données",
      code: "INSUFFICIENT_PRIVILEGES"
    });
  }
}

module.exports = { 
  authenticateToken, 
  authorizeRole, 
  authorizeOwnerOrAdmin 
};
