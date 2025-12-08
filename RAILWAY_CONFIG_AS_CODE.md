# Railway Deployment - Config as Code

## Configuration Automatique

Ce projet utilise un fichier `railway.toml` pour configurer automatiquement le deploiement.

### Fichiers de Configuration

- `railway.toml` - Configuration principale Railway
- `backend/nixpacks.toml` - Configuration du builder Nixpacks
- `backend/Procfile` - Commande de demarrage
- `.env.railway` - Template des variables d'environnement

---

## Deploiement Rapide

### Etape 1 : Push vers GitHub

```bash
git add .
git commit -m "Add Railway config as code"
git push origin main
```

### Etape 2 : Sur Railway

1. Allez sur https://railway.app
2. New Project -> Deploy from GitHub
3. Selectionnez : FayTek_Logistique
4. Railway detectera automatiquement `railway.toml`

### Etape 3 : Variables d'Environnement

Dans Railway UI, ajoutez ces 6 variables :

```
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/logistics
JWT_SECRET=votre_secret_32_caracteres_minimum
JWT_EXPIRE=7d
CORS_ORIGIN=*
```

### Etape 4 : Generate Domain

Settings -> Networking -> Generate Domain

---

## Configuration Expliquee

### railway.toml

```toml
[build]
builder = "nixpacks"           # Utilise Nixpacks
buildCommand = "npm install"    # Commande de build

[deploy]
startCommand = "npm start"      # Commande de demarrage
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[service]
rootDirectory = "/backend"      # Dossier racine du service
```

### backend/nixpacks.toml

```toml
[providers]
node = "18"                     # Version Node.js

[phases.install]
cmds = ["npm install"]          # Installation dependances

[start]
cmd = "npm start"               # Demarrage
```

---

## Troubleshooting

### Build echoue

Verifiez :
- Root Directory = `/backend` dans railway.toml
- package.json existe dans backend/
- Logs Railway pour erreurs specifiques

### Service demarre mais crash

Verifiez :
- Variables d'environnement ajoutees
- MONGODB_URI correcte
- MongoDB Atlas Network Access (0.0.0.0/0)

### "Could not determine how to build"

Railway n'a pas detecte railway.toml :
- Verifiez que railway.toml est a la racine
- Redeploy manuel
- Supprimez et recreez le service

---

## Avantages Config as Code

✅ Configuration versionee avec Git
✅ Reproductible sur plusieurs environnements
✅ Pas besoin de config manuelle UI
✅ Documentation integree

---

## Test

Une fois deploye :

```bash
curl https://votre-projet.up.railway.app/health
```

---

**Documentation Railway** : https://docs.railway.app/deploy/config-as-code
