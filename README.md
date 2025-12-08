# 🚚 Logistics PWA - Gestion Logistique en Temps Réel

Progressive Web App de gestion logistique avec suivi GPS en temps réel, basée sur la MERN Stack.

## 🎯 Fonctionnalités Principales

- **Gestion Multi-Rôles** : Admin, Dispatcheur, Coursier
- **Suivi GPS en Temps Réel** : Géolocalisation des coursiers via Socket.IO
- **Notifications Push** : Alertes instantanées pour tous les acteurs
- **Workflow de Tâches** : CREATED → IN_PROGRESS → COMPLETED
- **Carte Interactive** : Visualisation en direct des coursiers
- **PWA Mobile** : Installation sur mobile, mode hors-ligne

## 🛠️ Stack Technique

- **Frontend** : React.js + PWA + Leaflet (cartes)
- **Backend** : Node.js + Express.js + Socket.IO
- **Database** : MongoDB
- **Containerisation** : Docker + Docker Compose

## 📁 Structure du Projet

```
logistics-pwa/
├── backend/              # API Node.js/Express + Socket.IO
│   ├── src/
│   │   ├── config/      # Configuration (DB, JWT, Socket)
│   │   ├── models/      # Modèles MongoDB
│   │   ├── routes/      # Routes API
│   │   ├── controllers/ # Logique métier
│   │   ├── middleware/  # Auth, validation
│   │   ├── socket/      # Gestion Socket.IO
│   │   └── server.js    # Point d'entrée
│   ├── Dockerfile
│   └── package.json
├── frontend/            # Application React PWA
│   ├── public/
│   │   ├── manifest.json
│   │   └── service-worker.js
│   ├── src/
│   │   ├── components/  # Composants React
│   │   ├── pages/       # Pages (Admin, Dispatcher, Courier)
│   │   ├── services/    # API calls, Socket.IO client
│   │   ├── context/     # Context API (Auth, Socket)
│   │   └── App.js
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml   # Orchestration complète
└── README.md
```

## 🚀 Démarrage Rapide

### Avec Docker (Recommandé)

```bash
# Cloner le projet
git clone <repo-url>
cd logistics-pwa

# Lancer tous les services
docker-compose up -d

# Accéder à l'application
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
```

### Sans Docker (Développement)

#### Backend
```bash
cd backend
npm install
npm run dev
```

#### Frontend
```bash
cd frontend
npm install
npm start
```

## 👥 Rôles & Permissions

| Rôle | Permissions |
|------|-------------|
| **Admin** | Gestion complète, vue globale de tous les coursiers |
| **Dispatcheur** | Création/affectation de tâches, suivi des coursiers |
| **Coursier** | Consultation des tâches, mise à jour du statut, partage GPS |

## 🔐 Authentification

Le système utilise JWT (JSON Web Tokens) pour l'authentification sécurisée.

**Comptes par défaut** :
- Admin : `admin@logistics.com` / `admin123`
- Dispatcheur : `dispatcher@logistics.com` / `dispatch123`
- Coursier : `courier@logistics.com` / `courier123`

## 📱 Installation PWA

1. Ouvrir l'application dans Chrome/Edge sur mobile
2. Cliquer sur "Ajouter à l'écran d'accueil"
3. L'application s'installe comme une app native

## 🗺️ Suivi GPS en Temps Réel

- **Activation Automatique** : Dès qu'une tâche passe en `IN_PROGRESS`
- **Fréquence** : Position envoyée toutes les 30 secondes
- **Carte Interactive** : Affichage en temps réel sur le dashboard

## 🔔 Notifications Push

Les notifications sont envoyées pour :
- Nouvelle affectation de tâche (→ Coursier)
- Changement de statut (→ Admin/Dispatcheur)
- Modification/Annulation de tâche (→ Coursier)

## 🌐 Variables d'Environnement

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://mongo:27017/logistics
JWT_SECRET=your_super_secret_key_change_in_production
NODE_ENV=production
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Profil utilisateur

### Tasks
- `GET /api/tasks` - Liste des tâches
- `POST /api/tasks` - Créer une tâche
- `PUT /api/tasks/:id` - Modifier une tâche
- `PATCH /api/tasks/:id/status` - Changer le statut
- `DELETE /api/tasks/:id` - Supprimer une tâche

### Users
- `GET /api/users` - Liste des utilisateurs
- `GET /api/users/couriers` - Liste des coursiers

### Location
- `POST /api/location/update` - Mise à jour position GPS

## 🔌 Socket.IO Events

### Client → Server
- `location:update` - Envoi de position GPS
- `task:status:change` - Changement de statut

### Server → Client
- `location:updated` - Position mise à jour
- `task:assigned` - Nouvelle tâche affectée
- `task:status:changed` - Statut modifié
- `notification` - Notification push

## 🧪 Tests

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

## 📦 Build Production

```bash
# Frontend
cd frontend
npm run build

# Backend (déjà prêt avec Docker)
```

## 🚀 Déploiement en Production

### 🌐 Déploiement Rapide (Gratuit)

Le projet peut être déployé gratuitement en 15 minutes :

**Backend** : Render.com (gratuit)
**Base de données** : MongoDB Atlas (gratuit)  
**Frontend** : Netlify (gratuit)

#### Guide Rapide

```bash
# 1. Vérifier que tout est prêt
cd backend
npm run check-deploy

# 2. Pusher sur GitHub
git add .
git commit -m "Ready for deployment"
git push origin main

# 3. Suivre le guide de déploiement
```

📚 **Guides détaillés disponibles** :
- **[QUICK_DEPLOY.md](QUICK_DEPLOY.md)** - Déploiement en 5 étapes (recommandé)
- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Guide complet avec captures d'écran
- **[RENDER_TROUBLESHOOTING.md](RENDER_TROUBLESHOOTING.md)** - Résolution de problèmes

#### Configuration Render.yaml

Le projet inclut un fichier `render.yaml` pour un déploiement automatisé :

```yaml
services:
  - type: web
    name: logistics-backend
    env: node
    plan: free
    rootDir: backend
    buildCommand: npm install
    startCommand: npm start
```

**Variables d'environnement requises** :
- `MONGODB_URI` - Connection string MongoDB Atlas
- `JWT_SECRET` - Secret pour les tokens JWT (32+ caractères)
- `NODE_ENV=production`
- `PORT=10000`
- `CORS_ORIGIN` - URL du frontend ou `*`

#### Test Rapide Post-Déploiement

```bash
# Health check
curl https://votre-service.onrender.com/health

# Test de l'API
curl https://votre-service.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

**⚠️ Note** : Le plan gratuit Render "hiberne" après 15 minutes d'inactivité. Premier chargement : ~30-60 secondes.

## 🐳 Docker

Les images Docker sont optimisées pour la production avec :
- Multi-stage builds
- Optimisation des layers
- Health checks
- Volumes persistants pour MongoDB

## 📝 Licence

MIT

## 👨‍💻 Auteur

Créé avec ❤️ pour une gestion logistique moderne et efficace.
