# 🔧 Backend - Logistics PWA API

API REST Node.js/Express avec Socket.IO pour le suivi en temps réel.

## 📦 Installation Rapide

```bash
npm install
npm run dev
```

## 🚀 Scripts Disponibles

| Script | Description |
|--------|-------------|
| `npm start` | Démarre le serveur en production |
| `npm run dev` | Démarre en mode développement avec nodemon |
| `npm test` | Lance les tests avec Jest |
| `npm run seed` | Initialise la base avec des données de test |
| `npm run check-deploy` | ✨ Vérifie la config avant déploiement Render |

## 🔐 Variables d'Environnement

Créez un fichier `.env` basé sur `.env.example` :

```env
# Port du serveur
PORT=5000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/logistics

# JWT
JWT_SECRET=votre_secret_super_long_minimum_32_caracteres
JWT_EXPIRE=7d

# Configuration
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### Pour la Production (Render) :

```env
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/logistics
JWT_SECRET=secret_production_32_caracteres_minimum
JWT_EXPIRE=7d
CORS_ORIGIN=https://votre-frontend.netlify.app
```

## 🏗️ Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js       # Configuration MongoDB
│   ├── models/
│   │   ├── User.js          # Modèle Utilisateur
│   │   └── Task.js          # Modèle Tâche
│   ├── routes/
│   │   ├── auth.js          # Routes authentification
│   │   ├── tasks.js         # Routes tâches
│   │   ├── users.js         # Routes utilisateurs
│   │   └── location.js      # Routes géolocalisation
│   ├── middleware/
│   │   └── auth.js          # Middleware JWT
│   ├── socket/
│   │   └── index.js         # Gestionnaires Socket.IO
│   └── server.js            # Point d'entrée
├── check-deploy.js          # ✨ Script de vérification
├── seed.js                  # Script d'initialisation
├── package.json
├── Dockerfile
└── .env.example
```

## 🔌 Endpoints API

### Authentication (`/api/auth`)

```bash
# Inscription
POST /api/auth/register
Body: { username, email, password, role }

# Connexion
POST /api/auth/login
Body: { username, password }

# Profil utilisateur
GET /api/auth/me
Headers: { Authorization: "Bearer <token>" }
```

### Tasks (`/api/tasks`)

```bash
# Liste des tâches
GET /api/tasks
Headers: { Authorization: "Bearer <token>" }

# Créer une tâche
POST /api/tasks
Headers: { Authorization: "Bearer <token>" }
Body: { title, description, pickupLocation, deliveryLocation, assignedTo }

# Modifier une tâche
PUT /api/tasks/:id
Headers: { Authorization: "Bearer <token>" }
Body: { title, description, ... }

# Changer le statut
PATCH /api/tasks/:id/status
Headers: { Authorization: "Bearer <token>" }
Body: { status: "IN_PROGRESS" }

# Supprimer une tâche
DELETE /api/tasks/:id
Headers: { Authorization: "Bearer <token>" }
```

### Users (`/api/users`)

```bash
# Liste des utilisateurs
GET /api/users
Headers: { Authorization: "Bearer <token>" }

# Liste des coursiers
GET /api/users/couriers
Headers: { Authorization: "Bearer <token>" }
```

### Location (`/api/location`)

```bash
# Mettre à jour la position
POST /api/location/update
Headers: { Authorization: "Bearer <token>" }
Body: { latitude, longitude, taskId }
```

### Health Check

```bash
# Vérifier que le serveur fonctionne
GET /health
# Réponse: { success: true, message: "Server is running", timestamp, uptime }
```

## 🔌 Socket.IO Events

### Client → Server

```javascript
// Mettre à jour la localisation
socket.emit('location:update', {
  userId: '...',
  taskId: '...',
  latitude: 48.8566,
  longitude: 2.3522
});

// Changer le statut d'une tâche
socket.emit('task:status:change', {
  taskId: '...',
  status: 'IN_PROGRESS'
});
```

### Server → Client

```javascript
// Localisation mise à jour
socket.on('location:updated', (data) => {
  console.log('Position:', data);
});

// Nouvelle tâche assignée
socket.on('task:assigned', (task) => {
  console.log('Nouvelle tâche:', task);
});

// Statut de tâche changé
socket.on('task:status:changed', (data) => {
  console.log('Statut:', data);
});

// Notification
socket.on('notification', (notification) => {
  console.log('Notification:', notification);
});
```

## 🧪 Tests

```bash
# Lancer tous les tests
npm test

# Avec coverage
npm test -- --coverage

# Mode watch
npm test -- --watch
```

## 🚀 Déploiement sur Render

### 1. Vérifier avant de déployer

```bash
npm run check-deploy
```

**Résultat attendu** : ✅ ✅ ✅ TOUT EST PARFAIT !

### 2. Configuration Render

| Paramètre | Valeur |
|-----------|--------|
| Build Command | `npm install` |
| Start Command | `npm start` |
| Root Directory | `backend` |
| Plan | `free` |

### 3. Variables d'Environnement Render

- `NODE_ENV=production`
- `PORT=10000`
- `MONGODB_URI` (votre URI MongoDB Atlas)
- `JWT_SECRET` (minimum 32 caractères)
- `JWT_EXPIRE=7d`
- `CORS_ORIGIN=*` (ou URL du frontend)

### 4. Tester après déploiement

```bash
# Health check
curl https://your-service.onrender.com/health

# Login
curl -X POST https://your-service.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

## 🐛 Dépannage

### Le serveur ne démarre pas

1. Vérifiez les variables d'environnement (surtout `MONGODB_URI`)
2. Vérifiez que MongoDB est accessible
3. Consultez les logs : `npm start` (local) ou Dashboard Render (production)

### Erreur de connexion MongoDB

```bash
# Vérifiez la connection string
echo $MONGODB_URI

# Testez la connexion (nécessite mongosh)
mongosh "mongodb+srv://user:pass@cluster.mongodb.net/"
```

### Port déjà utilisé

```bash
# Trouver le processus sur le port 5000
netstat -ano | findstr :5000

# Tuer le processus (Windows)
taskkill /PID <PID> /F

# Ou changez le port dans .env
PORT=5001
```

### CORS Errors

Vérifiez que `CORS_ORIGIN` dans `.env` correspond à l'URL de votre frontend :
```env
CORS_ORIGIN=http://localhost:3000
```

En production :
```env
CORS_ORIGIN=https://votre-frontend.netlify.app
```

## 📚 Documentation Complète

- **[QUICK_DEPLOY.md](../QUICK_DEPLOY.md)** - Déploiement rapide
- **[RENDER_TROUBLESHOOTING.md](../RENDER_TROUBLESHOOTING.md)** - Dépannage Render
- **[DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md)** - Guide complet

## 🔒 Sécurité

- ✅ Helmet.js pour les headers HTTP sécurisés
- ✅ CORS configuré
- ✅ JWT pour l'authentification
- ✅ Validation des données avec express-validator
- ✅ Mots de passe hashés avec bcryptjs
- ✅ Variables d'environnement pour les secrets

## 📊 Performance

- ✅ Compression des réponses
- ✅ Morgan pour le logging
- ✅ Connexion MongoDB optimisée
- ✅ Socket.IO pour le temps réel

## 🤝 Contribution

1. Créer une branche : `git checkout -b feature/ma-feature`
2. Commit : `git commit -m "Ajout de ma feature"`
3. Push : `git push origin feature/ma-feature`
4. Pull Request

## 📝 Licence

MIT
