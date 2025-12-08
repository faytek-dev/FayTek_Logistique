# Script pour pusher les configs Railway
Write-Host ""
Write-Host "=== Push configs Railway vers GitHub ===" -ForegroundColor Cyan
Write-Host ""

git add backend/nixpacks.toml backend/railway.json
git commit -m "Add Railway configuration files"
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=== SUCCES ===" -ForegroundColor Green
    Write-Host "Configurations Railway ajoutees!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Prochaines etapes:" -ForegroundColor Cyan
    Write-Host "1. Allez sur Railway.app" -ForegroundColor White
    Write-Host "2. Supprimez l'ancien deploiement (si existe)" -ForegroundColor White
    Write-Host "3. Creez un nouveau deploiement" -ForegroundColor White
    Write-Host "4. Selectionnez le dossier 'backend'" -ForegroundColor White
    Write-Host ""
}
else {
    Write-Host "Erreur lors du push" -ForegroundColor Red
}
