# Utegraphium !

## Fonctionnalités principales
- Portfolio en ligne présentant mes compétences, expériences, et projets.
- Intégration de l'API Notion pour afficher mes statistiques.
- Design moderne et responsive, optimisé pour tous les appareils (desktop, tablette, mobile).
- Compteurs de visites mutualisés via CounterAPI.dev à travers un proxy Cloudflare Worker pour garder la clé API privée.

## Déploiement du proxy CounterAPI
Consultez [`workers/README.md`](workers/README.md) pour déployer le Worker Cloudflare qui protège la clé CounterAPI et configurez `assets/js/counterapi-config.js` avec l'URL du Worker.


## Vas-y j'ai perdu fois en Copilot et ChatGPT Codex quand il s'agit de m'aider à coder, ça ne fait que de la merde je vais tout refaire moi-même, nique sa race
