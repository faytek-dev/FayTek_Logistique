# Script pour synchroniser et pusher vers GitHub
# Gere les conflits automatiquement

Write-Host ""
Write-Host "=== Synchronisation GitHub ===" -ForegroundColor Cyan
Write-Host ""

# 1. Ajouter les fichiers
Write-Host "Ajout des fichiers..." -ForegroundColor Yellow
git add .

# 2. Commit
Write-Host "Commit..." -ForegroundColor Yellow
git commit -m "Fix: Configuration Render pour deploiement"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Rien a commiter (deja commit)" -ForegroundColor Yellow
}

# 3. Pull avec rebase
Write-Host "Synchronisation avec GitHub..." -ForegroundColor Yellow
git pull origin main --rebase

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Conflit detecte. Resolution..." -ForegroundColor Yellow
    git pull origin main --allow-unrelated-histories
}

# 4. Push
Write-Host "Push vers GitHub..." -ForegroundColor Yellow
git push origin main

# Verification
if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=== SUCCES ===" -ForegroundColor Green
    Write-Host "Code synchronise et pousse sur GitHub!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Prochaine etape: Deployer sur Render" -ForegroundColor Cyan
    Write-Host "Consultez QUICK_DEPLOY.md" -ForegroundColor Cyan
    Write-Host ""
}
else {
    Write-Host ""
    Write-Host "=== ERREUR ===" -ForegroundColor Red
    Write-Host ""
    Write-Host "Options:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Force push (ecrase GitHub):" -ForegroundColor White
    Write-Host "   git push -f origin main" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "2. Pull manuel puis push:" -ForegroundColor White
    Write-Host "   git pull origin main --allow-unrelated-histories" -ForegroundColor Cyan
    Write-Host "   git push origin main" -ForegroundColor Cyan
    Write-Host ""
}
