(function() {
    'use strict';

    // Configuration par défaut pour CounterAPI.dev
    // Tout est prêt : il suffit de renseigner votre clé API CounterAPI dans `token`.
    // Les compteurs sont créés automatiquement avec le namespace et les clés ci-dessous.
    // Si vous préférez utiliser un en-tête Authorization, changez `tokenPlacement` en "header".
    window.CounterApiConfig = {
        baseUrl: 'https://counterapi.dev',
        namespace: 'utegraphium',
        totalKey: 'total-visits',
        uniqueKey: 'unique-visitors',
        token: '',                          // <-- placez ici votre clé API CounterAPI (ex: 'ck_live_xxx')
        tokenPlacement: 'query',            // "query" (défaut) ajoute ?token=..., "header" l'envoie dans l'en-tête
        tokenQueryParameter: 'token',       // Nom du paramètre de requête si tokenPlacement === 'query'
        authHeader: 'Authorization',        // Nom de l'en-tête si tokenPlacement === 'header'
        getPath: '/api/v1/counter/{namespace}/{key}',
        incrementPath: '/api/v1/counter/{namespace}/{key}/increment',
        incrementMethod: 'POST',            // Certains plans publics fonctionnent aussi avec 'GET'
        refreshInterval: 60000,             // Synchronisation depuis CounterAPI toutes les 60s
        headers: {}                         // Ajoutez ici d'éventuels en-têtes personnalisés
    };
})();
