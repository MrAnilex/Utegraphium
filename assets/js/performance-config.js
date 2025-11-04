// Configuration de performance pour Utegraphium - OPTIMISÉ POUR TOUS NAVIGATEURS
(function() {
    'use strict';

    function PerformanceConfig() {
        this.config = {
            musicDelay: 1500,
            counterDelay: 500,
            lazyLoadDelay: 100,
            imageLoading: 'lazy',
            imageDecoding: 'async',
            videoPreload: 'metadata',
            videoAutoplay: true,
            videoMuted: true,
            fontDisplay: 'swap',
            fontPreload: true,
            animationDuration: 300,
            reducedMotion: false,
            cacheEnabled: true,
            cacheStrategy: 'cache-first',
            enableIntersectionObserver: true,
            enableResizeObserver: true,
            enablePerformanceObserver: true,
            enableErrorReporting: false
        };

        this.browser = window.BrowserDetector && window.BrowserDetector.browser ? window.BrowserDetector.browser : { isMobile: false };
        this.initialized = false;
        this.observers = [];
        this.init();
    }

    PerformanceConfig.prototype.init = function() {
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
    };

    PerformanceConfig.prototype.detectCapabilities = function() {
        if (window.matchMedia) {
            try {
                var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
                if (prefersReducedMotion && prefersReducedMotion.matches) {
                    this.config.reducedMotion = true;
                    this.config.animationDuration = 0;
                }
            } catch (error) {
                // Ignorer les erreurs
            }
        }

        if (navigator.connection) {
            var connection = navigator.connection;
            if (connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g')) {
                this.config.cacheStrategy = 'network-first';
                this.config.animationDuration = 0;
            }
        }

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
    };

    PerformanceConfig.prototype.fallbackInit = function() {
        var self = this;
        try {
            setTimeout(function() {
                self.optimizeImages();
                self.optimizeVideo();
                self.initialized = true;
                console.log('🔄 Configuration de performance récupérée');
            }, 1000);
        } catch (error) {
            console.error('Échec de la récupération de la configuration de performance:', error);
        }
    };

    PerformanceConfig.prototype.setupPerformanceObservers = function() {
        if (this.config.enablePerformanceObserver && window.PerformanceObserver) {
            var self = this;
            try {
                var observer = new PerformanceObserver(function(list) {
                    var entries = list.getEntries();
                    for (var i = 0; i < entries.length; i++) {
                        var entry = entries[i];
                        if (entry.entryType === 'navigation') {
                            self.logPerformanceMetrics(entry);
                        }
                    }
                });

                observer.observe({ entryTypes: ['navigation'] });
                this.observers.push(observer);
            } catch (error) {
                console.warn('Observer de performance non configuré:', error);
            }
        }
    };

    PerformanceConfig.prototype.logPerformanceMetrics = function(navigationEntry) {
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
    };

    PerformanceConfig.prototype.optimizeImages = function() {
        try {
            var images = document.querySelectorAll('img');

            for (var i = 0; i < images.length; i++) {
                var img = images[i];

                if (!img.hasAttribute('loading')) {
                    img.loading = this.config.imageLoading;
                }

                if (!img.hasAttribute('decoding')) {
                    img.decoding = this.config.imageDecoding;
                }

                if (this.config.enableIntersectionObserver) {
                    this.setupImageLazyLoading(img);
                }

                if (!('loading' in HTMLImageElement.prototype)) {
                    this.setupImageLazyLoadingFallback(img);
                }
            }

            console.log('🖼️ Images optimisées:', images.length);
        } catch (error) {
            console.warn('Erreur lors de l\'optimisation des images:', error);
        }
    };

    PerformanceConfig.prototype.setupImageLazyLoading = function(img) {
        if (!this.config.enableIntersectionObserver || !window.IntersectionObserver) {
            return;
        }

        var observer = new IntersectionObserver(function(entries) {
            for (var i = 0; i < entries.length; i++) {
                var entry = entries[i];
                if (entry.isIntersecting) {
                    var targetImg = entry.target;
                    if (targetImg.dataset && targetImg.dataset.src) {
                        targetImg.src = targetImg.dataset.src;
                        targetImg.removeAttribute('data-src');
                    }
                    observer.unobserve(targetImg);
                }
            }
        });

        observer.observe(img);
        this.observers.push(observer);
    };

    PerformanceConfig.prototype.setupImageLazyLoadingFallback = function(img) {
        var loadImage = function() {
            if (img.dataset && img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            }
        };

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
    };

    PerformanceConfig.prototype.optimizeVideo = function() {
        try {
            var videos = document.querySelectorAll('video');

            for (var i = 0; i < videos.length; i++) {
                var video = videos[i];

                if (!video.hasAttribute('preload')) {
                    video.preload = this.config.videoPreload;
                }

                if (!video.hasAttribute('autoplay')) {
                    video.autoplay = this.config.videoAutoplay;
                }

                if (!video.hasAttribute('muted')) {
                    video.muted = this.config.videoMuted;
                }

                if (this.browser.isMobile) {
                    video.preload = 'none';
                    video.autoplay = false;
                }

                this.setupVideoFallback(video);
            }

            console.log('🎥 Vidéos optimisées:', videos.length);
        } catch (error) {
            console.warn('Erreur lors de l\'optimisation des vidéos:', error);
        }
    };

    PerformanceConfig.prototype.setupVideoFallback = function(video) {
        video.addEventListener('error', function() {
            console.warn('Erreur de chargement vidéo, utilisation du fallback');
            if (video.parentNode) {
                var fallback = document.createElement('div');
                fallback.className = 'video-fallback';
                fallback.style.cssText = 'width: 100%; height: 100%; background: linear-gradient(135deg, #ffb366 0%, #ff9933 50%, #ff8000 100%);';
                video.parentNode.replaceChild(fallback, video);
            }
        });
    };

    PerformanceConfig.prototype.setupIntersectionObserver = function() {
        if (!this.config.enableIntersectionObserver || !window.IntersectionObserver) {
            return;
        }

        try {
            var observer = new IntersectionObserver(function(entries) {
                for (var i = 0; i < entries.length; i++) {
                    var entry = entries[i];
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-in');
                    }
                }
            }, {
                threshold: 0.1,
                rootMargin: '50px'
            });

            var elements = document.querySelectorAll('.observe');
            for (var j = 0; j < elements.length; j++) {
                observer.observe(elements[j]);
            }

            this.observers.push(observer);
            console.log('👁️ Intersection Observer configuré');
        } catch (error) {
            console.warn('Erreur lors de la configuration de l\'Intersection Observer:', error);
        }
    };

    PerformanceConfig.prototype.optimizeAnimations = function() {
        if (this.config.reducedMotion) {
            var style = document.createElement('style');
            style.textContent = '' +
                '*, *::before, *::after {' +
                '    animation-duration: 0.01ms !important;' +
                '    animation-iteration-count: 1 !important;' +
                '    transition-duration: 0.01ms !important;' +
                '}';
            document.head.appendChild(style);
        } else {
            var animatedElements = document.querySelectorAll('.animate, .transition');
            for (var i = 0; i < animatedElements.length; i++) {
                var element = animatedElements[i];
                element.style.willChange = 'transform, opacity';
                element.style.transform = 'translateZ(0)';
            }
        }

        console.log('🎬 Animations optimisées');
    };

    PerformanceConfig.prototype.setupCacheOptimization = function() {
        if (this.config.cacheEnabled && 'serviceWorker' in navigator) {
            this.preloadCriticalResources();
            this.optimizeExistingCache();
        }
    };

    PerformanceConfig.prototype.preloadCriticalResources = function() {
        var criticalResources = [
            'assets/css/styles.css',
            'assets/css/browser-compatibility.css',
            'assets/js/polyfills.js'
        ];

        for (var i = 0; i < criticalResources.length; i++) {
            var link = document.createElement('link');
            link.rel = 'preload';
            link.href = criticalResources[i];
            link.as = criticalResources[i].slice(-4) === '.css' ? 'style' : 'script';
            document.head.appendChild(link);
        }
    };

    PerformanceConfig.prototype.optimizeExistingCache = function() {
        if (!window.caches || !caches.keys) {
            return;
        }

        caches.keys().then(function(cacheNames) {
            for (var i = 0; i < cacheNames.length; i++) {
                var cacheName = cacheNames[i];
                if (cacheName.indexOf('utegraphium') !== -1) {
                    caches.open(cacheName).then(function(cache) {
                        cache.keys().then(function(requests) {
                            console.log('📦 Cache optimisé:', cacheName, requests.length, 'ressources');
                        });
                    });
                }
            }
        });
    };

    PerformanceConfig.prototype.setupErrorHandling = function() {
        var self = this;
        window.addEventListener('error', function(event) {
            console.error('Erreur JavaScript:', event.error);
            self.reportError(event.error);
        });

        window.addEventListener('unhandledrejection', function(event) {
            console.error('Promesse rejetée non gérée:', event.reason);
            self.reportError(event.reason);
        });

        console.log('🛡️ Gestion d\'erreur configurée');
    };

    PerformanceConfig.prototype.reportError = function(error) {
        if (this.config.enableErrorReporting) {
            console.log('📊 Erreur rapportée:', error);
        }
    };

    PerformanceConfig.prototype.cleanup = function() {
        for (var i = 0; i < this.observers.length; i++) {
            var observer = this.observers[i];
            if (observer && typeof observer.disconnect === 'function') {
                observer.disconnect();
            }
        }
        this.observers = [];
    };

    PerformanceConfig.prototype.getConfig = function() {
        return this.config;
    };

    PerformanceConfig.prototype.updateConfig = function(newConfig) {
        if (!newConfig) {
            return;
        }

        for (var key in newConfig) {
            if (newConfig.hasOwnProperty(key)) {
                this.config[key] = newConfig[key];
            }
        }

        console.log('⚙️ Configuration mise à jour:', this.config);
    };

    PerformanceConfig.prototype.isInitialized = function() {
        return this.initialized;
    };

    var performanceConfigInstance = null;

    function initPerformanceConfig() {
        try {
            performanceConfigInstance = new PerformanceConfig();
            window.performanceConfig = performanceConfigInstance;
        } catch (error) {
            console.error('Erreur lors de l\'initialisation de PerformanceConfig:', error);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPerformanceConfig);
    } else {
        initPerformanceConfig();
    }

    window.PerformanceConfig = PerformanceConfig;

    console.log('🚀 Module de configuration de performance chargé');
})();
