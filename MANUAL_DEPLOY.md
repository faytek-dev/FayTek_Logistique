# 🚀 Deploiement Manuel - Commandes Git

Si les scripts PowerShell ne fonctionnent pas, utilisez ces commandes manuelles.

## Etape 1: Verifier la configuration

```powershell
cd backend
npm run check-deploy
cd ..
```

**Attendu:** "TOUT EST PARFAIT !"

---

## Etape 2: Voir les changements

```powershell
git status
```

---

## Etape 3: Ajouter tous les fichiers

```powershell
git add .
```

---

## Etape 4: Commit

```powershell
git commit -m "Fix: Configuration Render pour deploiement"
```

---

## Etape 5: Push vers GitHub

```powershell
git push origin main
```

Si erreur "no upstream branch":
```powershell
git push -u origin main
```

---

## Verification

```powershell
git log -1
```

Devrait montrer votre dernier commit.

---

## Alternative: Une seule commande

```powershell
git add . ; git commit -m "Fix: Configuration Render" ; git push origin main
```

---

## En cas d'erreur

### "nothing to commit"
Tous les fichiers sont deja commites. C'est OK!

### "remote rejected"
Verifiez vos permissions GitHub.

### "Authentication failed"
Configurez votre token GitHub:
```powershell
git config --global user.name "Votre Nom"
git config --global user.email "votre@email.com"
```

---

## Apres le Push

1. Allez sur https://render.com
2. New + → Web Service
3. Connectez votre repo GitHub
4. Suivez QUICK_DEPLOY.md (etape 4)

---

## Commandes Utiles

```powershell
# Voir l'historique
git log --oneline -5

# Voir les fichiers modifies
git status --short

# Annuler le dernier commit (garde les changements)
git reset --soft HEAD~1

# Voir les remotes
git remote -v
```

---

**Besoin d'aide?** Consultez RENDER_TROUBLESHOOTING.md
