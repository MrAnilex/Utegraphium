#!/bin/bash

# Script de déploiement pour Utegraphium sur GitHub Pages
# Usage: ./deploy.sh

set -e

echo "🚀 Déploiement d'Utegraphium sur GitHub Pages"
echo "=============================================="

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "index.html" ]; then
    echo "❌ Erreur: index.html non trouvé. Assurez-vous d'être dans le répertoire racine du projet."
    exit 1
fi

# Vérifier que Git est initialisé
if [ ! -d ".git" ]; then
    echo "❌ Erreur: Répertoire Git non trouvé. Initialisez Git d'abord."
    exit 1
fi

# Vérifier les fichiers essentiels
echo "🔍 Vérification des fichiers essentiels..."

required_files=("index.html" "404.html" "manifest.json" "sw.js" "styles.css")
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file trouvé"
    else
        echo "❌ $file manquant"
        exit 1
    fi
done

# Vérifier la structure des assets
echo "📁 Vérification de la structure des assets..."
if [ -d "assets" ]; then
    echo "✅ Dossier assets trouvé"
    if [ -d "assets/css" ]; then
        echo "✅ Dossier assets/css trouvé"
    fi
    if [ -d "assets/js" ]; then
        echo "✅ Dossier assets/js trouvé"
    fi
    if [ -d "assets/images" ]; then
        echo "✅ Dossier assets/images trouvé"
    fi
else
    echo "❌ Dossier assets manquant"
    exit 1
fi

# Vérifier les workflows GitHub Actions
echo "⚙️  Vérification des workflows GitHub Actions..."
if [ -f ".github/workflows/deploy.yml" ]; then
    echo "✅ Workflow de déploiement trouvé"
else
    echo "❌ Workflow de déploiement manquant"
    exit 1
fi

# Ajouter tous les fichiers au staging
echo "📝 Ajout des fichiers au staging..."
git add .

# Vérifier s'il y a des changements
if git diff --cached --quiet; then
    echo "ℹ️  Aucun changement détecté"
else
    echo "📊 Changements détectés:"
    git diff --cached --name-only
    
    # Demander confirmation pour le commit
    read -p "Voulez-vous continuer avec le commit et le push? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Créer le commit
        echo "💾 Création du commit..."
        git commit -m "🚀 Déploiement automatique - $(date '+%Y-%m-%d %H:%M:%S')"
        
        # Push vers GitHub
        echo "⬆️  Push vers GitHub..."
        git push origin main
        
        echo "✅ Déploiement terminé!"
        echo "🌐 Votre site sera disponible sur: https://utegraphium.github.io"
        echo "⏱️  Le déploiement peut prendre quelques minutes..."
    else
        echo "❌ Déploiement annulé"
        exit 1
    fi
fi

echo "🎉 Script terminé!"
