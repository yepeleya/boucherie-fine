/**
 * Middleware de validation des numéros de téléphone
 * Spécialement conçu pour la Côte d'Ivoire
 */

const { normalizePhoneNumber, isValidPhoneFormat } = require('../utils/phoneUtils');

/**
 * Middleware Express pour valider et normaliser les numéros de téléphone
 * @param {Object} options - Options de configuration
 * @param {boolean} options.required - Si le téléphone est obligatoire
 * @param {string} options.fieldName - Nom du champ dans req.body
 */
function validatePhone(options = {}) {
  const { required = false, fieldName = 'telephone' } = options;

  return (req, res, next) => {
    const phoneValue = req.body[fieldName];

    // Si le téléphone n'est pas fourni
    if (!phoneValue) {
      if (required) {
        return res.status(400).json({
          error: 'Numéro de téléphone requis',
          code: 'PHONE_REQUIRED',
          field: fieldName
        });
      }
      // Si optionnel, on continue
      return next();
    }

    // Validation du format de base
    if (!isValidPhoneFormat(phoneValue)) {
      return res.status(400).json({
        error: 'Format de numéro de téléphone invalide',
        code: 'INVALID_PHONE_FORMAT',
        field: fieldName,
        details: 'Formats acceptés: 0779565616, 07 79 56 56 16, +2250779565616'
      });
    }

    // Normalisation
    const normalizedPhone = normalizePhoneNumber(phoneValue);

    if (!normalizedPhone) {
      return res.status(400).json({
        error: 'Numéro de téléphone invalide pour la Côte d\'Ivoire',
        code: 'INVALID_PHONE_CI',
        field: fieldName,
        details: 'Le numéro doit être un numéro ivoirien valide (10 chiffres, commençant par 07, 05, 01, ou 02)'
      });
    }

    // Remplacer la valeur dans req.body par la version normalisée
    req.body[fieldName] = normalizedPhone;

    // Log pour debugging (à supprimer en production)
    console.log(`📞 Téléphone validé: "${phoneValue}" → "${normalizedPhone}"`);

    next();
  };
}

/**
 * Middleware pour valider les téléphones dans les paramètres de route
 * @param {string} paramName - Nom du paramètre
 */
function validatePhoneParam(paramName = 'telephone') {
  return (req, res, next) => {
    const phoneValue = req.params[paramName];

    if (!phoneValue) {
      return res.status(400).json({
        error: 'Numéro de téléphone manquant dans l\'URL',
        code: 'PHONE_PARAM_MISSING',
        param: paramName
      });
    }

    const normalizedPhone = normalizePhoneNumber(phoneValue);

    if (!normalizedPhone) {
      return res.status(400).json({
        error: 'Numéro de téléphone invalide dans l\'URL',
        code: 'INVALID_PHONE_PARAM',
        param: paramName
      });
    }

    // Remplacer dans les paramètres
    req.params[paramName] = normalizedPhone;

    next();
  };
}

/**
 * Utilitaire pour normaliser un téléphone dans un controller
 * @param {string} phone - Numéro à normaliser
 * @param {Object} res - Objet response Express (pour renvoyer l'erreur si nécessaire)
 * @returns {string|null} - Numéro normalisé ou null si erreur envoyée
 */
function safeNormalizePhone(phone, res) {
  if (!phone) return null;

  if (!isValidPhoneFormat(phone)) {
    res.status(400).json({
      error: 'Format de numéro de téléphone invalide',
      code: 'INVALID_PHONE_FORMAT',
      details: 'Formats acceptés: 0779565616, 07 79 56 56 16, +2250779565616'
    });
    return null;
  }

  const normalized = normalizePhoneNumber(phone);
  
  if (!normalized) {
    res.status(400).json({
      error: 'Numéro de téléphone invalide pour la Côte d\'Ivoire',
      code: 'INVALID_PHONE_CI',
      details: 'Le numéro doit être un numéro ivoirien valide'
    });
    return null;
  }

  return normalized;
}

module.exports = {
  validatePhone,
  validatePhoneParam,
  safeNormalizePhone
};