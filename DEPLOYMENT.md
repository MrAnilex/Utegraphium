# 🚀 Guide de Déploiement GitHub Pages - Utegraphium

## 📋 Prérequis

Avant de déployer votre site sur GitHub Pages, assurez-vous d'avoir :

- ✅ Un compte GitHub
- ✅ Git installé sur votre machine
- ✅ Un repository GitHub nommé `Utegraphium` (ou votre nom d'utilisateur)
- ✅ Tous les fichiers du site dans le repository

## 🔧 Configuration Initiale

### 1. Créer le Repository GitHub

Si vous n'avez pas encore créé le repository :

1. Allez sur [GitHub.com](https://github.com)
2. Cliquez sur "New repository"
3. Nommez-le `Utegraphium` (ou votre nom d'utilisateur)
4. Laissez-le public
5. Ne cochez PAS "Add a README file"
6. Cliquez sur "Create repository"

### 2. Initialiser Git Localement

```bash
# Dans le dossier de votre projet
git init
git add .
git commit -m "🚀 Initial commit - Site Utegraphium"
git branch -M main
git remote add origin https://github.com/VOTRE_USERNAME/Utegraphium.git
git push -u origin main
```

## 🚀 Déploiement Automatique

### Option 1: Script PowerShell (Windows)

```powershell
# Exécuter le script de déploiement
.\deploy.ps1

# Ou avec l'option Force pour éviter les confirmations
.\deploy.ps1 -Force
```

### Option 2: Script Bash (Linux/Mac)

```bash
# Rendre le script exécutable
chmod +x deploy.sh

# Exécuter le script
./deploy.sh
```

### Option 3: Déploiement Manuel

```bash
# Ajouter tous les fichiers
git add .

# Créer un commit
git commit -m "🚀 Déploiement - $(date)"

# Pousser vers GitHub
git push origin main
```

## ⚙️ Configuration GitHub Pages

### 1. Activer GitHub Pages

1. Allez dans votre repository sur GitHub
2. Cliquez sur "Settings"
3. Dans le menu de gauche, cliquez sur "Pages"
4. Dans "Source", sélectionnez "GitHub Actions"
5. Cliquez sur "Save"

### 2. Vérifier les Workflows

Les workflows GitHub Actions sont déjà configurés dans `.github/workflows/` :

- `deploy.yml` - Déploiement automatique
- `validate.yml` - Validation du site

### 3. Configuration du Domaine

Si vous avez un domaine personnalisé :

1. Dans les paramètres GitHub Pages
2. Ajoutez votre domaine dans "Custom domain"
3. Sauvegardez
4. Le fichier `CNAME` sera automatiquement créé

## 🌐 URLs de Déploiement

Après le déploiement, votre site sera disponible sur :

- **URL principale** : `https://utegraphium.github.io`
- **URL alternative** : `https://VOTRE_USERNAME.github.io/Utegraphium`

## 📊 Monitoring du Déploiement

### Vérifier le Statut

1. Allez dans votre repository GitHub
2. Cliquez sur l'onglet "Actions"
3. Vérifiez que le workflow "Deploy to GitHub Pages" s'est exécuté avec succès

### Logs de Déploiement

Les logs de déploiement sont disponibles dans :
- Repository → Actions → Deploy to GitHub Pages → View logs

## 🔍 Validation du Site

### Tests Automatiques

Le workflow `validate.yml` vérifie automatiquement :

- ✅ Présence des fichiers essentiels
- ✅ Structure des assets
- ✅ Taille des fichiers
- ✅ Liens internes

### Tests Manuels

Après le déploiement, testez :

1. **Page d'accueil** : `https://utegraphium.github.io`
2. **Page 404** : `https://utegraphium.github.io/page-inexistante`
3. **Assets** : Vérifiez que les images, CSS et JS se chargent
4. **Responsive** : Testez sur mobile et desktop
5. **PWA** : Vérifiez l'installation sur mobile

## 🛠️ Dépannage

### Problèmes Courants

#### 1. Site non accessible
- Vérifiez que GitHub Pages est activé
- Attendez 5-10 minutes après le déploiement
- Vérifiez les logs dans Actions

#### 2. Assets non chargés
- Vérifiez les chemins relatifs dans le code
- Assurez-vous que tous les fichiers sont commités
- Vérifiez la structure des dossiers

#### 3. Erreurs de build
- Vérifiez les logs dans Actions
- Corrigez les erreurs signalées
- Re-poussez le code

#### 4. Cache du navigateur
- Videz le cache du navigateur
- Utilisez Ctrl+F5 pour forcer le rechargement
- Testez en navigation privée

### Commandes Utiles

```bash
# Vérifier le statut Git
git status

# Voir les derniers commits
git log --oneline -5

# Vérifier les branches
git branch -a

# Forcer un nouveau déploiement
git commit --allow-empty -m "🔄 Force redeploy"
git push origin main
```

## 📈 Optimisations

### Performance

- ✅ Images optimisées et compressées
- ✅ CSS et JS minifiés
- ✅ Service Worker pour le cache
- ✅ Lazy loading des images

### SEO

- ✅ Métadonnées complètes
- ✅ Sitemap automatique
- ✅ Robots.txt configuré
- ✅ Open Graph tags

### Sécurité

- ✅ HTTPS obligatoire
- ✅ Headers de sécurité
- ✅ Validation des entrées
- ✅ Protection contre les injections

## 🔄 Mises à Jour

### Déploiement Continu

Le site se met à jour automatiquement à chaque push sur la branche `main`.

### Rollback

Pour revenir à une version précédente :

```bash
# Voir l'historique
git log --oneline

# Revenir à un commit spécifique
git revert <commit-hash>
git push origin main
```

## 📞 Support

En cas de problème :

1. Vérifiez les logs dans GitHub Actions
2. Consultez la documentation GitHub Pages
3. Vérifiez les issues du repository
4. Contactez le support GitHub si nécessaire

---

**🎉 Votre site Utegraphium est maintenant déployé sur GitHub Pages !**

*Dernière mise à jour : $(Get-Date -Format "yyyy-MM-dd")*
