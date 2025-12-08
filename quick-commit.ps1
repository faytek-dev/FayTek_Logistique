# Script simple pour commit et push les changements
# Usage: .\quick-commit.ps1

Write-Host ""
Write-Host "=== Commit et Push Rapide ===" -ForegroundColor Cyan
Write-Host ""

# Afficher le statut
Write-Host "Statut actuel:" -ForegroundColor Yellow
git status --short

Write-Host ""
$continue = Read-Host "Continuer avec le commit? (o/n)"

if ($continue -ne "o" -and $continue -ne "O") {
    Write-Host "Annule." -ForegroundColor Red
    exit 0
}

# Ajouter tous les fichiers
Write-Host ""
Write-Host "Ajout des fichiers..." -ForegroundColor Yellow
git add .

# Commit
Write-Host "Commit..." -ForegroundColor Yellow
git commit -m "Fix: Configuration Render pour deploiement"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Erreur lors du commit." -ForegroundColor Red
    exit 1
}

Write-Host "Commit OK!" -ForegroundColor Green
Write-Host ""

# Push
$push = Read-Host "Pusher vers GitHub maintenant? (o/n)"

if ($push -eq "o" -or $push -eq "O") {
    Write-Host "Push en cours..." -ForegroundColor Yellow
    git push origin main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "=== SUCCES ===" -ForegroundColor Green
        Write-Host ""
        Write-Host "Code pousse sur GitHub!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Prochaine etape: Deployer sur Render" -ForegroundColor Cyan
        Write-Host "Consultez QUICK_DEPLOY.md pour les instructions" -ForegroundColor Cyan
        Write-Host ""
    }
    else {
        Write-Host ""
        Write-Host "Erreur lors du push." -ForegroundColor Red
        Write-Host "Verifiez votre connexion GitHub." -ForegroundColor Red
        exit 1
    }
}
else {
    Write-Host ""
    Write-Host "Push annule." -ForegroundColor Yellow
    Write-Host "Pour pusher plus tard: git push origin main" -ForegroundColor Yellow
    Write-Host ""
}
