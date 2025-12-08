# 🏗️ Architecture Technique - Logistics PWA

## Vue d'Ensemble

L'application Logistics PWA est une solution complète de gestion logistique avec suivi GPS en temps réel, construite sur la MERN Stack avec Socket.IO pour les communications bidirectionnelles.

---

## 📊 Architecture Globale

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         React PWA (Progressive Web App)              │   │
│  │  - Service Worker (Cache, Offline, Notifications)   │   │
│  │  - React Router (SPA Routing)                        │   │
│  │  - Context API (State Management)                    │   │
│  │  - Leaflet (Maps & GPS Tracking)                     │   │
│  │  - Socket.IO Client (Real-time)                      │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/WebSocket
┌─────────────────────────────────────────────────────────────┐
│                       SERVER LAYER                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Node.js + Express.js Backend                 │   │
│  │  - RESTful API (CRUD Operations)                     │   │
│  │  - JWT Authentication & Authorization                │   │
│  │  - Socket.IO Server (Real-time Events)               │   │
│  │  - Middleware (Auth, CORS, Helmet, etc.)             │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ Mongoose ODM
┌─────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                    MongoDB                           │   │
│  │  - Collections: users, tasks, notifications          │   │
│  │  - Geospatial Indexes (2dsphere)                     │   │
│  │  - Persistent Volumes                                │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Système d'Authentification

### Flow d'Authentification

```
1. User Login
   ↓
2. Backend vérifie credentials (bcrypt)
   ↓
3. Génère JWT Token (jsonwebtoken)
   ↓
4. Client stocke token (localStorage)
   ↓
5. Toutes les requêtes incluent token (Authorization: Bearer)
   ↓
6. Middleware vérifie token à chaque requête
   ↓
7. Socket.IO utilise le même token pour auth
```

### Rôles et Permissions

| Rôle | Permissions |
|------|-------------|
| **Admin** | - Toutes les opérations CRUD<br>- Gestion des utilisateurs<br>- Vue globale de tous les coursiers<br>- Accès à toutes les tâches |
| **Dispatcher** | - Créer/Modifier/Supprimer ses tâches<br>- Assigner des tâches aux coursiers<br>- Voir tous les coursiers (pour affectation)<br>- Recevoir notifications de statut |
| **Courier** | - Voir ses tâches assignées<br>- Mettre à jour le statut des tâches<br>- Partager sa position GPS<br>- Recevoir notifications d'affectation |

---

## 🗺️ Système de Géolocalisation

### Architecture GPS

```
┌─────────────────────────────────────────────────────────────┐
│                    COURIER DEVICE                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  navigator.geolocation.watchPosition()               │   │
│  │  - Précision élevée (enableHighAccuracy: true)       │   │
│  │  - Mise à jour toutes les 30 secondes                │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓ Socket.IO Event
                    'location:update' { lat, lng }
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      BACKEND SERVER                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Socket Handler                                       │   │
│  │  1. Valide le coursier (role === 'courier')          │   │
│  │  2. Met à jour MongoDB (currentLocation)             │   │
│  │  3. Broadcast aux rooms 'admin' et 'dispatcher'      │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓ Socket.IO Event
                    'location:updated' { courierId, lat, lng }
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                 ADMIN/DISPATCHER DASHBOARD                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Leaflet Map Component                               │   │
│  │  - Affiche marqueurs en temps réel                   │   │
│  │  - Met à jour positions automatiquement              │   │
│  │  - Popup avec infos coursier                         │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Déclenchement Automatique

Le suivi GPS s'active **automatiquement** lorsque :
1. Le coursier passe une tâche de `CREATED` → `IN_PROGRESS`
2. `navigator.geolocation.watchPosition()` démarre
3. Position envoyée via Socket.IO toutes les 30s
4. Le suivi s'arrête quand la tâche passe à `COMPLETED`

---

## 🔔 Système de Notifications

### Architecture des Notifications

```
┌─────────────────────────────────────────────────────────────┐
│                    EVENT TRIGGERS                            │
│  - Nouvelle tâche assignée                                   │
│  - Changement de statut (IN_PROGRESS, COMPLETED)            │
│  - Modification de tâche                                     │
│  - Annulation de tâche                                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND NOTIFICATION                       │
│  1. Créer notification dans MongoDB                          │
│  2. Émettre événement Socket.IO vers user spécifique         │
│  3. Envoyer à la room: `user_${userId}`                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  CLIENT NOTIFICATION                         │
│  1. Recevoir événement Socket.IO                             │
│  2. Afficher toast notification (react-toastify)             │
│  3. Déclencher Service Worker notification (PWA)             │
│  4. Notification push même si app fermée                     │
└─────────────────────────────────────────────────────────────┘
```

### Types de Notifications

| Type | Destinataire | Déclencheur |
|------|--------------|-------------|
| `task_assigned` | Coursier | Dispatcher assigne une tâche |
| `task_updated` | Coursier | Dispatcher modifie une tâche |
| `task_cancelled` | Coursier | Dispatcher annule une tâche |
| `status_changed` | Admin/Dispatcher | Coursier change le statut |
| `location_update` | Admin/Dispatcher | Position GPS mise à jour |

---

## 🔄 Workflow des Tâches

### États et Transitions

```
┌──────────┐
│ CREATED  │ ← Tâche créée par Dispatcher
└────┬─────┘
     │ Coursier clique "Commencer"
     ↓
┌──────────────┐
│ IN_PROGRESS  │ ← GPS activé automatiquement
└────┬─────────┘
     │ Coursier clique "Terminer"
     ↓
┌───────────┐
│ COMPLETED │ ← GPS désactivé
└───────────┘

     OU

┌──────────┐
│ CREATED  │
└────┬─────┘
     │ Admin/Dispatcher annule
     ↓
┌───────────┐
│ CANCELLED │
└───────────┘
```

### Validation des Transitions

Le backend valide les transitions autorisées :

```javascript
const validTransitions = {
  'CREATED': ['IN_PROGRESS', 'CANCELLED'],
  'IN_PROGRESS': ['COMPLETED', 'CANCELLED'],
  'COMPLETED': [],
  'CANCELLED': []
};
```

---

## 🌐 Communication en Temps Réel (Socket.IO)

### Architecture Socket.IO

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT CONNECTION                         │
│  socket.io-client                                            │
│  - Auth avec JWT token                                       │
│  - Reconnexion automatique                                   │
│  - Transports: WebSocket, Polling                            │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    SOCKET.IO SERVER                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Middleware d'authentification                       │   │
│  │  - Vérifie JWT token                                 │   │
│  │  - Attache user à socket                             │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Rooms Management                                    │   │
│  │  - user_${userId} (notifications personnelles)       │   │
│  │  - role_admin (broadcast aux admins)                 │   │
│  │  - role_dispatcher (broadcast aux dispatchers)       │   │
│  │  - role_courier (broadcast aux coursiers)            │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Événements Socket.IO

#### Client → Server

| Événement | Émetteur | Données | Description |
|-----------|----------|---------|-------------|
| `location:update` | Courier | `{ lat, lng }` | Mise à jour position GPS |
| `location:request:all` | Admin/Dispatcher | - | Demande toutes les positions |
| `task:status:change` | Courier | `{ taskId, status }` | Changement de statut |

#### Server → Client

| Événement | Destinataire | Données | Description |
|-----------|--------------|---------|-------------|
| `location:updated` | Admin/Dispatcher | `{ courierId, lat, lng }` | Position mise à jour |
| `location:all` | Admin/Dispatcher | `{ couriers: [...] }` | Toutes les positions |
| `task:assigned` | Courier | `{ task, notification }` | Nouvelle tâche |
| `task:updated` | Courier | `{ task }` | Tâche modifiée |
| `task:status:changed` | Admin/Dispatcher | `{ task, status }` | Statut changé |
| `notification` | Tous | `{ title, message, data }` | Notification générique |

---

## 📦 Modèles de Données (MongoDB)

### User Schema

```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique, lowercase),
  password: String (hashed with bcrypt),
  role: Enum ['admin', 'dispatcher', 'courier'],
  phone: String,
  isActive: Boolean,
  
  // Pour les coursiers uniquement
  currentLocation: {
    type: 'Point',
    coordinates: [longitude, latitude]
  },
  lastLocationUpdate: Date,
  availability: Enum ['available', 'busy', 'offline'],
  
  createdAt: Date,
  updatedAt: Date
}
```

### Task Schema

```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  priority: Enum ['low', 'medium', 'high', 'urgent'],
  status: Enum ['CREATED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
  
  pickupAddress: {
    street: String,
    city: String,
    postalCode: String,
    fullAddress: String,
    location: {
      type: 'Point',
      coordinates: [longitude, latitude]
    }
  },
  
  deliveryAddress: { /* same as pickupAddress */ },
  
  recipient: {
    name: String,
    phone: String,
    email: String
  },
  
  createdBy: ObjectId (ref: 'User'),
  assignedTo: ObjectId (ref: 'User'),
  
  statusHistory: [{
    status: String,
    timestamp: Date,
    updatedBy: ObjectId,
    note: String
  }],
  
  scheduledPickupTime: Date,
  scheduledDeliveryTime: Date,
  actualPickupTime: Date,
  actualDeliveryTime: Date,
  
  notes: String,
  proofOfDelivery: {
    signature: String,
    photo: String,
    timestamp: Date
  },
  
  createdAt: Date,
  updatedAt: Date
}
```

### Notification Schema

```javascript
{
  _id: ObjectId,
  recipient: ObjectId (ref: 'User'),
  type: Enum ['task_assigned', 'task_updated', 'task_cancelled', 'status_changed', 'location_update'],
  title: String,
  message: String,
  relatedTask: ObjectId (ref: 'Task'),
  isRead: Boolean,
  readAt: Date,
  data: Mixed,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🚀 Progressive Web App (PWA)

### Fonctionnalités PWA

1. **Service Worker**
   - Cache des assets statiques
   - Cache des API calls (Network First)
   - Fonctionnement hors ligne
   - Notifications push

2. **Manifest.json**
   - Installation sur écran d'accueil
   - Mode standalone (plein écran)
   - Icônes et splash screens
   - Shortcuts (raccourcis)

3. **Notifications Push**
   - Permission demandée au premier lancement
   - Notifications même app fermée
   - Actions dans les notifications
   - Badge sur l'icône

4. **Géolocalisation en Arrière-Plan**
   - `watchPosition()` continue même app en arrière-plan
   - Précision élevée
   - Économie de batterie optimisée

---

## 🐳 Déploiement Docker

### Architecture Docker

```
┌─────────────────────────────────────────────────────────────┐
│                    docker-compose.yml                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   MongoDB    │  │   Backend    │  │   Frontend   │      │
│  │   :27017     │  │   :5000      │  │   :3000      │      │
│  │              │  │              │  │   (Nginx)    │      │
│  │  Volume:     │  │  Depends:    │  │  Depends:    │      │
│  │  mongo-data  │  │  - mongo     │  │  - backend   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         ↕                  ↕                  ↕              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           logistics-network (bridge)                 │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Health Checks

Chaque service a un health check :
- **MongoDB**: `mongosh ping`
- **Backend**: `curl /health`
- **Frontend**: `wget /`

---

## 🔒 Sécurité

### Mesures de Sécurité Implémentées

1. **Authentification**
   - Mots de passe hashés avec bcrypt (10 rounds)
   - JWT avec expiration (7 jours par défaut)
   - Tokens stockés en localStorage (HTTPS requis en prod)

2. **Autorisation**
   - Middleware de vérification de rôle
   - Permissions granulaires par endpoint
   - Validation des transitions de statut

3. **Headers de Sécurité (Helmet)**
   - X-Frame-Options: SAMEORIGIN
   - X-Content-Type-Options: nosniff
   - X-XSS-Protection: 1; mode=block

4. **CORS**
   - Origine configurée via env variable
   - Credentials autorisés

5. **Validation**
   - express-validator sur les inputs
   - Mongoose schema validation
   - Sanitization des données

---

## 📈 Performance

### Optimisations

1. **Frontend**
   - Code splitting (React.lazy)
   - Service Worker caching
   - Compression Gzip (Nginx)
   - Assets optimisés

2. **Backend**
   - Compression middleware
   - MongoDB indexes (geospatial, compound)
   - Connection pooling
   - Pagination des résultats

3. **Database**
   - Indexes sur les champs fréquemment requêtés
   - Geospatial indexes (2dsphere)
   - Projection pour limiter les données

---

## 🧪 Tests

### Stratégie de Tests

1. **Backend**
   - Tests unitaires (Jest)
   - Tests d'intégration API
   - Tests Socket.IO

2. **Frontend**
   - Tests de composants (React Testing Library)
   - Tests E2E (Cypress - à implémenter)

3. **PWA**
   - Lighthouse audits
   - Tests de notifications
   - Tests hors ligne

---

## 📚 Technologies Utilisées

### Backend
- **Node.js** 18+
- **Express.js** 4.18
- **MongoDB** 7.0
- **Mongoose** 8.0
- **Socket.IO** 4.6
- **JWT** (jsonwebtoken)
- **Bcrypt** (bcryptjs)

### Frontend
- **React** 18.2
- **React Router** 6.20
- **Leaflet** 1.9 + React-Leaflet 4.2
- **Socket.IO Client** 4.6
- **Axios** 1.6
- **React Toastify** 9.1
- **Workbox** 7.0 (PWA)

### DevOps
- **Docker** + Docker Compose
- **Nginx** (Frontend serving)
- **Git** (Version control)

---

## 🎯 Conclusion

Cette architecture offre :
- ✅ **Scalabilité** : Microservices containerisés
- ✅ **Temps Réel** : Socket.IO bidirectionnel
- ✅ **Mobilité** : PWA installable
- ✅ **Sécurité** : JWT + RBAC + Helmet
- ✅ **Performance** : Caching + Indexes + Compression
- ✅ **Maintenabilité** : Code modulaire et documenté

Pour plus de détails, consultez :
- `README.md` - Vue d'ensemble
- `GETTING_STARTED.md` - Guide de démarrage
- Code source avec commentaires
