(function() {
    'use strict';

    // Tout est préconfiguré :
    // 1. Déployez le Worker Cloudflare (dossier "workers/").
    // 2. Stockez votre clé CounterAPI avec `wrangler secret put COUNTERAPI_TOKEN`.
    // 3. Mettez à jour `proxyBaseUrl` ci-dessous avec l'URL publique du Worker.
    // Le front n'a pas besoin de connaître la clé.
    window.CounterApiConfig = {
        mode: 'proxy',
        proxyBaseUrl: 'https://utegraphium-counterapi-proxy.workers.dev',
        namespace: 'utegraphium',
        totalKey: 'total-visits',
        uniqueKey: 'unique-visitors',
        // Laissez `token` vide : il n'est utilisé qu'en mode direct (sans proxy).
        token: ''
    };
})();
