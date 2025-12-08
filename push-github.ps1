# Script simple pour pusher vers GitHub
# Usage: .\push-github.ps1

Write-Host ""
Write-Host "=== Push vers GitHub ===" -ForegroundColor Cyan
Write-Host ""

# Ajouter tous les fichiers
Write-Host "Ajout des fichiers..." -ForegroundColor Yellow
git add .

# Commit
Write-Host "Commit..." -ForegroundColor Yellow
git commit -m "Fix: Configuration Render pour deploiement"

# Push
Write-Host "Push vers GitHub..." -ForegroundColor Yellow
git push origin main

# Verification
if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=== SUCCES ===" -ForegroundColor Green
    Write-Host "Code pousse sur GitHub avec succes!" -ForegroundColor Green
    Write-Host ""
}
else {
    Write-Host ""
    Write-Host "=== ERREUR ===" -ForegroundColor Red
    Write-Host "Verifiez votre connexion GitHub" -ForegroundColor Red
    Write-Host ""
    Write-Host "Si erreur 'no upstream', essayez:" -ForegroundColor Yellow
    Write-Host "git push -u origin main" -ForegroundColor White
    Write-Host ""
}
