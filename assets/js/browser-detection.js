/**
 * Détection des capacités du navigateur et application des fallbacks
 * Compatible avec tous les navigateurs web existants - OPTIMISÉ
 */

(function() {
    'use strict';
    
    // Détection du navigateur et de ses capacités
    var BrowserDetector = {
        // Détection du navigateur
        browser: {
            name: 'unknown',
            version: 'unknown',
            isIE: false,
            isEdge: false,
            isChrome: false,
            isFirefox: false,
            isSafari: false,
            isOpera: false,
            isBrave: false,
            isOperaGX: false,
            isMobile: false,
            isTablet: false,
            isDesktop: false
        },
        
        // Détection des capacités
        capabilities: {
            cssGrid: false,
            flexbox: false,
            backdropFilter: false,
            objectFit: false,
            webp: false,
            webm: false,
            mp4: false,
            webgl: false,
            touch: false,
            serviceWorker: false,
            localStorage: false,
            sessionStorage: false,
            indexedDB: false,
            fetch: false,
            promises: false,
            asyncAwait: false,
            es6: false,
            webAnimations: false,
            intersectionObserver: false,
            resizeObserver: false,
            performanceObserver: false
        },
        
        // Initialisation
        init: function() {
            this.detectBrowser();
            this.detectCapabilities();
            this.applyFallbacks();
            this.optimizePerformance();
            this.setupEventListeners();
        },
        
        // Détection du navigateur
        detectBrowser: function() {
            var userAgent = navigator.userAgent;
            var vendor = navigator.vendor;
            var platform = navigator.platform;
            
            // Internet Explorer
            if (userAgent.indexOf('MSIE') !== -1 || userAgent.indexOf('Trident') !== -1) {
                this.browser.isIE = true;
                this.browser.name = 'Internet Explorer';
                this.browser.version = this.extractVersion(userAgent, 'MSIE') || this.extractVersion(userAgent, 'rv:');
            }
            // Edge (ancien et nouveau)
            else if (userAgent.indexOf('Edge') !== -1 || userAgent.indexOf('Edg') !== -1) {
                this.browser.isEdge = true;
                this.browser.name = 'Edge';
                this.browser.version = this.extractVersion(userAgent, 'Edge') || this.extractVersion(userAgent, 'Edg');
            }
            // Chrome
            else if (userAgent.indexOf('Chrome') !== -1 && vendor.indexOf('Google') !== -1) {
                this.browser.isChrome = true;
                this.browser.name = 'Chrome';
                this.browser.version = this.extractVersion(userAgent, 'Chrome');
            }
            // Firefox
            else if (userAgent.indexOf('Firefox') !== -1) {
                this.browser.isFirefox = true;
                this.browser.name = 'Firefox';
                this.browser.version = this.extractVersion(userAgent, 'Firefox');
            }
            // Safari
            else if (userAgent.indexOf('Safari') !== -1 && vendor.indexOf('Apple') !== -1) {
                this.browser.isSafari = true;
                this.browser.name = 'Safari';
                this.browser.version = this.extractVersion(userAgent, 'Version');
            }
            // Opera (ancien et nouveau)
            else if (userAgent.indexOf('Opera') !== -1 || userAgent.indexOf('OPR') !== -1) {
                this.browser.isOpera = true;
                this.browser.name = 'Opera';
                this.browser.version = this.extractVersion(userAgent, 'Opera') || this.extractVersion(userAgent, 'OPR');
            }
            
            // Détection spécifique pour Brave
            if (navigator.brave && navigator.brave.isBrave()) {
                this.browser.isBrave = true;
                this.browser.name = 'Brave';
            }
            
            // Détection spécifique pour Opera GX
            if (userAgent.indexOf('Opera GX') !== -1) {
                this.browser.isOperaGX = true;
                this.browser.name = 'Opera GX';
            }
            
            // Détection mobile/tablet/desktop
            this.detectDeviceType(userAgent, platform);
            
            console.log('🌐 Navigateur détecté:', this.browser.name, this.browser.version);
            console.log('📱 Type d\'appareil:', this.browser.isMobile ? 'Mobile' : this.browser.isTablet ? 'Tablet' : 'Desktop');
        },
        
        // Détection du type d'appareil
        detectDeviceType: function(userAgent, platform) {
            var mobileKeywords = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS|FxiOS/i;
            var tabletKeywords = /iPad|Android(?=.*\bMobile\b)(?=.*\bSafari\b)/i;
            
            this.browser.isMobile = mobileKeywords.test(userAgent);
            this.browser.isTablet = tabletKeywords.test(userAgent) || (this.browser.isMobile && window.innerWidth > 768);
            this.browser.isDesktop = !this.browser.isMobile && !this.browser.isTablet;
        },
        
        // Extraction de la version
        extractVersion: function(userAgent, browserName) {
            var match = userAgent.match(new RegExp(browserName + '/([0-9.]+)'));
            return match ? match[1] : 'unknown';
        },
        
        // Détection des capacités
        detectCapabilities: function() {
            // CSS Grid
            this.capabilities.cssGrid = this.testCSSGrid();
            
            // Flexbox
            this.capabilities.flexbox = this.testFlexbox();
            
            // Backdrop Filter
            this.capabilities.backdropFilter = this.testBackdropFilter();
            
            // Object Fit
            this.capabilities.objectFit = this.testObjectFit();
            
            // Formats vidéo
            this.capabilities.webm = this.testVideoFormat('video/webm');
            this.capabilities.mp4 = this.testVideoFormat('video/mp4');
            
            // WebGL
            this.capabilities.webgl = this.testWebGL();
            
            // Touch
            this.capabilities.touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
            
            // Service Worker
            this.capabilities.serviceWorker = 'serviceWorker' in navigator;
            
            // Storage
            this.capabilities.localStorage = this.testLocalStorage();
            this.capabilities.sessionStorage = this.testSessionStorage();
            this.capabilities.indexedDB = this.testIndexedDB();
            
            // Fetch API
            this.capabilities.fetch = 'fetch' in window;
            
            // Promises
            this.capabilities.promises = 'Promise' in window;
            
            // Async/Await
            this.capabilities.asyncAwait = this.testAsyncAwait();
            
            // ES6
            this.capabilities.es6 = this.testES6();
            
            // Web Animations
            this.capabilities.webAnimations = 'animate' in Element.prototype;
            
            // Intersection Observer
            this.capabilities.intersectionObserver = 'IntersectionObserver' in window;
            
            // Resize Observer
            this.capabilities.resizeObserver = 'ResizeObserver' in window;
            
            // Performance Observer
            this.capabilities.performanceObserver = 'PerformanceObserver' in window;
            
            console.log('🔧 Capacités détectées:', this.capabilities);
        },
        
        // Tests des capacités
        testCSSGrid: function() {
            try {
                var test = document.createElement('div');
                test.style.display = 'grid';
                return test.style.display === 'grid';
            } catch (e) {
                return false;
            }
        },
        
        testFlexbox: function() {
            try {
                var test = document.createElement('div');
                test.style.display = 'flex';
                return test.style.display === 'flex';
            } catch (e) {
                return false;
            }
        },
        
        testBackdropFilter: function() {
            try {
                var test = document.createElement('div');
                test.style.backdropFilter = 'blur(10px)';
                return test.style.backdropFilter !== '';
            } catch (e) {
                return false;
            }
        },
        
        testObjectFit: function() {
            try {
                var test = document.createElement('img');
                test.style.objectFit = 'cover';
                return test.style.objectFit === 'cover';
            } catch (e) {
                return false;
            }
        },
        
        testVideoFormat: function(format) {
            try {
                var video = document.createElement('video');
                return video.canPlayType && video.canPlayType(format) !== '';
            } catch (e) {
                return false;
            }
        },
        
        testWebGL: function() {
            try {
                var canvas = document.createElement('canvas');
                return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
            } catch (e) {
                return false;
            }
        },
        
        testLocalStorage: function() {
            try {
                var test = 'test';
                localStorage.setItem(test, test);
                localStorage.removeItem(test);
                return true;
            } catch (e) {
                return false;
            }
        },
        
        testSessionStorage: function() {
            try {
                var test = 'test';
                sessionStorage.setItem(test, test);
                sessionStorage.removeItem(test);
                return true;
            } catch (e) {
                return false;
            }
        },
        
        testIndexedDB: function() {
            return 'indexedDB' in window;
        },
        
        testAsyncAwait: function() {
            try {
                eval('(async () => {})()');
                    return true;
                } catch (e) {
                    return false;
                }
        },
            
        testES6: function() {
                try {
                eval('const test = () => {}; let x = 1; const y = 2;');
                    return true;
                } catch (e) {
                    return false;
                }
        },
        
        // Application des fallbacks
        applyFallbacks: function() {
            // Ajouter des classes CSS selon les capacités
            var html = document.documentElement;
            
            // Classes pour le navigateur
            html.className += ' browser-' + this.browser.name.toLowerCase().replace(/\s+/g, '-');
            html.className += ' browser-version-' + this.browser.version.split('.')[0];
            
            // Classes pour les capacités
            if (!this.capabilities.cssGrid) {
                html.className += ' no-css-grid';
            }
            if (!this.capabilities.flexbox) {
                html.className += ' no-flexbox';
            }
            if (!this.capabilities.backdropFilter) {
                html.className += ' no-backdrop-filter';
            }
            if (!this.capabilities.objectFit) {
                html.className += ' no-object-fit';
            }
            if (!this.capabilities.webgl) {
                html.className += ' no-webgl';
            }
            if (!this.capabilities.touch) {
                html.className += ' no-touch';
            } else {
                html.className += ' touch-device';
            }
            if (!this.capabilities.serviceWorker) {
                html.className += ' no-service-worker';
            }
            if (!this.capabilities.localStorage) {
                html.className += ' no-local-storage';
            }
            if (!this.capabilities.fetch) {
                html.className += ' no-fetch';
            }
            if (!this.capabilities.promises) {
                html.className += ' no-promises';
            }
            if (!this.capabilities.es6) {
                html.className += ' no-es6';
            }
            if (!this.capabilities.webAnimations) {
                html.className += ' no-web-animations';
            }
            if (!this.capabilities.intersectionObserver) {
                html.className += ' no-intersection-observer';
            }
            
            // Classes pour le type d'appareil
            if (this.browser.isMobile) {
                html.className += ' mobile-device';
            } else if (this.browser.isTablet) {
                html.className += ' tablet-device';
            } else {
                html.className += ' desktop-device';
            }
            
            // Classes pour les navigateurs spécifiques
            if (this.browser.isIE) {
                html.className += ' internet-explorer';
            }
            if (this.browser.isEdge) {
                html.className += ' edge-browser';
            }
            if (this.browser.isChrome) {
                html.className += ' chrome-browser';
            }
            if (this.browser.isFirefox) {
                html.className += ' firefox-browser';
            }
            if (this.browser.isSafari) {
                html.className += ' safari-browser';
            }
            if (this.browser.isOpera) {
                html.className += ' opera-browser';
            }
            if (this.browser.isBrave) {
                html.className += ' brave-browser';
            }
            if (this.browser.isOperaGX) {
                html.className += ' opera-gx-browser';
            }
            
            console.log('🎨 Classes CSS appliquées:', html.className);
        },
        
        // Optimisation des performances
        optimizePerformance: function() {
            // Optimisations pour les appareils mobiles
            if (this.browser.isMobile) {
                this.optimizeForMobile();
            }
            
            // Optimisations pour les navigateurs anciens
            if (this.browser.isIE || parseFloat(this.browser.version) < 12) {
                this.optimizeForOldBrowsers();
            }
            
            // Optimisations pour les appareils à faible puissance
            if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) {
                this.optimizeForLowPower();
            }
        },
        
        // Optimisations pour mobile
        optimizeForMobile: function() {
            // Réduire les animations
            var style = document.createElement('style');
            style.textContent = `
                @media (max-width: 768px) {
                    * {
                        -webkit-animation-duration: 0.3s !important;
                        -moz-animation-duration: 0.3s !important;
                        -o-animation-duration: 0.3s !important;
                        animation-duration: 0.3s !important;
                    }
                }
            `;
            document.head.appendChild(style);
        },
        
        // Optimisations pour les navigateurs anciens
        optimizeForOldBrowsers: function() {
            // Désactiver les animations complexes
            var style = document.createElement('style');
            style.textContent = `
                .gradient-orb {
                    display: none !important;
                }
                .backdrop-blur {
                    background: rgba(255, 255, 255, 0.9) !important;
                }
            `;
            document.head.appendChild(style);
        },
        
        // Optimisations pour les appareils à faible puissance
        optimizeForLowPower: function() {
            // Réduire les effets visuels
            var style = document.createElement('style');
            style.textContent = `
                .gradient-orb {
                    opacity: 0.1 !important;
                }
                .backdrop-blur {
                    -webkit-backdrop-filter: blur(5px) !important;
                    -moz-backdrop-filter: blur(5px) !important;
                    backdrop-filter: blur(5px) !important;
                }
            `;
            document.head.appendChild(style);
        },
        
        // Configuration des écouteurs d'événements
        setupEventListeners: function() {
            // Détection du support JavaScript
            document.documentElement.className += ' js';
            
            // Détection de la préférence de mouvement réduit
            if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                document.documentElement.className += ' reduced-motion';
            }
            
            // Détection du mode sombre
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document.documentElement.className += ' dark-mode';
            }
            
            // Détection de la connexion lente
            if ('connection' in navigator) {
                var connection = navigator.connection;
                if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
                    document.documentElement.className += ' slow-connection';
                }
            }
            
            // Détection de la batterie faible
            if ('getBattery' in navigator) {
                navigator.getBattery().then(function(battery) {
                    if (battery.level < 0.2) {
                        document.documentElement.className += ' low-battery';
                    }
                });
            }
        },
        
        // Méthodes utilitaires
        getBrowserInfo: function() {
            return {
                browser: this.browser,
                capabilities: this.capabilities
            };
        },
        
        isModernBrowser: function() {
            return this.capabilities.cssGrid && 
                   this.capabilities.flexbox && 
                   this.capabilities.fetch && 
                   this.capabilities.promises && 
                   this.capabilities.es6;
        },
        
        needsPolyfills: function() {
            return !this.isModernBrowser();
        }
    };
    
    // Initialisation automatique
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            BrowserDetector.init();
        });
    } else {
        BrowserDetector.init();
    }
    
    // Exposition globale
    window.BrowserDetector = BrowserDetector;
    
    console.log('🚀 Détection des navigateurs initialisée');
})();
