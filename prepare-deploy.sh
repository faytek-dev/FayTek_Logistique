#!/bin/bash

# Script de préparation pour le déploiement Render
# Ce script vérifie, commit et push tous les changements

echo "🚀 Préparation pour le déploiement Render..."
echo ""

# 1. Vérifier la configuration
echo "📋 Étape 1/4 : Vérification de la configuration..."
cd backend
npm run check-deploy

if [ $? -ne 0 ]; then
    echo "❌ La vérification a échoué. Corrigez les erreurs avant de continuer."
    exit 1
fi

cd ..

echo ""
echo "✅ Vérification OK!"
echo ""

# 2. Afficher le statut Git
echo "📋 Étape 2/4 : Statut Git..."
git status

echo ""
read -p "Voulez-vous continuer avec le commit et le push? (o/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Oo]$ ]]; then
    echo "❌ Annulé par l'utilisateur."
    exit 0
fi

# 3. Ajouter et commiter
echo "📋 Étape 3/4 : Commit des changements..."
git add .
git commit -m "Fix: Configuration Render + Documentation déploiement

- Fix render.yaml (ajout plan free, health check, variables env)
- Ajout script de vérification pré-déploiement (npm run check-deploy)
- Création guides: QUICK_DEPLOY.md, RENDER_TROUBLESHOOTING.md, RENDER_FIX_SUMMARY.md
- Mise à jour DEPLOYMENT_GUIDE.md avec section troubleshooting
- Mise à jour README.md avec section déploiement production
- Ajout .renderignore pour optimiser le build
"

echo ""
echo "✅ Commit effectué!"
echo ""

# 4. Pusher sur GitHub
echo "📋 Étape 4/4 : Push vers GitHub..."
read -p "Pusher maintenant? (o/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Oo]$ ]]; then
    git push origin main
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ ✅ ✅ PUSH RÉUSSI! ✅ ✅ ✅"
        echo ""
        echo "🎉 Prochaines étapes :"
        echo "1. Allez sur https://render.com"
        echo "2. Créez un nouveau Web Service"
        echo "3. Connectez votre repo GitHub"
        echo "4. Suivez QUICK_DEPLOY.md"
        echo ""
    else
        echo "❌ Erreur lors du push. Vérifiez votre connexion GitHub."
        exit 1
    fi
else
    echo "ℹ️  Push annulé. Vous pouvez pusher plus tard avec: git push origin main"
fi

echo ""
echo "📚 Documentation disponible :"
echo "- QUICK_DEPLOY.md - Déploiement en 5 étapes"
echo "- RENDER_TROUBLESHOOTING.md - Résolution de problèmes"
echo "- RENDER_FIX_SUMMARY.md - Récapitulatif complet"
echo ""
