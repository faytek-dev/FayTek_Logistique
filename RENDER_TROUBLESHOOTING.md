# 🔧 Guide de Dépannage Render

## Problèmes Courants et Solutions

### 1. ❌ Le service ne démarre pas

**Symptômes** : Le service affiche "Deploy failed" ou redémarre constamment.

**Solutions** :

#### A. Vérifiez les logs Render
1. Allez sur votre dashboard Render
2. Cliquez sur votre service `logistics-backend`
3. Cliquez sur l'onglet **Logs**
4. Recherchez les messages d'erreur en rouge

#### B. Erreurs communes dans les logs

**Erreur : `Error: Cannot find module`**
```bash
Solution : Vérifiez que toutes les dépendances sont dans package.json
Exécutez : npm install
Commitez : git add package-lock.json && git commit -m "Update deps" && git push
```

**Erreur : `MongooseServerSelectionError`**
```bash
Solution : Problème de connexion MongoDB Atlas
1. Vérifiez que MONGODB_URI est correcte
2. Vérifiez que l'IP 0.0.0.0/0 est autorisée dans MongoDB Atlas
3. Vérifiez que le mot de passe MongoDB ne contient pas de caractères spéciaux non encodés
```

**Erreur : `EADDRINUSE` (Port déjà utilisé)**
```bash
Solution : Render définit automatiquement le PORT
1. Allez dans Environment Variables
2. Vérifiez que PORT = 10000
3. Vérifiez que votre code utilise process.env.PORT
```

### 2. ⏱️ Le service prend trop de temps à démarrer

**Normal** : Le plan gratuit de Render "hiberne" après 15 minutes d'inactivité.
- Premier chargement : 30-60 secondes
- Chargements suivants : 1-3 secondes

**Solutions** :
- Passez au plan payant ($7/mois) pour éliminer l'hibernation
- Utilisez un service de "ping" pour garder le service actif (ex: UptimeRobot)

### 3. 🔒 Erreurs CORS

**Symptômes** : Frontend ne peut pas se connecter au backend, erreurs dans la console navigateur.

**Solutions** :

#### Dans Render Environment Variables :
```
CORS_ORIGIN=https://votre-frontend-netlify.app
```

#### OU pour plusieurs domaines :
```
CORS_ORIGIN=https://votre-frontend-netlify.app,http://localhost:3000,http://localhost:4000
```

### 4. 🔐 Problèmes de MongoDB Atlas

#### A. Connection Refused
1. Allez sur MongoDB Atlas → Network Access
2. Vérifiez que `0.0.0.0/0` est dans la liste
3. Si non, cliquez sur **Add IP Address** → **Allow Access from Anywhere**

#### B. Authentication Failed
1. Vérifiez votre `MONGODB_URI` dans Render
2. Format correct : `mongodb+srv://username:password@cluster.xxxxx.mongodb.net/database?retryWrites=true&w=majority`
3. Remplacez `<password>` par votre VRAI mot de passe
4. Si le mot de passe contient des caractères spéciaux, encodez-le : https://www.urlencoder.org/

### 5. 🌐 Le service se déploie mais les routes ne fonctionnent pas

**Test de santé** :
```bash
# Dans votre navigateur ou terminal
curl https://votre-service.onrender.com/health

# Réponse attendue :
{"success":true,"message":"Server is running","timestamp":"...","uptime":123}
```

**Si /health fonctionne mais pas /api/*** :
1. Vérifiez que toutes vos routes sont bien exportées
2. Vérifiez les middlewares (auth, CORS, etc.)
3. Vérifiez les logs pour les erreurs 404 ou 500

### 6. 📦 Dépendances manquantes

**Erreur : Module non trouvé en production**

```bash
# Sur votre machine locale :
npm install
npm prune
git add package.json package-lock.json
git commit -m "Fix dependencies"
git push

# Render redéploiera automatiquement
```

### 7. 🔄 Forcer un redéploiement

Si rien ne fonctionne :

1. Dashboard Render → Votre service
2. Cliquez sur **Manual Deploy** → **Clear build cache & deploy**
3. Attendez le redéploiement complet

### 8. 📝 Variables d'environnement manquantes

**Liste complète requise** :
- ✅ `NODE_ENV=production`
- ✅ `PORT=10000`
- ✅ `MONGODB_URI=mongodb+srv://...`
- ✅ `JWT_SECRET=minimum_32_caracteres_secret_key`
- ✅ `JWT_EXPIRE=7d`
- ✅ `CORS_ORIGIN=*` (ou votre domaine frontend)

### 9. 🚨 Le service redémarre en boucle

**Causes possibles** :
1. Erreur dans le code (crash au démarrage)
2. Port incorrect
3. MongoDB inaccessible
4. Mémoire insuffisante (plan gratuit = 512MB)

**Solutions** :
1. Consultez les logs pour l'erreur exacte
2. Testez localement avec : `NODE_ENV=production npm start`
3. Réduisez l'utilisation mémoire si nécessaire

### 10. 📞 Tester votre API manuellement

```bash
# Test de base
curl https://votre-service.onrender.com/

# Test de connexion
curl -X POST https://votre-service.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"adminpass"}'

# Devrait retourner un token JWT
```

---

## ✅ Checklist de déploiement

Avant de contacter le support, vérifiez :

- [ ] Code pushé sur GitHub
- [ ] Toutes les variables d'environnement sont définies
- [ ] MongoDB Atlas accessible (IP 0.0.0.0/0)
- [ ] `package.json` contient tous les scripts nécessaires
- [ ] `npm install` fonctionne localement
- [ ] Build command = `npm install`
- [ ] Start command = `npm start`
- [ ] Root directory = `backend`
- [ ] Plan = `free`
- [ ] Health check path = `/health`

---

## 🆘 Support

Si le problème persiste :

1. **Render Status** : https://status.render.com/
2. **Render Community** : https://community.render.com/
3. **Documentation** : https://render.com/docs

**Export des logs** :
1. Dashboard → Logs
2. Cliquez sur l'icône de téléchargement
3. Envoyez les logs à votre équipe de support
