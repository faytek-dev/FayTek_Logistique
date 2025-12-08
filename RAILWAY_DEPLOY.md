# 🚂 Guide de Deploiement Railway.app

## ✅ Avantages de Railway

- ✅ **Pas de carte bancaire requise** pour commencer
- ✅ 500 heures gratuites par mois
- ✅ Deploy automatique depuis GitHub
- ✅ Logs en temps reel

---

## 🚀 Etapes de Deploiement

### Etape 1 : Pusher les Configs (2 min)

```powershell
cd c:\Users\DELL\.gemini\antigravity\scratch\logistics-pwa
.\push-railway-config.ps1
```

OU manuellement :
```powershell
git add backend/nixpacks.toml backend/railway.json
git commit -m "Add Railway config"
git push origin main
```

---

### Etape 2 : Creer le Projet Railway (3 min)

1. **Allez sur** : https://railway.app
2. **Connectez GitHub** (si pas deja fait)
3. **Cliquez** : **New Project**
4. **Selectionnez** : **Deploy from GitHub repo**
5. **Choisissez** : `FayTek_Logistique`

---

### Etape 3 : Configuration du Service

Railway va detecter automatiquement :
- ✅ Node.js (grace a nixpacks.toml)
- ✅ Commande de build : `npm install`
- ✅ Commande de start : `npm start`

#### Important : Root Directory

Railway deploy tout le repo par defaut. Vous devez specifier le dossier backend :

1. Dans le dashboard Railway, cliquez sur votre service
2. **Settings** → **Root Directory**
3. Entrez : `backend`
4. **Save**

---

### Etape 4 : Variables d'Environnement

1. **Cliquez** : **Variables**
2. **Ajoutez** ces 6 variables :

| Variable | Valeur |
|----------|--------|
| `NODE_ENV` | `production` |
| `PORT` | `3000` (Railway assigne automatiquement) |
| `MONGODB_URI` | Votre URI MongoDB Atlas |
| `JWT_SECRET` | `votre_secret_32_caracteres_minimum` |
| `JWT_EXPIRE` | `7d` |
| `CORS_ORIGIN` | `*` |

3. **Deploy** → Railway redeploit automatiquement

---

### Etape 5 : MongoDB Atlas (5 min)

Si pas encore fait :

1. **Allez sur** : https://www.mongodb.com/cloud/atlas/register
2. **Creez cluster M0** (gratuit)
3. **Creez utilisateur** de base de donnees
4. **Network Access** → Ajouter : `0.0.0.0/0`
5. **Copiez** connection string :
   ```
   mongodb+srv://user:pass@cluster.mongodb.net/logistics
   ```
6. **Collez** dans variable `MONGODB_URI` sur Railway

---

### Etape 6 : Generer une URL Publique

1. Dans le dashboard Railway
2. **Settings** → **Networking**
3. **Generate Domain**
4. Railway vous donne une URL comme :
   ```
   https://votre-projet.up.railway.app
   ```

---

### Etape 7 : Tester (1 min)

```powershell
# Remplacez par votre vraie URL
curl https://votre-projet.up.railway.app/health
```

**Reponse attendue** :
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "...",
  "uptime": 123
}
```

---

## 🐛 Depannage Railway

### Erreur : "npm: not found"

✅ **RESOLU** : Les fichiers `nixpacks.toml` et `railway.json` sont maintenant ajoutes.

Assurez-vous que :
- Root Directory = `backend`
- Les fichiers sont bien sur GitHub

---

### Build echoue

**Verifiez** :
1. Logs Railway (onglet Deployments)
2. Root Directory = `backend`
3. package.json existe dans backend/

---

### Service demarre mais crash

**Verifiez** :
1. Variable `MONGODB_URI` correcte
2. MongoDB Atlas Network Access (0.0.0.0/0)
3. Logs pour erreurs specifiques

---

### "Out of credits"

Railway offre **500h gratuites/mois**.

**Calculer** :
- 1 service = ~720h/mois (24h x 30j)
- Plan gratuit = suffisant pour tests
- Pour production : ajouter carte (5$/mois)

---

## 📊 Comparaison Railway vs Render

| Critere | Railway | Render |
|---------|---------|--------|
| Carte requise | ❌ Non | ✅ Oui |
| Heures gratuites | 500h/mois | Illimite |
| Mise en veille | Non | Oui (15min) |
| Deploy auto | ✅ Oui | ✅ Oui |
| Facilite | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

---

## ✅ Checklist Deploiement

- [ ] Configs Railway poussees sur GitHub
- [ ] MongoDB Atlas configure
- [ ] Projet cree sur Railway
- [ ] Root Directory = `backend`
- [ ] 6 variables d'environnement ajoutees
- [ ] Domain genere
- [ ] Health check OK

---

## 🆘 Support

**Documentation** : https://docs.railway.app
**Community** : https://discord.gg/railway

---

**Temps total** : 15 minutes
**Cout** : GRATUIT (sans carte)
**Difficulte** : ⭐⭐ (Facile)
