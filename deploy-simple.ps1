# Script de déploiement simplifié pour Utegraphium
# Usage: .\deploy-simple.ps1

Write-Host "Deploiement Utegraphium sur GitHub Pages" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green

# Vérifier les fichiers essentiels
Write-Host "Verification des fichiers essentiels..." -ForegroundColor Yellow

$requiredFiles = @("index.html", "404.html", "manifest.json", "sw.js", "styles.css")
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "OK: $file trouve" -ForegroundColor Green
    } else {
        Write-Host "ERREUR: $file manquant" -ForegroundColor Red
        exit 1
    }
}

# Vérifier la structure des assets
Write-Host "Verification de la structure des assets..." -ForegroundColor Yellow
if (Test-Path "assets") {
    Write-Host "OK: Dossier assets trouve" -ForegroundColor Green
} else {
    Write-Host "ERREUR: Dossier assets manquant" -ForegroundColor Red
    exit 1
}

# Vérifier les workflows GitHub Actions
Write-Host "Verification des workflows GitHub Actions..." -ForegroundColor Yellow
if (Test-Path ".github/workflows/deploy.yml") {
    Write-Host "OK: Workflow de deploiement trouve" -ForegroundColor Green
} else {
    Write-Host "ERREUR: Workflow de deploiement manquant" -ForegroundColor Red
    exit 1
}

# Ajouter tous les fichiers au staging
Write-Host "Ajout des fichiers au staging..." -ForegroundColor Yellow
git add .

# Vérifier s'il y a des changements
$status = git status --porcelain
if ([string]::IsNullOrEmpty($status)) {
    Write-Host "Aucun changement detecte" -ForegroundColor Blue
} else {
    Write-Host "Changements detectes:" -ForegroundColor Yellow
    git diff --cached --name-only
    
    # Créer le commit
    Write-Host "Creation du commit..." -ForegroundColor Yellow
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    git commit -m "Deploiement automatique - $timestamp"
    
    # Push vers GitHub
    Write-Host "Push vers GitHub..." -ForegroundColor Yellow
    git push origin main
    
    Write-Host "Deploiement termine!" -ForegroundColor Green
    Write-Host "Votre site sera disponible sur: https://utegraphium.github.io" -ForegroundColor Cyan
    Write-Host "Le deploiement peut prendre quelques minutes..." -ForegroundColor Yellow
}

Write-Host "Script termine!" -ForegroundColor Green
