// Système de diagnostic d'affichage pour Utegraphium
(function() {
    'use strict';
    
    var DebugDisplay = {
        init: function() {
            this.checkVideoBackground();
            this.checkBrowserCompatibility();
            this.setupErrorHandling();
            this.logDiagnostics();
        },
        
        // Vérification et réparation de la vidéo d'arrière-plan
        checkVideoBackground: function() {
            var video = document.querySelector('.background-video');
            var background = document.querySelector('.background');
            var fallback = document.querySelector('.background-fallback');
            
            if (!video) {
                console.error('❌ Vidéo d\'arrière-plan non trouvée');
                return;
            }
            
            console.log('🎥 Vérification de la vidéo d\'arrière-plan...');
            
            // Vérifier si la vidéo peut être lue
            var canPlayVideo = video.canPlayType && video.canPlayType('video/mp4');
            console.log('📹 Support vidéo MP4:', canPlayVideo ? '✅ Oui' : '❌ Non');
            
            // Vérifier les sources vidéo
            var sources = video.querySelectorAll('source');
            console.log('📁 Sources vidéo trouvées:', sources.length);
            
            sources.forEach(function(source, index) {
                console.log('  Source', index + 1, ':', source.src, '(', source.type, ')');
            });
            
            // Essayer de charger la vidéo
            this.loadVideo(video);
            
            // Gestion des erreurs vidéo
            video.addEventListener('error', function(e) {
                console.error('❌ Erreur vidéo:', e);
                this.handleVideoError(video, fallback);
            }.bind(this));
            
            // Gestion du chargement réussi
            video.addEventListener('loadeddata', function() {
                console.log('✅ Vidéo chargée avec succès');
                this.showVideo(video, fallback);
            }.bind(this));
            
            // Gestion du canplay
            video.addEventListener('canplay', function() {
                console.log('✅ Vidéo prête à être lue');
                this.showVideo(video, fallback);
            }.bind(this));
            
            // Vérifier si la vidéo est en cours de lecture
            setTimeout(function() {
                if (video.readyState >= 2) {
                    console.log('✅ Vidéo en cours de lecture');
                    this.showVideo(video, fallback);
                } else {
                    console.warn('⚠️ Vidéo pas encore prête, utilisation du fallback');
                    this.showFallback(video, fallback);
                }
            }.bind(this), 2000);
        },
        
        // Charger la vidéo
        loadVideo: function(video) {
            try {
                // Forcer le chargement de la vidéo
                video.load();
                
                // Essayer de démarrer la lecture
                var playPromise = video.play();
                
                if (playPromise !== undefined) {
                    playPromise.then(function() {
                        console.log('✅ Lecture vidéo démarrée automatiquement');
                    }).catch(function(error) {
                        console.warn('⚠️ Lecture automatique bloquée:', error);
                        // La lecture automatique peut être bloquée par le navigateur
                        // C'est normal, la vidéo se lancera après interaction utilisateur
                    });
                }
            } catch (error) {
                console.error('❌ Erreur lors du chargement vidéo:', error);
            }
        },
        
        // Gérer les erreurs vidéo
        handleVideoError: function(video, fallback) {
            console.log('🔄 Activation du fallback vidéo');
            this.showFallback(video, fallback);
        },
        
        // Afficher la vidéo
        showVideo: function(video, fallback) {
            if (video && fallback) {
                video.style.display = 'block';
                video.style.opacity = '1';
                fallback.style.display = 'none';
                console.log('🎬 Vidéo affichée');
            }
        },
        
        // Afficher le fallback
        showFallback: function(video, fallback) {
            if (video && fallback) {
                video.style.display = 'none';
                fallback.style.display = 'block';
                fallback.style.opacity = '1';
                console.log('🎨 Fallback affiché');
            }
        },
        
        // Vérifier la compatibilité du navigateur
        checkBrowserCompatibility: function() {
            console.log('🌐 Vérification de la compatibilité navigateur...');
            
            var userAgent = navigator.userAgent;
            var vendor = navigator.vendor;
            
            // Détection du navigateur
            var browser = 'Inconnu';
            if (userAgent.indexOf('Chrome') !== -1 && vendor.indexOf('Google') !== -1) {
                browser = 'Chrome';
            } else if (userAgent.indexOf('Firefox') !== -1) {
                browser = 'Firefox';
            } else if (userAgent.indexOf('Safari') !== -1 && vendor.indexOf('Apple') !== -1) {
                browser = 'Safari';
            } else if (userAgent.indexOf('Edge') !== -1) {
                browser = 'Edge';
            } else if (userAgent.indexOf('Opera') !== -1 || userAgent.indexOf('OPR') !== -1) {
                browser = 'Opera';
            } else if (userAgent.indexOf('MSIE') !== -1 || userAgent.indexOf('Trident') !== -1) {
                browser = 'Internet Explorer';
            }
            
            console.log('🌍 Navigateur détecté:', browser);
            
            // Vérifier les capacités vidéo
            var videoElement = document.createElement('video');
            var canPlayMP4 = videoElement.canPlayType('video/mp4');
            var canPlayWebM = videoElement.canPlayType('video/webm');
            
            console.log('📹 Support MP4:', canPlayMP4);
            console.log('📹 Support WebM:', canPlayWebM);
            
            // Vérifier les capacités CSS
            var testElement = document.createElement('div');
            testElement.style.backdropFilter = 'blur(10px)';
            var hasBackdropFilter = testElement.style.backdropFilter !== '';
            
            console.log('🎨 Support backdrop-filter:', hasBackdropFilter ? '✅' : '❌');
        },
        
        // Configuration de la gestion d'erreur
        setupErrorHandling: function() {
            // Gestionnaire d'erreurs global
            window.addEventListener('error', function(event) {
                console.error('❌ Erreur JavaScript:', event.error);
                this.reportError('JavaScript Error', event.error);
            }.bind(this));
            
            // Gestionnaire pour les erreurs de ressources
            window.addEventListener('error', function(event) {
                if (event.target && event.target.tagName) {
                    var tagName = event.target.tagName.toLowerCase();
                    if (tagName === 'video') {
                        console.error('❌ Erreur vidéo:', event.target.src);
                        this.handleVideoError(event.target, document.querySelector('.background-fallback'));
                    }
                }
            }.bind(this), true);
            
            // Gestionnaire pour les promesses rejetées
            window.addEventListener('unhandledrejection', function(event) {
                console.error('❌ Promesse rejetée:', event.reason);
                this.reportError('Unhandled Promise Rejection', event.reason);
            }.bind(this));
        },
        
        // Rapport d'erreur
        reportError: function(type, error) {
            // Enregistrer l'erreur pour diagnostic
            console.log('📊 Erreur rapportée:', type, error);
            
            // Optionnel : envoyer à un service de monitoring
            // this.sendToMonitoring(type, error);
        },
        
        // Log des diagnostics
        logDiagnostics: function() {
            console.log('🔍 Diagnostics d\'affichage:');
            console.log('  - Viewport:', window.innerWidth, 'x', window.innerHeight);
            console.log('  - Device Pixel Ratio:', window.devicePixelRatio);
            console.log('  - User Agent:', navigator.userAgent);
            console.log('  - Online:', navigator.onLine);
            
            if ('connection' in navigator) {
                console.log('  - Connection Type:', navigator.connection.effectiveType);
            }
            
            // Vérifier les éléments critiques
            var criticalElements = [
                '.background',
                '.background-video',
                '.video-overlay',
                '.background-fallback',
                '.navbar',
                '.main-content'
            ];
            
            criticalElements.forEach(function(selector) {
                var element = document.querySelector(selector);
                console.log('  -', selector, ':', element ? '✅ Trouvé' : '❌ Manquant');
            });
        },
        
        // Méthode pour forcer la réparation
        forceRepair: function() {
            console.log('🔧 Réparation forcée en cours...');
            
            // Recharger la vidéo
            var video = document.querySelector('.background-video');
            if (video) {
                video.load();
                video.play().catch(function(error) {
                    console.log('Lecture vidéo différée (normal)');
                });
            }
            
            // Vérifier les styles
            var background = document.querySelector('.background');
            if (background) {
                background.style.position = 'fixed';
                background.style.top = '0';
                background.style.left = '0';
                background.style.width = '100%';
                background.style.height = '100%';
                background.style.zIndex = '-1';
            }
            
            console.log('✅ Réparation terminée');
        }
    };

// Initialisation automatique
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            DebugDisplay.init();
        });
    } else {
        DebugDisplay.init();
    }
    
    // Exposition globale pour debug
    window.DebugDisplay = DebugDisplay;
    
    console.log('🔍 Système de diagnostic d\'affichage initialisé');
})();
