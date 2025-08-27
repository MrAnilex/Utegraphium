# 🔗 Configuration GitHub - Utegraphium

## 📋 Étapes pour Connecter votre Repository Local à GitHub

### 1. Créer le Repository GitHub

1. **Allez sur GitHub.com** et connectez-vous à votre compte
2. **Cliquez sur "New repository"** (bouton vert)
3. **Configurez le repository :**
   - **Repository name** : `Utegraphium`
   - **Description** : `Site personnel d'Utegraphium - Développeur passionné`
   - **Visibility** : Public ✅
   - **NE PAS cocher** "Add a README file"
   - **NE PAS cocher** "Add .gitignore"
   - **NE PAS cocher** "Choose a license"
4. **Cliquez sur "Create repository"**

### 2. Connecter le Repository Local

Une fois le repository créé sur GitHub, exécutez ces commandes dans PowerShell :

```powershell
# Remplacez VOTRE_USERNAME par votre nom d'utilisateur GitHub
git remote add origin https://github.com/VOTRE_USERNAME/Utegraphium.git

# Pousser le code vers GitHub
git push -u origin main
```

### 3. Activer GitHub Pages

1. **Dans votre repository GitHub**, allez dans **Settings**
2. **Dans le menu de gauche**, cliquez sur **Pages**
3. **Dans "Source"**, sélectionnez **"GitHub Actions"**
4. **Cliquez sur "Save"**

### 4. Vérifier le Déploiement

1. **Allez dans l'onglet "Actions"** de votre repository
2. **Vérifiez que le workflow "Deploy to GitHub Pages" s'exécute**
3. **Attendez 5-10 minutes** pour que le site soit disponible
4. **Votre site sera accessible sur** : `https://VOTRE_USERNAME.github.io/Utegraphium`

## 🚀 Commandes Rapides

### Pour un déploiement rapide après configuration :

```powershell
# Vérifier le statut
git status

# Ajouter les changements
git add .

# Créer un commit
git commit -m "🚀 Mise à jour du site"

# Pousser vers GitHub
git push origin main
```

### Pour utiliser le script de déploiement automatique :

```powershell
# Exécuter le script PowerShell
.\deploy.ps1

# Ou avec l'option Force
.\deploy.ps1 -Force
```

## 🔧 Configuration Git (Optionnel)

Si vous voulez configurer Git avec vos vraies informations :

```powershell
# Configurer votre email GitHub
git config --global user.email "votre-email@example.com"

# Configurer votre nom
git config --global user.name "Votre Nom"
```

## 📞 Support

En cas de problème :

1. **Vérifiez que le repository GitHub existe**
2. **Vérifiez que l'URL du remote est correcte**
3. **Vérifiez que GitHub Pages est activé**
4. **Consultez les logs dans l'onglet Actions**

---

**🎉 Une fois ces étapes terminées, votre site Utegraphium sera en ligne !**
