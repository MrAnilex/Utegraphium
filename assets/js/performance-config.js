// Configuration de performance pour Utegraphium - OPTIMISÉ POUR TOUS NAVIGATEURS
class PerformanceConfig {
    constructor() {
        this.config = {
            // Délais d'initialisation
            musicDelay: 1500,
            counterDelay: 500,
            lazyLoadDelay: 100,
            
            // Configuration des images
            imageLoading: 'lazy',
            imageDecoding: 'async',
            
            // Configuration de la vidéo
            videoPreload: 'metadata',
            videoAutoplay: true,
            videoMuted: true,
            
            // Configuration des polices
            fontDisplay: 'swap',
            fontPreload: true,
            
            // Configuration des animations
            animationDuration: 300,
            reducedMotion: false,
            
            // Configuration du cache
            cacheEnabled: true,
            cacheStrategy: 'cache-first',
            
            // Configuration des performances
            enableIntersectionObserver: true,
            enableResizeObserver: true,
            enablePerformanceObserver: true
        };
        
        this.initialized = false;
        this.observers = [];
        this.init();
    }

    init() {
        try {
            this.detectCapabilities();
            this.setupPerformanceObservers();
            this.optimizeImages();
            this.optimizeVideo();
            this.setupIntersectionObserver();
            this.setupErrorHandling();
            this.optimizeAnimations();
            this.setupCacheOptimization();
            this.initialized = true;
            
            console.log('🚀 Configuration de performance initialisée');
        } catch (error) {
            console.warn('Erreur lors de l\'initialisation de la configuration de performance:', error);
            this.fallbackInit();
        }
    }

    // Détection des capacités du navigateur
    detectCapabilities() {
        // Vérifier les préférences utilisateur
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.config.reducedMotion = true;
            this.config.animationDuration = 0;
        }
        
        // Vérifier la connexion
        if ('connection' in navigator) {
            var connection = navigator.connection;
            if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
                this.config.cacheStrategy = 'network-first';
                this.config.animationDuration = 0;
            }
        }
        
        // Vérifier les capacités du navigateur
        if (!window.IntersectionObserver) {
            this.config.enableIntersectionObserver = false;
        }
        
        if (!window.ResizeObserver) {
            this.config.enableResizeObserver = false;
        }
        
        if (!window.PerformanceObserver) {
            this.config.enablePerformanceObserver = false;
        }
        
        console.log('🔧 Capacités détectées:', this.config);
    }

    // Méthode de récupération en cas d'erreur
    fallbackInit() {
        try {
            setTimeout(function() {
                this.optimizeImages();
                this.optimizeVideo();
                this.initialized = true;
                console.log('🔄 Configuration de performance récupérée');
            }.bind(this), 1000);
        } catch (error) {
            console.error('Échec de la récupération de la configuration de performance:', error);
        }
    }

    // Configure les observateurs de performance
    setupPerformanceObservers() {
        if (this.config.enablePerformanceObserver && 'PerformanceObserver' in window) {
            try {
                var observer = new PerformanceObserver(function(list) {
                    for (var i = 0; i < list.getEntries().length; i++) {
                        var entry = list.getEntries()[i];
                        if (entry.entryType === 'navigation') {
                            this.logPerformanceMetrics(entry);
                        }
                    }
                }.bind(this));
                
                observer.observe({ entryTypes: ['navigation'] });
                this.observers.push(observer);
            } catch (error) {
                console.warn('Observer de performance non configuré:', error);
            }
        }
    }

    // Log les métriques de performance
    logPerformanceMetrics(navigationEntry) {
        try {
            var metrics = {
                'DNS Lookup': navigationEntry.domainLookupEnd - navigationEntry.domainLookupStart,
                'TCP Connect': navigationEntry.connectEnd - navigationEntry.connectStart,
                'Response Time': navigationEntry.responseEnd - navigationEntry.responseStart,
                'DOM Content Loaded': navigationEntry.domContentLoadedEventEnd - navigationEntry.navigationStart,
                'Page Load': navigationEntry.loadEventEnd - navigationEntry.navigationStart
            };

            console.log('📊 Métriques de performance:', metrics);
        } catch (error) {
            console.warn('Erreur lors du log des métriques:', error);
        }
    }

    // Optimise le chargement des images
    optimizeImages() {
        try {
            var images = document.querySelectorAll('img');
            
            for (var i = 0; i < images.length; i++) {
                var img = images[i];
                
                // Attributs de performance
                if (!img.hasAttribute('loading')) {
                    img.loading = this.config.imageLoading;
                }
                
                if (!img.hasAttribute('decoding')) {
                    img.decoding = this.config.imageDecoding;
                }
                
                // Optimisation pour les images non visibles
                if (this.config.enableIntersectionObserver) {
                    this.setupImageLazyLoading(img);
                }
                
                // Fallback pour les navigateurs sans support lazy loading
                if (!('loading' in HTMLImageElement.prototype)) {
                    this.setupImageLazyLoadingFallback(img);
                }
            }
            
            console.log('🖼️ Images optimisées:', images.length);
        } catch (error) {
            console.warn('Erreur lors de l\'optimisation des images:', error);
        }
    }

    // Configuration du lazy loading pour les images
    setupImageLazyLoading(img) {
        if (this.config.enableIntersectionObserver) {
            var observer = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        var img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                            observer.unobserve(img);
                        }
                    }
                });
            });
            
            observer.observe(img);
            this.observers.push(observer);
        }
    }

    // Fallback pour le lazy loading des images
    setupImageLazyLoadingFallback(img) {
        var loadImage = function() {
            if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            }
        };
        
        // Charger l'image quand elle entre dans le viewport
        var checkVisibility = function() {
            var rect = img.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                loadImage();
                window.removeEventListener('scroll', checkVisibility);
                window.removeEventListener('resize', checkVisibility);
            }
        };
        
        window.addEventListener('scroll', checkVisibility);
        window.addEventListener('resize', checkVisibility);
        checkVisibility();
    }

    // Optimise le chargement de la vidéo
    optimizeVideo() {
        try {
            var videos = document.querySelectorAll('video');
            
            for (var i = 0; i < videos.length; i++) {
                var video = videos[i];
                
                // Attributs de performance
                if (!video.hasAttribute('preload')) {
                    video.preload = this.config.videoPreload;
                }
                
                if (!video.hasAttribute('autoplay')) {
                    video.autoplay = this.config.videoAutoplay;
                }
                
                if (!video.hasAttribute('muted')) {
                    video.muted = this.config.videoMuted;
                }
                
                // Optimisation pour les appareils mobiles
                if (this.browser.isMobile) {
                    video.preload = 'none';
                    video.autoplay = false;
                }
                
                // Fallback pour les navigateurs sans support vidéo
                this.setupVideoFallback(video);
            }
            
            console.log('🎥 Vidéos optimisées:', videos.length);
        } catch (error) {
            console.warn('Erreur lors de l\'optimisation des vidéos:', error);
        }
    }

    // Fallback pour les vidéos
    setupVideoFallback(video) {
        video.addEventListener('error', function() {
            console.warn('Erreur de chargement vidéo, utilisation du fallback');
            var fallback = document.createElement('div');
            fallback.className = 'video-fallback';
            fallback.style.cssText = 'width: 100%; height: 100%; background: linear-gradient(135deg, #ffb366 0%, #ff9933 50%, #ff8000 100%);';
            video.parentNode.replaceChild(fallback, video);
        });
    }

    // Configuration de l'Intersection Observer
    setupIntersectionObserver() {
        if (this.config.enableIntersectionObserver) {
            try {
                // Observer pour les animations d'entrée
                var animationObserver = new IntersectionObserver(function(entries) {
                    entries.forEach(function(entry) {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('animate-in');
                        }
                    });
                }, {
                    threshold: 0.1,
                    rootMargin: '50px'
                });
                
                // Observer pour les éléments avec la classe 'observe'
                var elements = document.querySelectorAll('.observe');
                for (var i = 0; i < elements.length; i++) {
                    animationObserver.observe(elements[i]);
                }
                
                this.observers.push(animationObserver);
                console.log('👁️ Intersection Observer configuré');
            } catch (error) {
                console.warn('Erreur lors de la configuration de l\'Intersection Observer:', error);
            }
        }
    }

    // Optimisation des animations
    optimizeAnimations() {
        if (this.config.reducedMotion) {
            // Désactiver les animations pour les utilisateurs qui préfèrent le mouvement réduit
            var style = document.createElement('style');
            style.textContent = `
                *, *::before, *::after {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                }
            `;
            document.head.appendChild(style);
        } else {
            // Optimiser les animations pour les performances
            var animatedElements = document.querySelectorAll('.animate, .transition');
            for (var i = 0; i < animatedElements.length; i++) {
                var element = animatedElements[i];
                element.style.willChange = 'transform, opacity';
                element.style.transform = 'translateZ(0)';
            }
        }
        
        console.log('🎬 Animations optimisées');
    }

    // Configuration de l'optimisation du cache
    setupCacheOptimization() {
        if (this.config.cacheEnabled && 'serviceWorker' in navigator) {
            // Précharger les ressources critiques
            this.preloadCriticalResources();
            
            // Optimiser le cache existant
            this.optimizeExistingCache();
        }
    }

    // Préchargement des ressources critiques
    preloadCriticalResources() {
        var criticalResources = [
            'assets/css/styles.css',
            'assets/css/browser-compatibility.css',
            'assets/js/polyfills.js'
        ];
        
        for (var i = 0; i < criticalResources.length; i++) {
            var link = document.createElement('link');
            link.rel = 'preload';
            link.href = criticalResources[i];
            link.as = criticalResources[i].endsWith('.css') ? 'style' : 'script';
            document.head.appendChild(link);
        }
    }

    // Optimisation du cache existant
    optimizeExistingCache() {
        if ('caches' in window) {
            caches.keys().then(function(cacheNames) {
                cacheNames.forEach(function(cacheName) {
                    if (cacheName.includes('utegraphium')) {
                        caches.open(cacheName).then(function(cache) {
                            cache.keys().then(function(requests) {
                                console.log('📦 Cache optimisé:', cacheName, requests.length, 'ressources');
                            });
                        });
                    }
                });
            });
        }
    }

    // Configuration de la gestion d'erreur
    setupErrorHandling() {
        // Gestionnaire d'erreurs global
        window.addEventListener('error', function(event) {
            console.error('Erreur JavaScript:', event.error);
            this.reportError(event.error);
        }.bind(this));
        
        // Gestionnaire pour les promesses rejetées
        window.addEventListener('unhandledrejection', function(event) {
            console.error('Promesse rejetée non gérée:', event.reason);
            this.reportError(event.reason);
        }.bind(this));
        
        console.log('🛡️ Gestion d\'erreur configurée');
    }

    // Rapport d'erreur
    reportError(error) {
        // Envoyer l'erreur à un service de monitoring (optionnel)
        if (this.config.enableErrorReporting) {
            // Code pour envoyer l'erreur à un service externe
            console.log('📊 Erreur rapportée:', error);
        }
    }

    // Nettoyage des observateurs
    cleanup() {
        this.observers.forEach(function(observer) {
            if (observer && typeof observer.disconnect === 'function') {
                observer.disconnect();
            }
        });
        this.observers = [];
    }

    // Méthodes utilitaires
    getConfig() {
        return this.config;
    }

    updateConfig(newConfig) {
        this.config = Object.assign(this.config, newConfig);
        console.log('⚙️ Configuration mise à jour:', this.config);
    }

    isInitialized() {
        return this.initialized;
    }
}

// Initialisation automatique
var performanceConfig;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        performanceConfig = new PerformanceConfig();
    });
} else {
    performanceConfig = new PerformanceConfig();
}

// Exposition globale
window.PerformanceConfig = PerformanceConfig;
window.performanceConfig = performanceConfig;

console.log('🚀 Module de configuration de performance chargé');
