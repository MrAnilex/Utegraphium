// Script de diagnostic et réparation automatique pour Utegraphium
(function() {
    'use strict';

    function SiteRepair() {
        this.issues = [];
        this.fixes = [];
        this.init();
    }

    SiteRepair.prototype.init = function() {
        var self = this;
        console.log('🔧 Démarrage du diagnostic du site...');

        var startDiagnostics = function() {
            setTimeout(function() {
                self.runDiagnostics();
            }, 1000);
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', startDiagnostics);
        } else {
            startDiagnostics();
        }
    };

    SiteRepair.prototype.runDiagnostics = function() {
        console.log('🔍 Lancement des diagnostics...');

        this.checkVideoBackground();
        this.checkImages();
        this.checkCSS();
        this.checkJavaScript();
        this.checkResponsive();
        this.checkPerformance();

        this.applyFixes();
        this.generateReport();
    };

    SiteRepair.prototype.checkVideoBackground = function() {
        console.log('🎬 Vérification du fond vidéo...');

        var video = document.querySelector('.background-video');
        if (!video) {
            this.issues.push('Vidéo de fond manquante');
            return;
        }

        var self = this;

        video.addEventListener('loadeddata', function() {
            console.log('✅ Vidéo chargée avec succès');
            video.classList.add('loaded');
        });

        video.addEventListener('error', function() {
            console.warn('❌ Erreur de chargement vidéo');
            self.issues.push('Erreur de chargement vidéo');
            self.showVideoFallback();
        });

        var videoStyle = window.getComputedStyle(video);
        if (videoStyle.transform === 'none') {
            this.fixes.push('Ajout du dézoom vidéo');
            video.style.transform = 'scale(1.2)';
            video.style.objectPosition = 'center center';
        }
    };

    SiteRepair.prototype.showVideoFallback = function() {
        var background = document.querySelector('.background');
        if (background) {
            var fallback = document.createElement('div');
            fallback.className = 'video-fallback';
            fallback.style.cssText = '' +
                'position: absolute;' +
                'top: 0;' +
                'left: 0;' +
                'width: 100%;' +
                'height: 100%;' +
                'background: linear-gradient(135deg, #ffb366 0%, #ff9933 50%, #ff8000 100%);' +
                'z-index: -3;' +
                'opacity: 0;' +
                'transition: opacity 0.5s ease;';
            background.appendChild(fallback);

            setTimeout(function() {
                fallback.style.opacity = '1';
            }, 100);
        }
    };

    SiteRepair.prototype.checkImages = function() {
        console.log('🖼️ Vérification des images...');

        var images = document.querySelectorAll('img');
        for (var i = 0; i < images.length; i++) {
            this.inspectImage(images[i], i);
        }
    };

    SiteRepair.prototype.inspectImage = function(img, index) {
        var self = this;
        img.addEventListener('error', function() {
            console.warn('❌ Image ' + (index + 1) + ' non chargée:', img.src);
            self.issues.push('Image non chargée: ' + img.src);
            self.createImageFallback(img);
        });

        img.addEventListener('load', function() {
            console.log('✅ Image ' + (index + 1) + ' chargée:', img.src);
        });

        if (!img.hasAttribute('loading')) {
            img.setAttribute('loading', 'lazy');
        }
        if (!img.hasAttribute('decoding')) {
            img.setAttribute('decoding', 'async');
        }
    };

    SiteRepair.prototype.createImageFallback = function(img) {
        var parent = img.parentElement;
        if (parent) {
            var fallback = document.createElement('div');
            var width = img.width || 100;
            var height = img.height || 100;
            fallback.style.cssText = '' +
                'width: ' + width + 'px;' +
                'height: ' + height + 'px;' +
                'background: linear-gradient(45deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.2));' +
                'border-radius: 10px;' +
                'display: flex;' +
                'align-items: center;' +
                'justify-content: center;' +
                'color: rgba(255, 255, 255, 0.6);' +
                'font-size: 0.8rem;' +
                'text-align: center;';
            fallback.textContent = 'Image non disponible';
            parent.appendChild(fallback);
        }
    };

    SiteRepair.prototype.checkCSS = function() {
        console.log('🎨 Vérification du CSS...');

        var body = document.body;
        var bodyStyle = window.getComputedStyle(body);

        if (bodyStyle.overflowX !== 'hidden') {
            this.fixes.push('Correction overflow horizontal');
            body.style.overflowX = 'hidden';
        }

        var navbar = document.querySelector('.navbar');
        if (navbar) {
            var navbarStyle = window.getComputedStyle(navbar);
            if (parseInt(navbarStyle.zIndex, 10) < 1000) {
                this.fixes.push('Correction z-index navbar');
                navbar.style.zIndex = '1000';
            }
        }

        var elementsWithBackdrop = document.querySelectorAll('.navbar, .hero-content, .fact-card, .newsletter-section, .footer');
        for (var i = 0; i < elementsWithBackdrop.length; i++) {
            var element = elementsWithBackdrop[i];
            var style = window.getComputedStyle(element);
            if (!style.backdropFilter || style.backdropFilter === 'none') {
                var currentBg = style.backgroundColor;
                if (currentBg && currentBg !== 'rgba(0, 0, 0, 0)') {
                    element.style.backgroundColor = currentBg.replace('0.1', '0.25');
                }
            }
        }
    };

    SiteRepair.prototype.checkJavaScript = function() {
        console.log('⚡ Vérification du JavaScript...');
        var self = this;

        window.addEventListener('error', function(event) {
            console.error('❌ Erreur JavaScript détectée:', event.error);
            self.issues.push('Erreur JS: ' + event.message);
        });

        window.addEventListener('unhandledrejection', function(event) {
            console.error('❌ Promesse rejetée:', event.reason);
            self.issues.push('Promesse rejetée: ' + event.reason);
        });

        var scripts = document.querySelectorAll('script[src]');
        for (var i = 0; i < scripts.length; i++) {
            (function(script) {
                script.addEventListener('error', function() {
                    console.warn('❌ Script non chargé:', script.src);
                    self.issues.push('Script non chargé: ' + script.src);
                });
            })(scripts[i]);
        }
    };

    SiteRepair.prototype.checkResponsive = function() {
        console.log('📱 Vérification du responsive...');

        var viewport = document.querySelector('meta[name="viewport"]');
        if (!viewport) {
            this.issues.push('Meta viewport manquant');
            var meta = document.createElement('meta');
            meta.name = 'viewport';
            meta.content = 'width=device-width, initial-scale=1.0';
            document.head.appendChild(meta);
        }

        var flexElements = document.querySelectorAll('.nav-container, .hero-stats, .facts-grid, .newsletter-form');
        for (var i = 0; i < flexElements.length; i++) {
            var element = flexElements[i];
            var style = window.getComputedStyle(element);
            if (style.display === 'flex' && !style.flexWrap) {
                element.style.flexWrap = 'wrap';
            }
        }
    };

    SiteRepair.prototype.checkPerformance = function() {
        console.log('⚡ Vérification des performances...');

        var images = document.querySelectorAll('img');
        for (var i = 0; i < images.length; i++) {
            var img = images[i];
            if (img.src && img.src.indexOf('.png') !== -1 && img.width > 500) {
                console.warn('⚠️ Image PNG potentiellement lourde:', img.src);
            }
        }

        if (window.innerWidth <= 768) {
            this.fixes.push('Optimisation mobile');
            this.optimizeForMobile();
        }
    };

    SiteRepair.prototype.optimizeForMobile = function() {
        var style = document.createElement('style');
        style.textContent = '' +
            '@media (max-width: 768px) {' +
            '    .fact-card:hover,' +
            '    .stat-card:hover,' +
            '    .nav-link:hover {' +
            '        transform: none !important;' +
            '    }' +
            '    .background-video {' +
            '        transform: scale(1.1) !important;' +
            '    }' +
            '}';
        document.head.appendChild(style);
    };

    SiteRepair.prototype.applyFixes = function() {
        console.log('🔧 Application des corrections...');

        for (var i = 0; i < this.fixes.length; i++) {
            console.log('✅ Correction appliquée: ' + this.fixes[i]);
        }

        this.autoFixCommonIssues();
    };

    SiteRepair.prototype.autoFixCommonIssues = function() {
        var elements = document.querySelectorAll('.hero-section, .quick-facts, .newsletter-section');
        for (var i = 0; i < elements.length; i++) {
            elements[i].style.zIndex = (1 + i).toString();
        }

        var focusableElements = document.querySelectorAll('a, button, input, textarea');
        for (var j = 0; j < focusableElements.length; j++) {
            if (!focusableElements[j].hasAttribute('tabindex')) {
                focusableElements[j].setAttribute('tabindex', '0');
            }
        }

        var textElements = document.querySelectorAll('p, span, h1, h2, h3');
        for (var k = 0; k < textElements.length; k++) {
            var element = textElements[k];
            var style = window.getComputedStyle(element);
            if (style.color === 'rgba(255, 255, 255, 0.8)' || style.color === 'rgba(255, 255, 255, 0.6)') {
                element.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.5)';
            }
        }
    };

    SiteRepair.prototype.generateReport = function() {
        console.log('📊 Rapport de diagnostic:');
        console.log('🔍 Problèmes détectés: ' + this.issues.length);
        console.log('🔧 Corrections appliquées: ' + this.fixes.length);

        if (this.issues.length > 0) {
            console.log('❌ Problèmes:', this.issues);
        }

        if (this.fixes.length > 0) {
            console.log('✅ Corrections:', this.fixes);
        }

        if (this.issues.length > 0) {
            this.showUserNotification();
        }
    };

    SiteRepair.prototype.showUserNotification = function() {
        var notification = document.createElement('div');
        notification.style.cssText = '' +
            'position: fixed;' +
            'top: 20px;' +
            'right: 20px;' +
            'background: rgba(255, 128, 0, 0.9);' +
            'color: white;' +
            'padding: 1rem;' +
            'border-radius: 10px;' +
            'z-index: 10000;' +
            'max-width: 300px;' +
            'font-size: 0.9rem;' +
            'box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);';
        notification.innerHTML = '' +
            '<strong>🔧 Diagnostic terminé</strong><br>' +
            this.issues.length + ' problème(s) détecté(s)<br>' +
            this.fixes.length + ' correction(s) appliquée(s)';

        document.body.appendChild(notification);

        setTimeout(function() {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(function() {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 500);
        }, 5000);
    };

    var siteRepair = null;

    function initializeSiteRepair() {
        try {
            if (!siteRepair) {
                siteRepair = new SiteRepair();
                window.siteRepair = siteRepair;
                console.log('🔧 Système de réparation initialisé');
            }
        } catch (error) {
            console.error('Erreur lors de l\'initialisation du système de réparation:', error);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeSiteRepair);
    } else {
        initializeSiteRepair();
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = SiteRepair;
    }
})();
