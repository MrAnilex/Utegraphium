# 🚀 Serveur de Compteurs Centralisés - Utegraphium

Ce serveur gère les compteurs de visiteurs de manière centralisée pour que tous les utilisateurs voient les mêmes statistiques.

## 📋 Fonctionnalités

- ✅ **Compteurs partagés** : Tous les utilisateurs voient les mêmes statistiques
- ✅ **Visiteurs uniques** : Détection automatique des nouveaux visiteurs
- ✅ **Statistiques quotidiennes** : Suivi des visites par jour
- ✅ **Statistiques hebdomadaires** : Suivi des visites de la semaine
- ✅ **API REST** : Interface simple pour les interactions
- ✅ **Persistance des données** : Sauvegarde automatique dans un fichier JSON

## 🛠️ Installation

1. **Installer les dépendances** :
```bash
cd server
npm install
```

2. **Démarrer le serveur** :
```bash
npm start
```

Pour le développement avec rechargement automatique :
```bash
npm run dev
```

⚠️ **Note** : Les compteurs sont permanents et ne peuvent pas être réinitialisés ou supprimés.

## 🌐 API Endpoints

### GET `/api/counters`
Récupère les compteurs actuels.

**Réponse** :
```json
{
  "success": true,
  "data": {
    "uniqueVisitors": 42,
    "totalVisits": 1337,
    "visitsToday": 15,
    "visitsWeek": 89,
    "lastUpdate": "2024-01-01T00:00:00.000Z"
  }
}
```

### POST `/api/visit`
Enregistre une nouvelle visite.

**Corps de la requête** :
```json
{
  "visitorId": "abc123",
  "isNewVisitor": true
}
```

**Réponse** :
```json
{
  "success": true,
  "data": {
    "uniqueVisitors": 43,
    "totalVisits": 1338,
    "visitsToday": 16,
    "visitsWeek": 90
  }
}
```



### GET `/api/stats`
Récupère des statistiques détaillées.

**Réponse** :
```json
{
  "success": true,
  "data": {
    "uniqueVisitors": 42,
    "totalVisits": 1337,
    "visitsToday": 15,
    "visitsWeek": 89,
    "averageVisitsPerDay": 44.57,
    "totalDays": 30,
    "dailyStats": {
      "2024-01-01": 15,
      "2024-01-02": 12
    }
  }
}
```

### GET `/api/health`
Vérifie l'état du serveur.

**Réponse** :
```json
{
  "success": true,
  "message": "Serveur de compteurs opérationnel",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🔧 Configuration

Le serveur utilise les variables d'environnement suivantes :

- `PORT` : Port du serveur (défaut : 3000)
- `COUNTERS_FILE` : Chemin vers le fichier de données (défaut : `counters.json`)

## 📊 Structure des Données

Les compteurs sont stockés dans `counters.json` :

```json
{
  "uniqueVisitors": 42,
  "totalVisits": 1337,
  "visitsToday": 15,
  "visitsWeek": 89,
  "lastUpdate": "2024-01-01T00:00:00.000Z",
  "visitorIds": ["visitor1", "visitor2"],
  "dailyStats": {
    "2024-01-01": 15,
    "2024-01-02": 12
  }
}
```

## 🔒 Sécurité

⚠️ **Important** : Ce serveur est conçu pour un usage local/développement. Pour la production :

1. Ajoutez une authentification
2. Utilisez HTTPS
3. Implémentez des limites de taux (rate limiting)
4. Ajoutez une validation des données
5. Utilisez une vraie base de données

## 🚀 Déploiement

### Local
```bash
npm start
```

### Avec PM2
```bash
npm install -g pm2
pm2 start server.js --name "counters-server"
pm2 save
pm2 startup
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🐛 Dépannage

### Le serveur ne démarre pas
- Vérifiez que Node.js est installé (version 14+)
- Vérifiez que le port 3000 est libre
- Vérifiez les permissions du dossier

### Les compteurs ne se mettent pas à jour
- Vérifiez que le serveur est démarré
- Vérifiez les logs du serveur
- Vérifiez la connectivité réseau

### Erreur CORS
- Le serveur inclut déjà CORS pour `localhost`
- Pour d'autres domaines, modifiez la configuration CORS

## 📝 Logs

Le serveur affiche des logs détaillés :
- 🚀 Démarrage du serveur
- 📊 Chargement des compteurs
- 👥 Nouvelles visites
- 💾 Sauvegarde des données
- ❌ Erreurs

## 🤝 Contribution

Pour contribuer au projet :

1. Fork le repository
2. Créez une branche pour votre fonctionnalité
3. Committez vos changements
4. Poussez vers la branche
5. Créez une Pull Request

## 📄 Licence

MIT License - voir le fichier LICENSE pour plus de détails.
