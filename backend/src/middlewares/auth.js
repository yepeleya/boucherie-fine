const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({ 
      error: "Token d'authentification requis",
      code: "NO_TOKEN"
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || "SECRET_KEY", (err, user) => {
    if (err) {
      return res.status(403).json({ 
        error: "Token invalide ou expiré",
        code: "INVALID_TOKEN"
      });
    }
    req.user = user; // { id, email, role }
    next();
  });
}

function authorizeRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ 
        error: "Accès interdit - privilèges insuffisants",
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
      error: "Accès interdit - vous ne pouvez modifier que vos propres données",
      code: "INSUFFICIENT_PRIVILEGES"
    });
  }
}

module.exports = { 
  authenticateToken, 
  authorizeRole, 
  authorizeOwnerOrAdmin 
};
