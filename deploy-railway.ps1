# Script de deploiement Railway - Version simplifiee
# Sans caracteres speciaux problematiques

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   DEPLOIEMENT RAILWAY" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Etape 1 : Push vers GitHub
Write-Host "ETAPE 1 : Push vers GitHub..." -ForegroundColor Yellow
Write-Host ""

git add .
git commit -m "Add Railway config files"
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "OK - Configs poussees sur GitHub" -ForegroundColor Green
}
else {
    Write-Host "ERREUR - Probleme lors du push" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   INSTRUCTIONS RAILWAY" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "ETAPE 2 : MongoDB Atlas" -ForegroundColor Yellow
Write-Host ""
Write-Host "Si pas encore fait :" -ForegroundColor White
Write-Host "1. https://www.mongodb.com/cloud/atlas/register" -ForegroundColor Cyan
Write-Host "2. Creer cluster M0 (gratuit)" -ForegroundColor White
Write-Host "3. Network Access -> Ajouter 0.0.0.0/0" -ForegroundColor White
Write-Host "4. Copier connection string" -ForegroundColor White
Write-Host ""

Write-Host "ETAPE 3 : Railway.app" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. https://railway.app" -ForegroundColor Cyan
Write-Host "2. New Project -> Deploy from GitHub" -ForegroundColor White
Write-Host "3. Selectionnez : FayTek_Logistique" -ForegroundColor White
Write-Host ""

Write-Host "ETAPE 4 : Configuration Service" -ForegroundColor Yellow
Write-Host ""
Write-Host "Dans Railway Settings :" -ForegroundColor White
Write-Host "  Root Directory = backend" -ForegroundColor Green
Write-Host ""

Write-Host "ETAPE 5 : Variables (6 variables a ajouter)" -ForegroundColor Yellow
Write-Host ""
Write-Host "  NODE_ENV = production" -ForegroundColor Gray
Write-Host "  PORT = 3000" -ForegroundColor Gray
Write-Host "  MONGODB_URI = [votre URI]" -ForegroundColor Gray
Write-Host "  JWT_SECRET = secret_32_caracteres_min" -ForegroundColor Gray
Write-Host "  JWT_EXPIRE = 7d" -ForegroundColor Gray
Write-Host "  CORS_ORIGIN = *" -ForegroundColor Gray
Write-Host ""

Write-Host "ETAPE 6 : Generate Domain" -ForegroundColor Yellow
Write-Host ""
Write-Host "Settings -> Networking -> Generate Domain" -ForegroundColor White
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   TEST" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Commande de test :" -ForegroundColor White
Write-Host "  curl https://votre-url.up.railway.app/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "Documentation complete : RAILWAY_DEPLOY.md" -ForegroundColor Yellow
Write-Host ""
