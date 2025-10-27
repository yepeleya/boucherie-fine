# 🔧 Guide Développeur - La Boucherie Fine

## 📚 Documentation Technique

### Architecture du Projet

Le projet suit une architecture moderne séparée :
- **Backend** : API REST avec Node.js + Express + Prisma
- **Frontend** : Application Next.js 15 avec App Router

### Structure de Base de Données

#### Tables Principales

```sql
-- Utilisateurs
Users {
  id: Int @id @default(autoincrement())
  email: String @unique
  password: String
  nom: String
  prenom: String
  telephone: String?
  role: Role @default(CLIENT)
  createdAt: DateTime @default(now())
  updatedAt: DateTime @updatedAt
}

-- Produits/Plats
Products {
  id: Int @id @default(autoincrement())
  nom: String
  description: String
  prix: Decimal
  categorie: String
  image: String?
  disponible: Boolean @default(true)
  createdAt: DateTime @default(now())
  updatedAt: DateTime @updatedAt
}

-- Commandes
Orders {
  id: Int @id @default(autoincrement())
  userId: Int
  total: Decimal
  statut: OrderStatus @default(EN_ATTENTE)
  adresseLivraison: String?
  commentaires: String?
  createdAt: DateTime @default(now())
  updatedAt: DateTime @updatedAt
}

-- Réservations
Reservations {
  id: Int @id @default(autoincrement())
  userId: Int
  dateReservation: DateTime
  nombrePersonnes: Int
  commentaires: String?
  statut: ReservationStatus @default(EN_ATTENTE)
  createdAt: DateTime @default(now())
  updatedAt: DateTime @updatedAt
}
```

### API Endpoints Détaillés

#### Authentication Routes
```javascript
// POST /api/auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "nom": "Dupont",
  "prenom": "Jean",
  "telephone": "+225XXXXXXXX"
}

// POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

// Response
{
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "nom": "Dupont",
    "prenom": "Jean",
    "role": "CLIENT"
  }
}
```

#### Products Routes
```javascript
// GET /api/produits
// Response
[
  {
    "id": 1,
    "nom": "Entrecôte de Bœuf",
    "description": "Entrecôte de bœuf premium...",
    "prix": 12500,
    "categorie": "VIANDES",
    "image": "/images/entrecote.jpg",
    "disponible": true
  }
]

// POST /api/produits (Admin only)
{
  "nom": "Nouveau Plat",
  "description": "Description du plat",
  "prix": 15000,
  "categorie": "VIANDES",
  "image": "/images/nouveau-plat.jpg"
}
```

#### Orders Routes
```javascript
// POST /api/commandes
{
  "produits": [
    {
      "productId": 1,
      "quantite": 2,
      "prix": 12500
    }
  ],
  "adresseLivraison": "Cocody, Abidjan",
  "commentaires": "Sans épices"
}

// GET /api/commandes (User's orders)
[
  {
    "id": 1,
    "total": 25000,
    "statut": "EN_PREPARATION",
    "adresseLivraison": "Cocody, Abidjan",
    "createdAt": "2025-01-04T20:00:00Z",
    "produits": [...]
  }
]
```

#### Reservations Routes
```javascript
// POST /api/reservations
{
  "dateReservation": "2025-01-15T19:00:00Z",
  "nombrePersonnes": 4,
  "commentaires": "Table près de la fenêtre"
}

// GET /api/reservations (User's reservations)
[
  {
    "id": 1,
    "dateReservation": "2025-01-15T19:00:00Z",
    "nombrePersonnes": 4,
    "statut": "CONFIRMEE",
    "commentaires": "Table près de la fenêtre"
  }
]
```

### Middleware d'Authentification

```javascript
// middlewares/auth.js
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token manquant' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token invalide' });
    }
    req.user = user;
    next();
  });
};
```

### Validation des Données

```javascript
// Exemple de validation pour les commandes
const validateOrder = (req, res, next) => {
  const { produits, adresseLivraison } = req.body;
  
  if (!produits || !Array.isArray(produits) || produits.length === 0) {
    return res.status(400).json({ 
      message: 'La commande doit contenir au moins un produit' 
    });
  }
  
  if (!adresseLivraison || adresseLivraison.trim().length < 10) {
    return res.status(400).json({ 
      message: 'L\'adresse de livraison est requise et doit être détaillée' 
    });
  }
  
  next();
};
```

### Gestion des Erreurs

```javascript
// utils/errorHandler.js
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  // Erreur de validation Prisma
  if (err.code === 'P2002') {
    return res.status(400).json({
      message: 'Cette valeur existe déjà en base de données'
    });
  }
  
  // Erreur JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      message: 'Token invalide'
    });
  }
  
  // Erreur par défaut
  res.status(500).json({
    message: 'Erreur interne du serveur'
  });
};
```

### Configuration Email (Nodemailer)

```javascript
// utils/mail.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const sendOrderConfirmation = async (userEmail, orderDetails) => {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: userEmail,
    subject: 'Confirmation de commande - La Boucherie Fine',
    html: `
      <h2>Votre commande a été confirmée !</h2>
      <p>Numéro de commande : ${orderDetails.id}</p>
      <p>Total : ${orderDetails.total} FCFA</p>
      <p>Merci de votre confiance !</p>
    `
  };
  
  await transporter.sendMail(mailOptions);
};
```

### Configuration SMS (Twilio)

```javascript
// utils/sms.js
const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_TOKEN
);

const sendReservationSMS = async (phone, reservationDetails) => {
  await client.messages.create({
    body: `Réservation confirmée chez La Boucherie Fine le ${reservationDetails.date} pour ${reservationDetails.personnes} personnes.`,
    from: process.env.TWILIO_PHONE,
    to: phone
  });
};
```

## Frontend - Next.js Architecture

### Structure des Composants

```
src/
├── app/                    # App Router pages
│   ├── layout.tsx         # Layout racine
│   ├── page.tsx           # Page d'accueil
│   ├── menus/
│   │   └── page.tsx       # Page des menus
│   ├── reservations/
│   │   └── page.tsx       # Page de réservation
│   └── ...
├── components/            # Composants réutilisables
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── Preloader.tsx
│   └── HeroSlider.tsx
└── styles/               # Styles globaux
    └── globals.css
```

### Composant Header Exemple

```typescript
// components/Header.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { name: 'Accueil', href: '/' },
    { name: 'Menus', href: '/menus' },
    { name: 'Réservations', href: '/reservations' },
    // ...
  ];

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white shadow-lg' : 'bg-transparent'
    }`}>
      {/* Header content */}
    </header>
  );
}
```

### Animations avec Framer Motion

```typescript
// Exemple d'animation pour les pages
import { motion } from 'framer-motion';

export default function AnimatedPage({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}
```

### Gestion d'État avec useState

```typescript
// Exemple pour un formulaire de réservation
const [formData, setFormData] = useState({
  date: '',
  heure: '',
  personnes: 2,
  nom: '',
  email: '',
  telephone: '',
  commentaires: ''
});

const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  setFormData(prev => ({
    ...prev,
    [name]: value
  }));
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    const response = await fetch('/api/reservations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(formData)
    });
    
    if (response.ok) {
      // Succès
      setShowSuccess(true);
    }
  } catch (error) {
    console.error('Erreur:', error);
  }
};
```

### Configuration TailwindCSS

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'boucherie': {
          'red': '#DC2626',
          'amber': '#F59E0B',
          'dark': '#1F2937'
        }
      },
      fontFamily: {
        'serif': ['Georgia', 'serif'],
        'sans': ['Inter', 'sans-serif']
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out'
      }
    },
  },
  plugins: [],
}
```

### Tests Recommandés

```javascript
// Jest + React Testing Library
import { render, screen, fireEvent } from '@testing-library/react';
import Header from '../components/Header';

describe('Header Component', () => {
  test('renders navigation items', () => {
    render(<Header />);
    expect(screen.getByText('Accueil')).toBeInTheDocument();
    expect(screen.getByText('Menus')).toBeInTheDocument();
  });

  test('toggles mobile menu', () => {
    render(<Header />);
    const menuButton = screen.getByRole('button');
    fireEvent.click(menuButton);
    // Vérifier que le menu mobile s'ouvre
  });
});
```

### Performance et Optimisation

1. **Images** : Utiliser Next.js Image component
2. **Lazy Loading** : Composants avec dynamic import
3. **Code Splitting** : Automatique avec Next.js
4. **SEO** : Metadata API de Next.js 13+

```typescript
// app/menus/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nos Menus - La Boucherie Fine',
  description: 'Découvrez notre sélection de viandes premium et plats gastronomiques.',
  keywords: 'restaurant, viande, Abidjan, gastronomie'
};
```

### Déploiement

#### Vercel (Recommandé pour Next.js)
```bash
npm install -g vercel
vercel
```

#### Build local
```bash
npm run build
npm start
```

### Monitoring et Logs

```javascript
// utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

---

Cette documentation technique vous guide à travers tous les aspects du développement du projet La Boucherie Fine. N'hésitez pas à la compléter selon vos besoins spécifiques.