# Script de preparation pour le deploiement Render (Windows PowerShell)
# Ce script verifie, commit et push tous les changements

Write-Host ""
Write-Host "Preparation pour le deploiement Render..." -ForegroundColor Cyan
Write-Host ""

# 1. Verifier la configuration
Write-Host "Etape 1/4 : Verification de la configuration..." -ForegroundColor Yellow
Set-Location backend
npm run check-deploy

if ($LASTEXITCODE -ne 0) {
    Write-Host "La verification a echoue. Corrigez les erreurs avant de continuer." -ForegroundColor Red
    Set-Location ..
    exit 1
}

Set-Location ..

Write-Host ""
Write-Host "Verification OK!" -ForegroundColor Green
Write-Host ""

# 2. Afficher le statut Git
Write-Host "Etape 2/4 : Statut Git..." -ForegroundColor Yellow
git status

Write-Host ""
$continue = Read-Host "Voulez-vous continuer avec le commit et le push? (o/n)"

if ($continue -ne "o" -and $continue -ne "O") {
    Write-Host "Annule par l'utilisateur." -ForegroundColor Red
    exit 0
}

# 3. Ajouter et commiter
Write-Host ""
Write-Host "Etape 3/4 : Commit des changements..." -ForegroundColor Yellow
git add .

$commitMessage = "Fix: Configuration Render + Documentation deploiement`n`n" +
"* Fix render.yaml (ajout plan free, health check, variables env)`n" +
"* Ajout script de verification pre-deploiement (npm run check-deploy)`n" +
"* Creation guides: QUICK_DEPLOY.md, RENDER_TROUBLESHOOTING.md`n" +
"* Mise a jour DEPLOYMENT_GUIDE.md avec section troubleshooting`n" +
"* Mise a jour README.md avec section deploiement production`n" +
"* Ajout .renderignore pour optimiser le build"

git commit -m $commitMessage

Write-Host ""
Write-Host "Commit effectue!" -ForegroundColor Green
Write-Host ""

# 4. Pusher sur GitHub
Write-Host "Etape 4/4 : Push vers GitHub..." -ForegroundColor Yellow
$push = Read-Host "Pusher maintenant? (o/n)"

if ($push -eq "o" -or $push -eq "O") {
    git push origin main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "PUSH REUSSI!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Prochaines etapes :" -ForegroundColor Cyan
        Write-Host "1. Allez sur https://render.com"
        Write-Host "2. Creez un nouveau Web Service"
        Write-Host "3. Connectez votre repo GitHub"
        Write-Host "4. Suivez QUICK_DEPLOY.md"
        Write-Host ""
    }
    else {
        Write-Host "Erreur lors du push. Verifiez votre connexion GitHub." -ForegroundColor Red
        exit 1
    }
}
else {
    Write-Host "Push annule. Vous pouvez pusher plus tard avec: git push origin main" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Documentation disponible :" -ForegroundColor Cyan
Write-Host "- QUICK_DEPLOY.md - Deploiement en 5 etapes"
Write-Host "- RENDER_TROUBLESHOOTING.md - Resolution de problemes"
Write-Host "- RENDER_FIX_SUMMARY.md - Recapitulatif complet"
Write-Host ""
