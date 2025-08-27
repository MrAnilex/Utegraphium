# Script de déploiement PowerShell pour Utegraphium sur GitHub Pages
# Usage: .\deploy.ps1

param(
    [switch]$Force
)

Write-Host "🚀 Déploiement d'Utegraphium sur GitHub Pages" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green

# Vérifier que nous sommes dans le bon répertoire
if (-not (Test-Path "index.html")) {
    Write-Host "❌ Erreur: index.html non trouvé. Assurez-vous d'être dans le répertoire racine du projet." -ForegroundColor Red
    exit 1
}

# Vérifier que Git est initialisé
if (-not (Test-Path ".git")) {
    Write-Host "❌ Erreur: Répertoire Git non trouvé. Initialisez Git d'abord." -ForegroundColor Red
    exit 1
}

# Vérifier les fichiers essentiels
Write-Host "🔍 Vérification des fichiers essentiels..." -ForegroundColor Yellow

$requiredFiles = @("index.html", "404.html", "manifest.json", "sw.js", "styles.css")
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file trouvé" -ForegroundColor Green
    } else {
        Write-Host "❌ $file manquant" -ForegroundColor Red
        exit 1
    }
}

# Vérifier la structure des assets
Write-Host "📁 Vérification de la structure des assets..." -ForegroundColor Yellow
if (Test-Path "assets") {
    Write-Host "✅ Dossier assets trouvé" -ForegroundColor Green
    if (Test-Path "assets/css") {
        Write-Host "✅ Dossier assets/css trouvé" -ForegroundColor Green
    }
    if (Test-Path "assets/js") {
        Write-Host "✅ Dossier assets/js trouvé" -ForegroundColor Green
    }
    if (Test-Path "assets/images") {
        Write-Host "✅ Dossier assets/images trouvé" -ForegroundColor Green
    }
} else {
    Write-Host "❌ Dossier assets manquant" -ForegroundColor Red
    exit 1
}

# Vérifier les workflows GitHub Actions
Write-Host "⚙️  Vérification des workflows GitHub Actions..." -ForegroundColor Yellow
if (Test-Path ".github/workflows/deploy.yml") {
    Write-Host "✅ Workflow de déploiement trouvé" -ForegroundColor Green
} else {
    Write-Host "❌ Workflow de déploiement manquant" -ForegroundColor Red
    exit 1
}

# Ajouter tous les fichiers au staging
Write-Host "📝 Ajout des fichiers au staging..." -ForegroundColor Yellow
git add .

# Vérifier s'il y a des changements
$status = git status --porcelain
if ([string]::IsNullOrEmpty($status)) {
    Write-Host "ℹ️  Aucun changement détecté" -ForegroundColor Blue
} else {
    Write-Host "📊 Changements détectés:" -ForegroundColor Yellow
    git diff --cached --name-only
    
    # Demander confirmation pour le commit (sauf si -Force est utilisé)
    if (-not $Force) {
        $response = Read-Host "Voulez-vous continuer avec le commit et le push? (y/N)"
        if ($response -ne "y" -and $response -ne "Y") {
            Write-Host "❌ Déploiement annulé" -ForegroundColor Red
            exit 1
        }
    }
    
    # Créer le commit
    Write-Host "💾 Création du commit..." -ForegroundColor Yellow
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    git commit -m "🚀 Déploiement automatique - $timestamp"
    
    # Push vers GitHub
    Write-Host "⬆️  Push vers GitHub..." -ForegroundColor Yellow
    git push origin main
    
    Write-Host "✅ Déploiement terminé!" -ForegroundColor Green
    Write-Host "🌐 Votre site sera disponible sur: https://utegraphium.github.io" -ForegroundColor Cyan
    Write-Host "⏱️  Le déploiement peut prendre quelques minutes..." -ForegroundColor Yellow
}

Write-Host "🎉 Script terminé!" -ForegroundColor Green
