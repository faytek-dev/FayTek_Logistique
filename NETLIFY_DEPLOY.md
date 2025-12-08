# 🚀 Guide de Déploiement Netlify (Frontend)

## 📌 Pré-requis

- ✅ Votre code est sur GitHub (déjà fait)
- ✅ Votre Backend est en ligne (Railway)
  - URL Backend : `https://[votre-projet].up.railway.app`

---

## 🚀 Étape 1 : Créer un Nouveau Site sur Netlify

1. **Allez sur** : https://app.netlify.com
2. **Connectez-vous** (GitHub recommandé)
3. **Cliquez** : **"Add new site"** → **"Import from existing project"**
4. **Sélectionnez** : **GitHub**
5. **Choisissez votre repo** : `FayTek_Logistique`

---

## ⚙️ Étape 2 : Configuration du Build

Netlify va détecter la configuration, mais vérifiez ces paramètres :

- **Base directory** : `frontend` ⚠️ (Très important)
- **Build command** : `npm run build`
- **Publish directory** : `build` (ou `frontend/build` si Netlify ne le détecte pas auto)

---

## 🔑 Étape 3 : Variables d'Environnement

Cliquez sur **"Environment variables"** (ou "Advanced" selon l'interface) et ajoutez :

| Key | Value (Exemple) |
|-----|-----------------|
| `REACT_APP_API_URL` | `https://votre-projet.up.railway.app` |
| `REACT_APP_SOCKET_URL` | `https://votre-projet.up.railway.app` |
| `REACT_APP_NAME` | `Logistics PWA` |

⚠️ **IMPORTANT** : Ne mettez pas de slash `/` à la fin de l'URL.
✅ Bon : `https://myapp.up.railway.app`
❌ Mauvais : `https://myapp.up.railway.app/`

---

## 🚀 Étape 4 : Déployer

1. **Cliquez** sur **"Deploy site"**
2. Netlify va construire votre site (1-2 minutes)
3. Une fois terminé, vous aurez une URL : `https://votre-site.netlify.app`

---

## 🌐 Étape 5 : Connecter le Backend

⚠️ **CRITIQUE : CORS**

Maintenant que vous avez l'URL de votre frontend (ex: `https://logistics-pwa.netlify.app`), vous devez mettre à jour votre Backend sur Railway.

1. Allez sur **Railway** → Votre projet Backend
2. Onglet **Variables**
3. Modifiez `CORS_ORIGIN`
   - **Ancienne valeur** : `*` (ou vide)
   - **Nouvelle valeur** : `https://votre-site.netlify.app`

Cela sécurise votre API pour qu'elle n'accepte que les requêtes de votre frontend.

---

## 🐛 Dépannage

### "Page Not Found" sur les routes (ex: /login)
- Vérifiez que `netlify.toml` est bien présent dans le dossier `frontend`.
- Il gère les redirections pour React Router.

### Erreur de connexion API
- Ouvrez la console du navigateur (F12)
- Vérifiez si `REACT_APP_API_URL` est correcte
- Vérifiez si vous avez des erreurs CORS

### Build Failed
- Vérifiez que le "Base directory" est bien `frontend`
- Vérifiez les logs Netlify

---

## 🎉 Félicitations !

Votre application complète (Fullstack) est maintenant en ligne !
- **Frontend** : Netlify
- **Backend** : Railway
- **Database** : MongoDB Atlas
