# 🚀 Guide de Déploiement - La Boucherie Fine

## 📋 Prérequis pour le Déploiement

### Serveur de Production
- **OS** : Ubuntu 20.04+ ou CentOS 8+
- **RAM** : Minimum 2GB (4GB recommandé)
- **Stockage** : Minimum 20GB SSD
- **Node.js** : Version 18+ LTS
- **Base de données** : MySQL 8.0+ ou PostgreSQL 13+
- **Serveur web** : Nginx (recommandé)
- **SSL** : Certificat Let's Encrypt

### Services Externes
- **Email** : Compte SMTP (Gmail, SendGrid, etc.)
- **SMS** : Compte Twilio
- **Stockage** : AWS S3 ou Cloudinary (pour les images)

## 🔧 Configuration du Serveur

### 1. Installation des Dépendances

```bash
# Mise à jour du système
sudo apt update && sudo apt upgrade -y

# Installation de Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Installation de MySQL
sudo apt install mysql-server -y
sudo mysql_secure_installation

# Installation de Nginx
sudo apt install nginx -y

# Installation de PM2 (Process Manager)
sudo npm install -g pm2

# Installation de Certbot (Let's Encrypt)
sudo apt install certbot python3-certbot-nginx -y
```

### 2. Configuration de la Base de Données

```sql
-- Se connecter à MySQL
sudo mysql -u root -p

-- Créer la base de données
CREATE DATABASE boucherie_fine CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Créer un utilisateur dédié
CREATE USER 'boucherie_user'@'localhost' IDENTIFIED BY 'mot_de_passe_securise';
GRANT ALL PRIVILEGES ON boucherie_fine.* TO 'boucherie_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Configuration des Variables d'Environnement

```bash
# Créer le fichier de production
sudo nano /opt/boucherie-fine/backend/.env.production

# Contenu du fichier .env.production
NODE_ENV=production
PORT=3001

# Base de données
DATABASE_URL="mysql://boucherie_user:mot_de_passe_securise@localhost:3306/boucherie_fine"

# JWT
JWT_SECRET="votre_jwt_secret_super_securise_64_caracteres_minimum_2025"
JWT_EXPIRES_IN="7d"

# Email SMTP
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="contact@laboucheriefine.ci"
SMTP_PASS="votre_mot_de_passe_application"

# Twilio SMS
TWILIO_SID="votre_twilio_sid"
TWILIO_TOKEN="votre_twilio_auth_token"
TWILIO_PHONE="+1234567890"

# Autres configurations
CORS_ORIGIN="https://laboucheriefine.ci"
FRONTEND_URL="https://laboucheriefine.ci"
ADMIN_EMAIL="admin@laboucheriefine.ci"
```

## 🏗️ Déploiement du Backend

### 1. Clonage et Installation

```bash
# Créer le répertoire de l'application
sudo mkdir -p /opt/boucherie-fine
sudo chown $USER:$USER /opt/boucherie-fine

# Cloner le projet
cd /opt/boucherie-fine
git clone https://github.com/votre-username/boucherie-fine.git .

# Installation des dépendances backend
cd backend
npm ci --only=production

# Génération du client Prisma
npx prisma generate

# Migration de la base de données
npx prisma migrate deploy

# Build de l'application (si nécessaire)
npm run build
```

### 2. Configuration PM2

```bash
# Créer le fichier de configuration PM2
nano ecosystem.config.js
```

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'boucherie-backend',
    script: './src/app.js',
    cwd: '/opt/boucherie-fine/backend',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    instances: 'max',
    exec_mode: 'cluster',
    error_file: '/var/log/boucherie-fine/backend-error.log',
    out_file: '/var/log/boucherie-fine/backend-out.log',
    log_file: '/var/log/boucherie-fine/backend-combined.log',
    time: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};
```

```bash
# Créer le répertoire de logs
sudo mkdir -p /var/log/boucherie-fine
sudo chown $USER:$USER /var/log/boucherie-fine

# Démarrer l'application avec PM2
pm2 start ecosystem.config.js --env production

# Sauvegarder la configuration PM2
pm2 save

# Configurer PM2 pour démarrer au boot
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp /home/$USER
```

## 🎨 Déploiement du Frontend

### 1. Build et Optimisation

```bash
# Aller dans le répertoire frontend
cd /opt/boucherie-fine/frontend-new

# Installation des dépendances
npm ci

# Build de production
npm run build

# Copier les fichiers vers le répertoire web
sudo mkdir -p /var/www/laboucheriefine.ci
sudo cp -r .next/standalone/* /var/www/laboucheriefine.ci/
sudo cp -r .next/static /var/www/laboucheriefine.ci/.next/
sudo cp -r public /var/www/laboucheriefine.ci/

# Configurer les permissions
sudo chown -R www-data:www-data /var/www/laboucheriefine.ci
sudo chmod -R 755 /var/www/laboucheriefine.ci
```

### 2. Configuration Nginx

```bash
# Créer la configuration du site
sudo nano /etc/nginx/sites-available/laboucheriefine.ci
```

```nginx
# /etc/nginx/sites-available/laboucheriefine.ci
server {
    listen 80;
    server_name laboucheriefine.ci www.laboucheriefine.ci;
    
    # Redirection vers HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name laboucheriefine.ci www.laboucheriefine.ci;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/laboucheriefine.ci/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/laboucheriefine.ci/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    
    # Sécurité
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
    
    # Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 10240;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;
    
    # Cache des assets statiques
    location /_next/static/ {
        alias /var/www/laboucheriefine.ci/.next/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    location /images/ {
        alias /var/www/laboucheriefine.ci/public/images/;
        expires 30d;
        add_header Cache-Control "public";
    }
    
    # Proxy vers l'API Backend
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }
    
    # Frontend Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Logs
    access_log /var/log/nginx/laboucheriefine.ci.access.log;
    error_log /var/log/nginx/laboucheriefine.ci.error.log;
}
```

```bash
# Activer le site
sudo ln -s /etc/nginx/sites-available/laboucheriefine.ci /etc/nginx/sites-enabled/

# Tester la configuration
sudo nginx -t

# Redémarrer Nginx
sudo systemctl restart nginx
```

### 3. Configuration PM2 pour le Frontend

```bash
# Ajouter la configuration frontend au ecosystem.config.js
nano /opt/boucherie-fine/ecosystem.config.js
```

```javascript
module.exports = {
  apps: [
    {
      name: 'boucherie-backend',
      script: './src/app.js',
      cwd: '/opt/boucherie-fine/backend',
      // ... configuration backend
    },
    {
      name: 'boucherie-frontend',
      script: 'server.js',
      cwd: '/var/www/laboucheriefine.ci',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      instances: 1,
      exec_mode: 'fork',
      error_file: '/var/log/boucherie-fine/frontend-error.log',
      out_file: '/var/log/boucherie-fine/frontend-out.log',
      log_file: '/var/log/boucherie-fine/frontend-combined.log',
      time: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    }
  ]
};
```

## 🔒 Configuration SSL

```bash
# Obtenir le certificat SSL
sudo certbot --nginx -d laboucheriefine.ci -d www.laboucheriefine.ci

# Configurer le renouvellement automatique
sudo crontab -e

# Ajouter cette ligne :
0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 Monitoring et Maintenance

### 1. Configuration des Logs

```bash
# Créer le fichier de configuration logrotate
sudo nano /etc/logrotate.d/boucherie-fine
```

```bash
/var/log/boucherie-fine/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        pm2 reload all
    endscript
}
```

### 2. Scripts de Maintenance

```bash
# Créer un script de sauvegarde
sudo nano /opt/boucherie-fine/scripts/backup.sh
```

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/backups/boucherie-fine"
DB_NAME="boucherie_fine"
DB_USER="boucherie_user"
DB_PASS="mot_de_passe_securise"

# Créer le répertoire de sauvegarde
mkdir -p $BACKUP_DIR

# Sauvegarde de la base de données
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME > $BACKUP_DIR/db_backup_$DATE.sql

# Sauvegarde des fichiers uploadés
tar -czf $BACKUP_DIR/uploads_backup_$DATE.tar.gz /opt/boucherie-fine/backend/uploads/

# Nettoyage des anciennes sauvegardes (garder 30 jours)
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "Sauvegarde terminée : $DATE"
```

```bash
# Rendre le script exécutable
sudo chmod +x /opt/boucherie-fine/scripts/backup.sh

# Programmer la sauvegarde quotidienne
sudo crontab -e

# Ajouter :
0 2 * * * /opt/boucherie-fine/scripts/backup.sh >> /var/log/boucherie-fine/backup.log 2>&1
```

### 3. Monitoring avec PM2

```bash
# Installer PM2 Web Monitor
pm2 install pm2-server-monit

# Voir les logs en temps réel
pm2 logs

# Monitoring des ressources
pm2 monit

# Redémarrer les applications
pm2 restart all

# Recharger la configuration
pm2 reload ecosystem.config.js --env production
```

## 🔄 Mise à Jour de l'Application

### Script de Déploiement Automatique

```bash
# Créer le script de déploiement
nano /opt/boucherie-fine/scripts/deploy.sh
```

```bash
#!/bin/bash
# deploy.sh

set -e

echo "🚀 Début du déploiement..."

# Variables
PROJECT_DIR="/opt/boucherie-fine"
BACKUP_DIR="/opt/backups/boucherie-fine"
DATE=$(date +%Y%m%d_%H%M%S)

# Sauvegarde avant mise à jour
echo "📦 Sauvegarde en cours..."
/opt/boucherie-fine/scripts/backup.sh

# Arrêt des services
echo "⏹️ Arrêt des services..."
pm2 stop all

# Mise à jour du code
echo "📥 Récupération du nouveau code..."
cd $PROJECT_DIR
git pull origin main

# Mise à jour des dépendances backend
echo "🔧 Mise à jour du backend..."
cd backend
npm ci --only=production
npx prisma generate
npx prisma migrate deploy

# Mise à jour du frontend
echo "🎨 Mise à jour du frontend..."
cd ../frontend-new
npm ci
npm run build

# Redémarrage des services
echo "🔄 Redémarrage des services..."
pm2 start ecosystem.config.js --env production

# Vérification
echo "✅ Vérification des services..."
sleep 10
pm2 status

echo "🎉 Déploiement terminé avec succès !"
```

## 🚨 Sécurité de Production

### 1. Firewall

```bash
# Configuration UFW
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
```

### 2. Mise à jour automatique des sécurités

```bash
# Configuration des mises à jour automatiques
sudo apt install unattended-upgrades -y
sudo nano /etc/apt/apt.conf.d/50unattended-upgrades

# Activer les mises à jour de sécurité automatiques
sudo dpkg-reconfigure -plow unattended-upgrades
```

### 3. Monitoring de Sécurité

```bash
# Installation de Fail2Ban
sudo apt install fail2ban -y

# Configuration pour Nginx
sudo nano /etc/fail2ban/jail.local
```

```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[nginx-http-auth]
enabled = true

[nginx-limit-req]
enabled = true
```

## 📈 Performance et Optimisation

### 1. Configuration MySQL

```sql
-- /etc/mysql/mysql.conf.d/mysqld.cnf
[mysqld]
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
innodb_file_per_table = 1
innodb_flush_log_at_trx_commit = 2
query_cache_type = 1
query_cache_size = 64M
```

### 2. Configuration Node.js

```bash
# Variables d'environnement pour la production
export NODE_ENV=production
export NODE_OPTIONS="--max-old-space-size=2048"
```

## 🆘 Dépannage

### Problèmes Courants

1. **Erreur de connexion à la DB**
   ```bash
   # Vérifier MySQL
   sudo systemctl status mysql
   # Vérifier les logs
   sudo tail -f /var/log/mysql/error.log
   ```

2. **Frontend ne charge pas**
   ```bash
   # Vérifier PM2
   pm2 status
   pm2 logs boucherie-frontend
   ```

3. **Erreur SSL**
   ```bash
   # Renouveler le certificat
   sudo certbot renew
   sudo systemctl reload nginx
   ```

### Logs Utiles

```bash
# Logs de l'application
tail -f /var/log/boucherie-fine/backend-combined.log
tail -f /var/log/nginx/laboucheriefine.ci.error.log

# Logs système
sudo journalctl -u nginx
sudo journalctl -f
```

---

Ce guide de déploiement couvre tous les aspects de la mise en production de l'application La Boucherie Fine. Adaptez les configurations selon vos besoins spécifiques et votre infrastructure.