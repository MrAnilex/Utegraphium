# Proxy CounterAPI pour Utegraphium

Ce Worker Cloudflare relaie les appels à [CounterAPI.dev](https://counterapi.dev) afin de garder la clé API secrète pour un site GitHub Pages.

## Déploiement rapide

1. Installez et connectez `wrangler` :
   ```bash
   npm install -g wrangler
   wrangler login
   ```
2. Publiez le Worker :
   ```bash
   cd workers
   wrangler publish
   ```
3. Enregistrez votre clé CounterAPI :
   ```bash
   wrangler secret put COUNTERAPI_TOKEN
   ```
4. Ajustez `ALLOWED_ORIGIN` dans `wrangler.toml` pour limiter l'accès à votre domaine si besoin.
5. Mettez à jour `proxyBaseUrl` dans `assets/js/counterapi-config.js` avec l'URL du Worker (ex. `https://<nom>.workers.dev`).

Le Worker expose deux routes :

- `GET /counter/<key>` : récupère la valeur courante d'un compteur autorisé.
- `POST /counter/<key>/increment` : incrémente le compteur (corps JSON `{ "amount": 1 }`).

Les clés `total-visits` et `unique-visitors` sont configurées par défaut via `wrangler.toml`. Modifiez ces variables si vous souhaitez compter autre chose.
