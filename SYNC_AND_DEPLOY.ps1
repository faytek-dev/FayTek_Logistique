# MASTER DEPLOY SCRIPT - FAYTEK LOGISTIQUE
# Version compatible sans caracteres speciaux

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   FAYTEK LOGISTIQUE - MASTER DEPLOY" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan

# 1. Verification de Git
Write-Host "`n[1/4] Verification de Git..." -ForegroundColor Yellow
git add .
$status = git status --porcelain
if ($status) {
    $msg = "Update Admin credentials and deployment scripts"
    git commit -m $msg
    Write-Host "OK - Changements commites" -ForegroundColor Green
}
else {
    Write-Host "INFO - Aucun changement a commiter" -ForegroundColor Gray
}

Write-Host "Push vers GitHub..." -ForegroundColor Gray
git push origin main
if ($LASTEXITCODE -eq 0) {
    Write-Host "OK - Push GitHub reussi" -ForegroundColor Green
}
else {
    Write-Host "ERREUR - Probleme lors du push GitHub" -ForegroundColor Red
}

# 2. Mise a jour de la base de donnees (Production)
Write-Host "`n[2/4] Mise a jour de l'Admin en Production..." -ForegroundColor Yellow
$choice = Read-Host "Voulez-vous mettre a jour l'admin sur la base de donnees distante ? (o/n)"
if ($choice -eq 'o') {
    Set-Location backend
    # On verifie si MONGODB_URI est present
    if (Test-Path .env) {
        $found = Select-String -Path .env -Pattern "mongodb\+srv"
        if ($found) {
            Write-Host "Utilisation de l'URI trouvee dans backend/.env..." -ForegroundColor Gray
            node update-admin.js
        }
        else {
            Write-Host "Variable MONGODB_URI vide ou locale." -ForegroundColor Yellow
            $uri = Read-Host "Entrez votre MONGODB_URI Atlas"
            if ($uri) {
                $env:MONGODB_URI = $uri
                node update-admin.js
            }
        }
    }
    else {
        $uri = Read-Host "Fichier .env non trouve. Entrez votre MONGODB_URI Atlas"
        if ($uri) {
            $env:MONGODB_URI = $uri
            node update-admin.js
        }
    }
    Set-Location ..
}

# 3. Railway
Write-Host "`n[3/4] Synchro Railway..." -ForegroundColor Yellow
if (Get-Command railway -ErrorAction SilentlyContinue) {
    railway up --detach
}
else {
    Write-Host "INFO - Utilisation de npx pour Railway..." -ForegroundColor Gray
    npx -y @railway/cli up --detach
}

# 4. Netlify
Write-Host "`n[4/4] Synchro Netlify..." -ForegroundColor Yellow
if (Get-Command netlify -ErrorAction SilentlyContinue) {
    Write-Host "Build Frontend..." -ForegroundColor Gray
    Set-Location frontend
    npm run build
    Set-Location ..
}
else {
    Write-Host "INFO - Utilisation de npx pour Netlify..." -ForegroundColor Gray
    Set-Location frontend
    npm run build
    Set-Location ..
}

Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "   DEPLOIEMENT TERMINE" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Admin  : superadmin@logistics.com" -ForegroundColor White
Write-Host "Pass   : FayTek@2025" -ForegroundColor White
Write-Host "==================================================" -ForegroundColor Cyan
