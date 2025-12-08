import crypto from 'crypto';

/**
 * Vérifie la signature HMAC d'un webhook
 * @param rawBody - Corps brut de la requête
 * @param signature - Signature reçue dans les headers
 * @param secret - Clé secrète partagée avec le PSP
 * @returns boolean - true si la signature est valide
 */
export function verifyHmac(rawBody: string, signature: string, secret: string): boolean {
  try {
    if (!signature || !secret) {
      return false;
    }

    // Nettoyer la signature (supprimer préfixes comme "sha256=")
    const cleanSignature = signature.replace(/^(sha256=|hmac-sha256=)/i, '');
    
    // Calculer le HMAC attendu
    const expectedHmac = crypto
      .createHmac('sha256', secret)
      .update(rawBody, 'utf8')
      .digest('hex');

    // Comparaison sécurisée pour éviter les attaques timing
    return crypto.timingSafeEqual(
      Buffer.from(cleanSignature, 'hex'),
      Buffer.from(expectedHmac, 'hex')
    );
  } catch (error) {
    console.error('Erreur vérification HMAC:', error);
    return false;
  }
}

/**
 * Génère une signature HMAC
 * @param data - Données à signer
 * @param secret - Clé secrète
 * @returns string - Signature hexadécimale
 */
export function generateHmac(data: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(data, 'utf8')
    .digest('hex');
}

/**
 * Vérifie une signature CinetPay spécifique
 * @param payload - Payload du webhook
 * @param signature - Signature reçue
 * @param secret - Clé secrète CinetPay
 * @returns boolean
 */
interface CinetPayWebhookPayload {
  cpm_trans_id: string;
  cpm_amount: string;
  cpm_currency: string;
  cpm_result: string;
  cmp_trans_status: string;
  [key: string]: unknown;
}

export function verifyCinetPaySignature(
  payload: CinetPayWebhookPayload, 
  signature: string, 
  secret: string
): boolean {
  try {
    // CinetPay utilise parfois une méthode de signature différente
    // Vérifier d'abord avec le payload complet
    const payloadString = JSON.stringify(payload);
    if (verifyHmac(payloadString, signature, secret)) {
      return true;
    }

    // Fallback: vérifier avec les champs spécifiques selon la doc CinetPay
    const signatureData = [
      payload.cpm_trans_id,
      payload.cpm_amount,
      payload.cpm_currency,
      payload.cpm_result,
      payload.cpm_trans_status
    ].join('');

    return verifyHmac(signatureData, signature, secret);
  } catch (error) {
    console.error('Erreur vérification signature CinetPay:', error);
    return false;
  }
}

/**
 * Vérifie une signature PayDunya
 * @param payload - Payload du webhook
 * @param signature - Signature reçue
 * @param secret - Clé secrète PayDunya
 * @returns boolean
 */
interface PayDunyaWebhookPayload {
  [key: string]: string | number | boolean;
}

export function verifyPayDunyaSignature(
  payload: PayDunyaWebhookPayload,
  signature: string,
  secret: string
): boolean {
  try {
    // PayDunya utilise généralement le hash des paramètres triés
    const sortedKeys = Object.keys(payload).sort();
    const signatureData = sortedKeys
      .map(key => `${key}=${payload[key]}`)
      .join('&');

    return verifyHmac(signatureData, signature, secret);
  } catch (error) {
    console.error('Erreur vérification signature PayDunya:', error);
    return false;
  }
}