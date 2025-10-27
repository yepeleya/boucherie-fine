# 🥩 La Boucherie Fine - Site Web Restaurant

## 📋 Description

La Boucherie Fine est un site web moderne et spectaculaire pour un restaurant spécialisé dans les viandes premium à Abidjan, Côte d'Ivoire. Ce projet comprend un backend robuste avec API REST et un frontend élégant développé avec les technologies les plus récentes.

## 🚀 Technologies Utilisées

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **Prisma** - ORM pour base de données
- **MySQL** - Base de données
- **JWT** - Authentification
- **bcrypt** - Hachage des mots de passe
- **Nodemailer** - Envoi d'emails
- **Twilio** - Envoi de SMS

### Frontend
- **Next.js 15.5.4** - Framework React avec App Router
- **TypeScript** - Typage statique
- **TailwindCSS** - Framework CSS utilitaire
- **Framer Motion** - Animations fluides
- **Heroicons** - Icônes modernes

## 📁 Structure du Projet

```
boucherie-fine/
├── backend/                 # API Node.js + Express
│   ├── src/
│   │   ├── routes/         # Routes API (utilisateurs, produits, commandes, etc.)
│   │   ├── controllers/    # Logique métier
│   │   ├── middlewares/    # Middlewares (auth, validation)
│   │   ├── utils/          # Utilitaires (mail, SMS)
│   │   └── app.js          # Point d'entrée de l'application
│   ├── prisma/
│   │   ├── schema.prisma   # Schéma de base de données
│   │   └── migrations/     # Migrations de base de données
│   └── package.json
├── frontend-new/           # Frontend Next.js
│   ├── src/
│   │   ├── app/           # Pages (App Router)
│   │   │   ├── page.tsx          # Page d'accueil
│   │   │   ├── menus/            # Page des menus
│   │   │   ├── reservations/     # Page de réservation
│   │   │   ├── commandes/        # Page de commande
│   │   │   ├── actualites/       # Page des actualités
│   │   │   ├── a-propos/         # Page à propos
│   │   │   └── contact/          # Page de contact
│   │   ├── components/    # Composants réutilisables
│   │   │   ├── Header.tsx        # En-tête avec navigation
│   │   │   ├── Footer.tsx        # Pied de page
│   │   │   ├── Preloader.tsx     # Écran de chargement
│   │   │   └── HeroSlider.tsx    # Carrousel hero
│   │   └── styles/        # Styles CSS
│   └── public/            # Assets statiques
├── docs/                  # Documentation
└── README.md
```

## 🎨 Fonctionnalités Frontend

### ✨ Design Spectaculaire
- **Preloader animé** avec logo et barre de progression
- **Hero slider** avec 3 diapositives et transitions fluides
- **Animations** avec Framer Motion pour une expérience immersive
- **Design responsive** optimisé pour tous les appareils

### 📄 Pages Principales
1. **Accueil** - Hero slider, présentation, spécialités
2. **Menus** - Catalogue interactif avec filtres
3. **Réservations** - Formulaire de réservation avec validation
4. **Commandes** - Système de commande en ligne avec panier
5. **Actualités** - Blog avec modal et newsletter
6. **À propos** - Histoire, équipe, valeurs
7. **Contact** - Formulaire de contact et informations

### 🔧 Composants Techniques
- **Header responsive** avec menu mobile
- **Footer complet** avec informations de contact
- **Formulaires validés** avec gestion d'état
- **Système de notifications** pour les actions utilisateur

## 🔗 API Backend

### 🔐 Authentification
```
POST /api/auth/register    # Inscription
POST /api/auth/login       # Connexion
POST /api/auth/logout      # Déconnexion
```

### 👥 Utilisateurs
```
GET    /api/utilisateurs           # Liste des utilisateurs
POST   /api/utilisateurs          # Créer un utilisateur
PUT    /api/utilisateurs/:id      # Modifier un utilisateur
DELETE /api/utilisateurs/:id      # Supprimer un utilisateur
```

### 🍽️ Produits
```
GET    /api/produits              # Liste des produits
POST   /api/produits              # Créer un produit
PUT    /api/produits/:id          # Modifier un produit
DELETE /api/produits/:id          # Supprimer un produit
```

### 📦 Commandes
```
GET    /api/commandes             # Liste des commandes
POST   /api/commandes             # Créer une commande
PUT    /api/commandes/:id         # Modifier une commande
DELETE /api/commandes/:id         # Supprimer une commande
```

### 📅 Réservations
```
GET    /api/reservations          # Liste des réservations
POST   /api/reservations          # Créer une réservation
PUT    /api/reservations/:id      # Modifier une réservation
DELETE /api/reservations/:id      # Supprimer une réservation
```

### 💳 Paiements
```
GET    /api/paiements             # Liste des paiements
POST   /api/paiements             # Créer un paiement
PUT    /api/paiements/:id         # Modifier un paiement
```

## 🛠️ Installation et Configuration

### Prérequis
- Node.js 18+
- npm ou yarn
- MySQL/MariaDB
- Git

### Installation Backend

1. **Cloner le projet**
```bash
git clone <url-du-repo>
cd boucherie-fine/backend
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration de l'environnement**
```bash
cp .env.example .env
# Éditer le fichier .env avec vos configurations
```

4. **Configuration de la base de données**
```bash
npx prisma migrate dev
npx prisma generate
```

5. **Démarrer le serveur**
```bash
npm run dev
```

### Installation Frontend

1. **Naviguer vers le frontend**
```bash
cd frontend-new
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Démarrer le serveur de développement**
```bash
npm run dev
```

4. **Ouvrir dans le navigateur**
```
http://localhost:3000
```

## 🎯 Fonctionnalités Clés

### 🎨 Design et UX
- ✅ Design moderne et professionnel
- ✅ Animations fluides et spectaculaires
- ✅ Interface responsive (mobile-first)
- ✅ Chargement optimisé avec preloader
- ✅ Navigation intuitive

### 🔒 Sécurité
- ✅ Authentification JWT
- ✅ Hachage des mots de passe avec bcrypt
- ✅ Validation des données d'entrée
- ✅ Protection des routes API

### 📱 Fonctionnalités Business
- ✅ Système de réservation en ligne
- ✅ Commande en ligne avec panier
- ✅ Gestion des menus et produits
- ✅ Blog d'actualités
- ✅ Formulaire de contact
- ✅ Notifications par email et SMS

## 🚀 Déploiement

### Production Backend
```bash
npm run build
npm start
```

### Production Frontend
```bash
npm run build
npm start
```

## 📝 Variables d'Environnement

### Backend (.env)
```env
DATABASE_URL="mysql://user:password@localhost:3306/boucherie_fine"
JWT_SECRET="your-jwt-secret"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
TWILIO_SID="your-twilio-sid"
TWILIO_TOKEN="your-twilio-token"
TWILIO_PHONE="your-twilio-phone"
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche pour votre feature (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👥 Équipe

- **Développeur Full-Stack** - Développement complet de l'application
- **Designer UI/UX** - Conception de l'interface utilisateur
- **Chef de Projet** - Gestion et coordination

## 📞 Support

Pour toute question ou support, veuillez contacter :
- Email: contact@laboucheriefine.ci
- Téléphone: 0544 54 47 35

---

**La Boucherie Fine** - Excellence culinaire depuis 2008 🥩✨
