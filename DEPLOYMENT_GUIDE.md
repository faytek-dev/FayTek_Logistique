# 🚀 Guide de Déploiement en Ligne (Sans Docker)

Ce guide vous permet de mettre votre application **FayTek Logistique** en ligne gratuitement, accessible depuis n'importe où, sans utiliser Docker.

---

## 📋 Vue d'ensemble

1.  **Base de données** : MongoDB Atlas (Cloud)
2.  **Backend** : Render.com (Serveur Node.js)
3.  **Frontend** : Netlify (Hébergement React)

---

## Étape 1 : La Base de Données (MongoDB Atlas)

1.  Allez sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) et créez un compte gratuit.
2.  Créez un nouveau cluster (sélectionnez **M0 Free**).
3.  Créez un utilisateur de base de données :
    *   Username: `admin`
    *   Password: (choisissez un mot de passe fort, ex: `Logistics2024!`)
4.  Dans "Network Access", ajoutez l'adresse IP `0.0.0.0/0` (pour autoriser l'accès depuis n'importe où).
5.  Cliquez sur **Connect** > **Drivers**.
6.  Copiez votre **Connection String**. Elle ressemble à :
    `mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
7.  Gardez cette URL précieusement (remplacez `<password>` par votre vrai mot de passe).

---

## Étape 2 : Le Backend (Render)

1.  Poussez votre code sur **GitHub** (si ce n'est pas déjà fait).
    *   Créez un repo sur GitHub.
    *   `git init`
    *   `git add .`
    *   `git commit -m "Initial commit"`
    *   `git remote add origin <votre-repo-url>`
    *   `git push -u origin main`

2.  Allez sur [Render.com](https://render.com) et créez un compte.
3.  Cliquez sur **New +** et sélectionnez **Web Service**.
4.  Connectez votre compte GitHub et sélectionnez votre repo `FayTek_Logistique`.
5.  Configurez le service :
    *   **Name**: `logistics-backend`
    *   **Root Directory**: `backend`
    *   **Environment**: `Node`
    *   **Build Command**: `npm install`
    *   **Start Command**: `npm start`
    *   **Plan**: Free

6.  Descendez jusqu'à **Environment Variables** et ajoutez :
    *   `MONGODB_URI` : (Collez votre URL MongoDB Atlas de l'étape 1)
    *   `JWT_SECRET` : (Inventez un code secret long)
    *   `NODE_ENV` : `production`
    *   `CORS_ORIGIN` : `*` (Pour commencer, on restreindra plus tard)

7.  Cliquez sur **Create Web Service**.
8.  Attendez que le déploiement finisse. Render vous donnera une URL (ex: `https://logistics-backend-xyz.onrender.com`).
    *   **Copiez cette URL.**

---

## Étape 3 : Le Frontend (Netlify)

1.  Allez sur [Netlify](https://www.netlify.com) et créez un compte.
2.  Cliquez sur **Add new site** > **Import from existing project**.
3.  Connectez **GitHub** et choisissez le même repo.
4.  Configurez le build :
    *   **Base directory**: `frontend`
    *   **Build command**: `npm run build`
    *   **Publish directory**: `frontend/build`

5.  Cliquez sur **Environment variables** (ou allez dans Site settings > Environment variables après) et ajoutez :
    *   `REACT_APP_API_URL` : (Collez l'URL de votre backend Render)
    *   `REACT_APP_SOCKET_URL` : (Collez la même URL Render)

6.  Cliquez sur **Deploy site**.

---

## 🎉 C'est fini !

Netlify vous donnera une URL (ex: `https://faytek-logistics.netlify.app`).

1.  Ouvrez cette URL sur votre PC et votre mobile.
2.  Connectez-vous avec les comptes par défaut (si vous avez lancé le seed) ou créez un nouveau compte.

### ⚠️ Note importante pour le compte gratuit Render

Le service gratuit de Render se met en "veille" après 15 minutes d'inactivité.
*   Le **premier chargement** peut prendre 50 secondes (le temps que le serveur se réveille).
*   Ensuite, c'est rapide.
*   Pour une vraie production, le plan à 7$/mois supprime ce délai.
