# 🚀 Guide de Démarrage Rapide - Logistics PWA

## Prérequis

- **Docker** et **Docker Compose** installés
- OU **Node.js 18+** et **MongoDB** pour le développement local

---

## Option 1: Démarrage avec Docker (Recommandé)

### 1. Cloner et configurer

```bash
cd C:\Users\DELL\.gemini\antigravity\scratch\logistics-pwa

# Copier les variables d'environnement
copy .env.example .env
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
```

### 2. Lancer tous les services

```bash
docker-compose up -d
```

Cette commande va :
- ✅ Démarrer MongoDB sur le port 27017
- ✅ Démarrer le Backend API + Socket.IO sur le port 5000
- ✅ Démarrer le Frontend React PWA sur le port 3000

### 3. Initialiser la base de données

```bash
# Accéder au conteneur backend
docker exec -it logistics-backend sh

# Exécuter le script de seed
npm run seed

# Sortir du conteneur
exit
```

### 4. Accéder à l'application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **MongoDB**: localhost:27017

### 5. Vérifier les logs

```bash
# Tous les services
docker-compose logs -f

# Backend uniquement
docker-compose logs -f backend

# Frontend uniquement
docker-compose logs -f frontend
```

### 6. Arrêter les services

```bash
# Arrêter
docker-compose down

# Arrêter et supprimer les volumes (⚠️ supprime les données)
docker-compose down -v
```

---

## Option 2: Développement Local (Sans Docker)

### 1. Installer MongoDB

Télécharger et installer MongoDB Community Edition depuis:
https://www.mongodb.com/try/download/community

Démarrer MongoDB:
```bash
mongod
```

### 2. Backend

```bash
cd backend

# Installer les dépendances
npm install

# Copier et configurer .env
copy .env.example .env

# Modifier .env pour utiliser MongoDB local
# MONGODB_URI=mongodb://localhost:27017/logistics

# Initialiser la base de données
npm run seed

# Démarrer le serveur en mode développement
npm run dev
```

Le backend sera accessible sur http://localhost:5000

### 3. Frontend

```bash
cd frontend

# Installer les dépendances
npm install

# Copier et configurer .env
copy .env.example .env

# Démarrer le serveur de développement
npm start
```

Le frontend sera accessible sur http://localhost:3000

---

## 👥 Comptes de Démonstration

Après avoir exécuté le script `seed`, vous pouvez vous connecter avec :

### Administrateur
- **Email**: admin@logistics.com
- **Mot de passe**: admin123
- **Accès**: Dashboard admin, vue globale, gestion utilisateurs

### Dispatcheur
- **Email**: dispatcher@logistics.com
- **Mot de passe**: dispatch123
- **Accès**: Création de tâches, affectation, suivi des coursiers

### Coursier
- **Email**: courier@logistics.com
- **Mot de passe**: courier123
- **Accès**: Consultation des tâches, mise à jour du statut, GPS

### Coursier 2
- **Email**: courier2@logistics.com
- **Mot de passe**: courier123
- **Accès**: Même que Coursier 1

---

## 📱 Tester la PWA sur Mobile

### 1. Exposer votre serveur local

Utilisez votre adresse IP locale au lieu de localhost:

```bash
# Trouver votre IP locale
ipconfig  # Windows
ifconfig  # Mac/Linux
```

### 2. Modifier les URLs

Dans `frontend/.env`:
```env
REACT_APP_API_URL=http://VOTRE_IP:5000
REACT_APP_SOCKET_URL=http://VOTRE_IP:5000
```

### 3. Accéder depuis mobile

Sur votre mobile (connecté au même réseau WiFi):
- Ouvrir Chrome/Safari
- Aller sur `http://VOTRE_IP:3000`
- Cliquer sur "Ajouter à l'écran d'accueil"

### 4. Tester le GPS

- Se connecter en tant que coursier
- Passer une tâche en statut "IN_PROGRESS"
- Le GPS s'active automatiquement
- La position est envoyée toutes les 30 secondes
- Les admins/dispatchers voient la position en temps réel sur la carte

---

## 🧪 Tester les Fonctionnalités

### Workflow Complet

1. **En tant que Dispatcher** (dispatcher@logistics.com):
   - Créer une nouvelle tâche
   - Assigner la tâche à un coursier
   - Observer la carte de suivi

2. **En tant que Coursier** (courier@logistics.com):
   - Voir la nouvelle tâche assignée
   - Recevoir une notification push
   - Passer la tâche en "IN_PROGRESS"
   - Le GPS s'active automatiquement
   - Terminer la tâche ("COMPLETED")

3. **En tant qu'Admin** (admin@logistics.com):
   - Voir toutes les tâches
   - Voir tous les coursiers sur la carte
   - Consulter les statistiques

### Tester Socket.IO en Temps Réel

1. Ouvrir deux navigateurs:
   - Navigateur 1: Connexion en tant que Dispatcher
   - Navigateur 2: Connexion en tant que Coursier

2. Dans Navigateur 1 (Dispatcher):
   - Créer une tâche et l'assigner au coursier

3. Dans Navigateur 2 (Coursier):
   - Observer la notification instantanée
   - La tâche apparaît immédiatement

4. Dans Navigateur 2 (Coursier):
   - Changer le statut de la tâche

5. Dans Navigateur 1 (Dispatcher):
   - Observer la mise à jour instantanée du statut

---

## 🔧 Dépannage

### Le backend ne démarre pas

```bash
# Vérifier que MongoDB est en cours d'exécution
docker ps  # Avec Docker
mongosh    # Sans Docker

# Vérifier les logs
docker-compose logs backend
```

### Le frontend ne se connecte pas au backend

1. Vérifier que le backend est accessible:
   ```bash
   curl http://localhost:5000/health
   ```

2. Vérifier les variables d'environnement dans `frontend/.env`

3. Vérifier la console du navigateur pour les erreurs CORS

### Socket.IO ne fonctionne pas

1. Vérifier que le token JWT est valide
2. Ouvrir la console du navigateur et chercher les erreurs Socket.IO
3. Vérifier que le backend accepte les connexions WebSocket

### Le GPS ne fonctionne pas

1. Vérifier que le navigateur a la permission de géolocalisation
2. Utiliser HTTPS en production (le GPS nécessite HTTPS)
3. Vérifier la console pour les erreurs de géolocalisation

---

## 📊 API Endpoints

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Profil utilisateur

### Tâches
- `GET /api/tasks` - Liste des tâches
- `POST /api/tasks` - Créer une tâche
- `PUT /api/tasks/:id` - Modifier une tâche
- `PATCH /api/tasks/:id/status` - Changer le statut
- `DELETE /api/tasks/:id` - Supprimer une tâche

### Utilisateurs
- `GET /api/users` - Liste des utilisateurs (Admin)
- `GET /api/users/couriers` - Liste des coursiers
- `PATCH /api/users/availability` - Changer la disponibilité

### Géolocalisation
- `POST /api/location/update` - Mettre à jour la position
- `GET /api/location/couriers` - Positions des coursiers
- `GET /api/location/nearby` - Coursiers à proximité

---

## 🎯 Prochaines Étapes

1. ✅ Tester toutes les fonctionnalités
2. ✅ Personnaliser les variables d'environnement
3. ✅ Ajouter vos propres utilisateurs
4. ✅ Déployer en production (voir README.md)

---

## 📞 Support

Pour toute question ou problème, consultez:
- Le fichier README.md principal
- Les logs Docker: `docker-compose logs -f`
- La documentation de l'API: http://localhost:5000

Bon développement ! 🚀
