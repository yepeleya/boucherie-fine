/**
 * Utilitaires pour la normalisation des numéros de téléphone
 * Support des formats français, ivoiriens et internationaux
 */

/**
 * Normalise un numéro de téléphone ivoirien en format international
 * Spécialement optimisé pour la Côte d'Ivoire
 * @param {string} telephone - Le numéro à normaliser
 * @returns {string|null} - Numéro normalisé (+225XXXXXXXXXX) ou null si invalide
 */
function normalizePhoneNumber(telephone) {
  if (!telephone || typeof telephone !== 'string') {
    return null;
  }

  console.log(`📞 Entrée: "${telephone}"`);

  // 1. Supprimer tout sauf les chiffres et le +
  let cleaned = telephone.replace(/[^\d+]/g, '');

  // 2. Gérer les formats avec indicatif +225 ou 00225
  if (cleaned.startsWith('+225')) {
    cleaned = cleaned.substring(4); // Enlever +225
  } else if (cleaned.startsWith('00225')) {
    cleaned = cleaned.substring(5); // Enlever 00225
  } else if (cleaned.startsWith('225')) {
    cleaned = cleaned.substring(3); // Enlever 225
  } else if (cleaned.startsWith('+')) {
    // Autres indicatifs internationaux - pour l'instant on rejette
    console.log(`❌ Indicatif international non ivoirien détecté: ${cleaned}`);
    return null;
  }

  // 3. Enlever le 0 initial si présent (format local ivoirien)
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }

  console.log(`🔧 Après nettoyage: "${cleaned}"`);

  // 4. Vérifier que c'est exactement 9 chiffres (après avoir enlevé le 0)
  if (cleaned.length !== 9) {
    console.log(`❌ Longueur invalide: ${cleaned.length} chiffres (attendu: 9)`);
    return null;
  }

  // 5. Vérifier que ça commence par un préfixe valide ivoirien
  const validPrefixes = ['7', '5', '1', '2']; // 07->7, 05->5, 01->1, 02->2, etc.
  const firstDigit = cleaned.charAt(0);
  
  if (!validPrefixes.includes(firstDigit)) {
    console.log(`❌ Préfixe invalide pour la Côte d'Ivoire: ${firstDigit}`);
    return null;
  }

  // 6. Construire le numéro final au format international
  const normalized = `+225${cleaned}`;
  console.log(`✅ Numéro normalisé: "${normalized}"`);
  
  return normalized;
}

/**
 * Valide si un numéro de téléphone est dans un format acceptable pour la Côte d'Ivoire
 * @param {string} telephone - Le numéro à valider
 * @returns {boolean} - true si le format est potentiellement valide
 */
function isValidPhoneFormat(telephone) {
  if (!telephone || typeof telephone !== 'string') {
    return false;
  }

  // Regex pour accepter tous les formats d'entrée possibles
  const phoneRegex = /^(\+?225\s?|0)?[0-9\s\-.()]{8,15}$/;
  
  // Test basique du format
  if (!phoneRegex.test(telephone)) {
    return false;
  }

  // Test plus poussé : doit contenir au moins 8 chiffres
  const digitsOnly = telephone.replace(/[^\d]/g, '');
  return digitsOnly.length >= 8 && digitsOnly.length <= 15;
}

/**
 * Formate un numéro pour l'affichage
 * @param {string} telephone - Numéro au format international
 * @returns {string} - Numéro formaté pour l'affichage
 */
function formatPhoneDisplay(telephone) {
  if (!telephone) return '';
  
  // Si c'est un numéro ivoirien
  if (telephone.startsWith('+225')) {
    const number = telephone.substring(4);
    if (number.length === 10) {
      return `+225 ${number.substring(0, 2)} ${number.substring(2, 4)} ${number.substring(4, 6)} ${number.substring(6, 8)} ${number.substring(8, 10)}`;
    }
  }
  
  // Si c'est un numéro français
  if (telephone.startsWith('+33')) {
    const number = telephone.substring(3);
    if (number.length === 9) {
      return `+33 ${number.substring(0, 1)} ${number.substring(1, 3)} ${number.substring(3, 5)} ${number.substring(5, 7)} ${number.substring(7, 9)}`;
    }
  }
  
  // Format par défaut
  return telephone;
}

/**
 * Tests unitaires des fonctions de normalisation (Côte d'Ivoire)
 */
function runPhoneTests() {
  const testCases = [
    // Formats ivoiriens valides
    { input: '0779565616', expected: '+225779565616', description: 'Format local 07' },
    { input: '07 79 56 56 16', expected: '+225779565616', description: 'Avec espaces' },
    { input: '07-79-56-56-16', expected: '+225779565616', description: 'Avec tirets' },
    { input: '(07) 79 56 56 16', expected: '+225779565616', description: 'Avec parenthèses' },
    { input: '0544544735', expected: '+225544544735', description: 'Format local 05' },
    { input: '0123456789', expected: '+225123456789', description: 'Format local 01' },
    { input: '0227565616', expected: '+225227565616', description: 'Format local 02' },
    
    // Déjà en format international
    { input: '+2250779565616', expected: '+225779565616', description: 'Déjà international avec +' },
    { input: '2250779565616', expected: '+225779565616', description: 'International sans +' },
    { input: '00225 07 79 56 56 16', expected: '+225779565616', description: 'Format 00225' },
    
    // Formats sans le 0 initial
    { input: '779565616', expected: '+225779565616', description: 'Sans 0 initial' },
    { input: '544544735', expected: '+225544544735', description: 'Sans 0 initial (05)' },
    
    // Cas d'erreur (doivent retourner null)
    { input: '06123456789', expected: null, description: 'Préfixe 06 invalide' },
    { input: '03123456789', expected: null, description: 'Préfixe 03 invalide' },
    { input: '012345678', expected: null, description: 'Trop court (8 chiffres)' },
    { input: '01234567890', expected: null, description: 'Trop long (11 chiffres)' },
    { input: '+33123456789', expected: null, description: 'Indicatif français' },
    { input: 'abcd', expected: null, description: 'Pas un numéro' },
    { input: '', expected: null, description: 'Chaîne vide' },
  ];

  console.log('🧪 Tests de normalisation des téléphones (Côte d\'Ivoire):');
  testCases.forEach(({ input, expected, description }, index) => {
    const result = normalizePhoneNumber(input);
    const status = result === expected ? '✅' : '❌';
    console.log(`${status} Test ${index + 1}: ${description}`);
    console.log(`   Entrée: "${input}" → Résultat: "${result}" (Attendu: "${expected}")`);
  });
}

module.exports = {
  normalizePhoneNumber,
  isValidPhoneFormat,
  formatPhoneDisplay,
  runPhoneTests
};