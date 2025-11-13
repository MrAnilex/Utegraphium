// Service Worker pour Utegraphium - Optimisation des performances - COMPATIBLE TOUS NAVIGATEURS
const CACHE_NAME = 'utegraphium-v2';
const STATIC_CACHE = 'utegraphium-static-v2';
const DYNAMIC_CACHE = 'utegraphium-dynamic-v2';
const IMAGE_CACHE = 'utegraphium-images-v2';
const VIDEO_CACHE = 'utegraphium-videos-v2';

// Ressources à mettre en cache statiquement
const STATIC_ASSETS = [
    './',
    './index.html',
    './assets/css/styles.css',
    './assets/css/browser-compatibility.css',
    './assets/js/polyfills.js',
    './assets/js/browser-detection.js',
    './assets/js/performance-config.js',
    './assets/js/translations.js',
    './assets/js/language-switcher.js',
    './assets/js/background-music.js',
    './assets/js/site-repair.js',
    './manifest.json'
];

// Images à mettre en cache
const IMAGE_ASSETS = [
    './assets/images/placeholder.png',
    './assets/images/custom-icons/france-icon.png',
    './assets/images/custom-icons/gaming-icon.png',
    './assets/images/custom-icons/chaos-icon.png',
    './assets/images/custom-icons/social-icon.png'
];

// Vidéos à mettre en cache
const VIDEO_ASSETS = [
    './assets/videos/background-video.mp4'
];

// Installation du service worker
self.addEventListener('install', function(event) {
    console.log('🚀 Service Worker installé - Version 2');
    
    event.waitUntil(
        Promise.all([
            // Cache statique
            caches.open(STATIC_CACHE).then(function(cache) {
                console.log('📦 Cache statique créé');
                return cache.addAll(STATIC_ASSETS);
            }).catch(function(error) {
                console.warn('❌ Erreur lors de la mise en cache statique:', error);
            }),
            
            // Cache des images
            caches.open(IMAGE_CACHE).then(function(cache) {
                console.log('🖼️ Cache des images créé');
                return cache.addAll(IMAGE_ASSETS);
            }).catch(function(error) {
                console.warn('❌ Erreur lors de la mise en cache des images:', error);
            }),
            
            // Cache des vidéos
            caches.open(VIDEO_CACHE).then(function(cache) {
                console.log('🎥 Cache des vidéos créé');
                return cache.addAll(VIDEO_ASSETS);
            }).catch(function(error) {
                console.warn('❌ Erreur lors de la mise en cache des vidéos:', error);
            })
        ])
    );
    
    // Activation immédiate
    self.skipWaiting();
});

// Activation du service worker
self.addEventListener('activate', function(event) {
    console.log('✅ Service Worker activé - Version 2');
    
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName !== STATIC_CACHE && 
                        cacheName !== DYNAMIC_CACHE && 
                        cacheName !== IMAGE_CACHE && 
                        cacheName !== VIDEO_CACHE) {
                        console.log('🗑️ Ancien cache supprimé:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    
    // Prise de contrôle immédiate
    self.clients.claim();
});

// Interception des requêtes réseau
self.addEventListener('fetch', function(event) {
    var request = event.request;
    var url = new URL(request.url);
    
    // Ignorer les requêtes non-GET
    if (request.method !== 'GET') {
        return;
    }
    
    // Stratégie de cache selon le type de ressource
    if (isStaticAsset(request.url)) {
        event.respondWith(cacheFirst(request, STATIC_CACHE));
    } else if (isImageAsset(request.url)) {
        event.respondWith(cacheFirst(request, IMAGE_CACHE));
    } else if (isVideoAsset(request.url)) {
        event.respondWith(cacheFirst(request, VIDEO_CACHE));
    } else if (isDynamicAsset(request.url)) {
        event.respondWith(networkFirst(request, DYNAMIC_CACHE));
    } else {
        event.respondWith(networkOnly(request));
    }
});

// Stratégie Cache First pour les ressources statiques
function cacheFirst(request, cacheName) {
    return caches.match(request).then(function(cachedResponse) {
        if (cachedResponse) {
            return cachedResponse;
        }
        
        return fetch(request).then(function(networkResponse) {
            if (networkResponse.ok) {
                var responseToCache = networkResponse.clone();
                caches.open(cacheName).then(function(cache) {
                    cache.put(request, responseToCache);
                });
            }
            return networkResponse;
        }).catch(function(error) {
            console.warn('Erreur cache first:', error);
            // Retourner une réponse de fallback si disponible
            return getFallbackResponse(request);
        });
    });
}

// Stratégie Network First pour les ressources dynamiques
function networkFirst(request, cacheName) {
    return fetch(request).then(function(networkResponse) {
        if (networkResponse.ok) {
            var responseToCache = networkResponse.clone();
            caches.open(cacheName).then(function(cache) {
                cache.put(request, responseToCache);
            });
        }
        return networkResponse;
    }).catch(function(error) {
        console.warn('Erreur network first:', error);
        return caches.match(request).then(function(cachedResponse) {
            if (cachedResponse) {
                return cachedResponse;
            }
            return getFallbackResponse(request);
        });
    });
}

// Stratégie Network Only
function networkOnly(request) {
    return fetch(request).catch(function(error) {
        console.warn('Erreur network only:', error);
        return getFallbackResponse(request);
    });
}

// Fonction pour identifier les ressources statiques
function isStaticAsset(url) {
    var staticPatterns = [
        /\.css$/,
        /\.js$/,
        /\.html$/,
        /\.json$/,
        /manifest\.json$/
    ];
    
    return staticPatterns.some(function(pattern) {
        return pattern.test(url);
    });
}

// Fonction pour identifier les ressources d'images
function isImageAsset(url) {
    var imagePatterns = [
        /\.png$/,
        /\.jpg$/,
        /\.jpeg$/,
        /\.gif$/,
        /\.svg$/,
        /\.webp$/
    ];
    
    return imagePatterns.some(function(pattern) {
        return pattern.test(url);
    });
}

// Fonction pour identifier les ressources vidéo
function isVideoAsset(url) {
    var videoPatterns = [
        /\.mp4$/,
        /\.webm$/,
        /\.ogg$/
    ];
    
    return videoPatterns.some(function(pattern) {
        return pattern.test(url);
    });
}

// Fonction pour identifier les ressources dynamiques
function isDynamicAsset(url) {
    var dynamicPatterns = [
        /api\//,
        /\.php$/,
        /\.asp$/,
        /\.aspx$/
    ];
    
    return dynamicPatterns.some(function(pattern) {
        return pattern.test(url);
    });
}

// Fonction pour obtenir une réponse de fallback
function getFallbackResponse(request) {
    var url = new URL(request.url);
    
    // Fallback pour les images
    if (isImageAsset(request.url)) {
        return caches.match('./assets/images/placeholder.png');
    }
    
    // Fallback pour les vidéos
    if (isVideoAsset(request.url)) {
        return new Response('', {
            status: 404,
            statusText: 'Video not available'
        });
    }
    
    // Fallback pour les pages HTML
    if (url.pathname.endsWith('.html') || url.pathname === '/') {
        return caches.match('./index.html');
    }
    
    // Fallback générique
    return new Response('Resource not available', {
        status: 404,
        statusText: 'Not Found'
    });
}

// Gestion des messages du service worker
self.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({
            version: CACHE_NAME,
            staticCache: STATIC_CACHE,
            dynamicCache: DYNAMIC_CACHE,
            imageCache: IMAGE_CACHE,
            videoCache: VIDEO_CACHE
        });
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys().then(function(cacheNames) {
                return Promise.all(
                    cacheNames.map(function(cacheName) {
                        return caches.delete(cacheName);
                    })
                );
            })
        );
    }
});

// Gestion des erreurs
self.addEventListener('error', function(event) {
    console.error('Service Worker error:', event.error);
});

// Gestion des rejets de promesses non gérés
self.addEventListener('unhandledrejection', function(event) {
    console.error('Service Worker unhandled rejection:', event.reason);
});

// Fonction pour nettoyer les anciens caches
function cleanupOldCaches() {
    return caches.keys().then(function(cacheNames) {
        return Promise.all(
            cacheNames.map(function(cacheName) {
                if (!cacheName.startsWith('utegraphium-')) {
                    console.log('🗑️ Suppression du cache externe:', cacheName);
                    return caches.delete(cacheName);
                }
            })
        );
    });
}

// Fonction pour obtenir les statistiques du cache
function getCacheStats() {
    return caches.keys().then(function(cacheNames) {
        var stats = {};
        
        return Promise.all(
            cacheNames.map(function(cacheName) {
                return caches.open(cacheName).then(function(cache) {
                    return cache.keys().then(function(requests) {
                        stats[cacheName] = requests.length;
                    });
                });
            })
        ).then(function() {
            return stats;
        });
    });
}

// Fonction pour précharger des ressources
function preloadResources(urls) {
    return Promise.all(
        urls.map(function(url) {
            return fetch(url).then(function(response) {
                if (response.ok) {
                    return caches.open(DYNAMIC_CACHE).then(function(cache) {
                        return cache.put(url, response);
                    });
                }
            }).catch(function(error) {
                console.warn('Erreur de préchargement pour:', url, error);
            });
        })
    );
}

// Fonction pour optimiser les performances
function optimizePerformance() {
    // Nettoyer les caches anciens
    cleanupOldCaches();
    
    // Obtenir les statistiques
    getCacheStats().then(function(stats) {
        console.log('📊 Statistiques du cache:', stats);
    });
}

// Appel de l'optimisation des performances au démarrage
optimizePerformance();

console.log('🚀 Service Worker Utegraphium v2 initialisé');
