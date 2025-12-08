# Guide de Test - Système de Commandes & Paiements
## La Boucherie-Fine

### 📋 Configuration Requise

#### 1. Variables d'environnement (.env.local)
```env
# Base de données
DATABASE_URL="mysql://root:@localhost:3306/boucherie_fine"

# JWT & Auth
JWT_SECRET="votre_jwt_secret_super_securise_ici"
NEXTAUTH_SECRET="votre_jwt_secret_super_securise_ici"
NEXTAUTH_URL="http://localhost:3000"

# CinetPay (Production)
CINETPAY_API_KEY="YOUR_CINETPAY_API_KEY"
CINETPAY_SITE_ID="YOUR_CINETPAY_SITE_ID" 
CINETPAY_SECRET="YOUR_CINETPAY_SECRET"

# Email (Optionnel)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
ADMIN_EMAIL="admin@boucherie-fine.ci"
```

### 🚀 Installation & Démarrage

```bash
# Frontend
cd frontend
npm install
npx prisma generate
npx prisma db push
npm run dev

# Backend (si séparé)
cd backend
npm install
npm run dev
```

### 🧪 Tests avec Postman

#### 1. Importer la collection
- Importer `postman_collection.json`
- Configurer l'environnement avec `baseUrl = http://localhost:3000`

#### 2. Workflow de test complet

1. **Authentification** 
   - Créer un utilisateur test
   - Login → récupérer le token

2. **Créer une commande**
   - POST `/api/commandes` avec items
   - Vérifier création + paiement init

3. **Simuler paiement réussi**
   - POST `/api/paiements/webhook` avec payload succès
   - Vérifier changement statut commande

4. **Gestion admin**
   - GET `/api/commandes` (liste)
   - PUT `/api/commandes/{id}/statut`

### 🔧 Test Webhook avec webhook.site

#### 1. Configuration temporaire
```bash
# Remplacer dans .env.local pour tests
NEXTAUTH_URL="https://your-ngrok-url.ngrok.io"

# Ou utiliser webhook.site
# notify_url: "https://webhook.site/your-unique-url"
```

#### 2. Simuler webhooks CinetPay

**Webhook Succès:**
```json
{
  "cpm_trans_id": "BF_CMD_123_1701234567890",
  "cpm_amount": "15000",
  "cpm_currency": "XOF", 
  "cpm_payid": "CINETPAY_12345",
  "cpm_result": "00",
  "cpm_trans_status": "ACCEPTED",
  "cpm_payment_date": "2025-12-08",
  "cpm_payment_time": "21:30:00"
}
```

**Webhook Échec:**
```json
{
  "cpm_trans_id": "BF_CMD_123_1701234567890", 
  "cpm_result": "01",
  "cpm_trans_status": "REFUSED",
  "cpm_error_message": "Insufficient funds"
}
```

### 📊 Vérification Idempotence

1. Envoyer le même webhook 2 fois
2. Vérifier que seul le 1er est traité
3. Le 2ème doit retourner "Paiement déjà traité"

### 🔒 Test Sécurité HMAC

#### 1. Générer signature valide
```javascript
const crypto = require('crypto');
const payload = JSON.stringify(webhookData);
const signature = crypto
  .createHmac('sha256', process.env.CINETPAY_SECRET)
  .update(payload)
  .digest('hex');
```

#### 2. Tests à effectuer
- ✅ Webhook avec signature valide → 200 OK
- ❌ Webhook sans signature → 403 Forbidden  
- ❌ Webhook signature incorrecte → 403 Forbidden

### 📈 Lifecycle Testing

#### Parcours complet à tester:
```
EN_ATTENTE → PAYEE → CONFIRMEE → EN_PREPARATION → PRETE → LIVREE
```

#### Transitions interdites à vérifier:
- EN_ATTENTE → EN_PREPARATION ❌
- LIVREE → EN_PREPARATION ❌  
- ANNULEE → PAYEE ❌

### 🚨 Tests d'Erreur

#### 1. Validation commandes
- Items vides → 400
- Total incorrect → 400  
- Produit inexistant → 400
- Stock insuffisant → 400

#### 2. Authentification
- Token manquant → 401
- Token expiré → 401
- Rôle insuffisant → 403

#### 3. Paiements
- Paiement inexistant → 404
- Paiement déjà traité → 400
- Webhook signature invalide → 403

### 📧 Test Notifications

#### Email en développement
```bash
# Logs simulés si SMTP non configuré
# Vérifier dans console serveur:
# "Simulation email confirmation pour commande CMD_123"
```

#### Configuration Gmail (production)
```env
SMTP_USER="your-gmail@gmail.com"
SMTP_PASS="your-16-char-app-password" # Pas le mdp Gmail!
```

### 🔄 Tests Socket.io (si implémenté)

1. Ouvrir dashboard admin
2. Créer nouvelle commande
3. Vérifier réception en temps réel
4. Modifier statut → notification temps réel

### 📝 Logs & Monitoring

#### Points de logging importants:
- Création commande → `evenements_commande`
- Webhook reçu → Console + DB
- Erreurs paiement → Logs erreur
- Transitions statut → Audit trail

#### Commandes debug:
```bash
# Voir logs Prisma
DEBUG="prisma:*" npm run dev

# Logs webhook détaillés  
NODE_ENV="development" npm run dev
```

### 🎯 Checklist Final

- [ ] Base de données synchronisée
- [ ] Toutes les routes API répondent
- [ ] Authentification JWT fonctionne
- [ ] Création commande + calcul total
- [ ] Webhook HMAC vérifié
- [ ] Idempotence testée
- [ ] Transitions statut validées
- [ ] Emails/notifications envoyés
- [ ] Collection Postman complète
- [ ] Tests sécurité passés

### 🌐 Déploiement Production

#### 1. Variables d'environnement production
```env
# CinetPay Production
CINETPAY_API_KEY="prod_api_key"
CINETPAY_SITE_ID="prod_site_id"
CINETPAY_SECRET="prod_webhook_secret"

# Base de données sécurisée
DATABASE_URL="mysql://user:password@prod-host/db"

# Domaine production
NEXTAUTH_URL="https://laboucherie-fine.ci"
```

#### 2. Sécurité production
- HTTPS obligatoire pour webhooks
- Validation CORS stricte
- Rate limiting sur APIs
- Logs centralisés (Winston/Sentry)

### 📞 Support & Debug

En cas de problème:
1. Vérifier logs console serveur
2. Tester webhook avec webhook.site
3. Vérifier signature HMAC manuellement  
4. Contrôler base de données directement
5. Tester avec Postman collection fournie