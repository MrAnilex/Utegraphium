/**
 * Gestionnaire de vidéo de fond avec compatibilité universelle
 * Assure le fonctionnement sur tous les navigateurs avec fallbacks appropriés
 */

class VideoBackgroundManager {
    constructor() {
        this.video = null;
        this.fallback = null;
        this.isVideoSupported = this.checkVideoSupport();
        this.isAutoplaySupported = this.checkAutoplaySupport();
        this.init();
    }

    init() {
        console.log('🎬 Initialisation du gestionnaire de vidéo de fond...');
        
        this.video = document.querySelector('.background-video');
        this.fallback = document.querySelector('.background-fallback');
        
        if (!this.video) {
            console.warn('❌ Élément vidéo non trouvé');
            this.showFallback();
            return;
        }

        this.setupVideo();
        this.setupFallbacks();
        this.handleBrowserSpecificIssues();
    }

    checkVideoSupport() {
        const video = document.createElement('video');
        return !!(video.canPlayType && video.canPlayType('video/mp4').replace(/no/, ''));
    }

    checkAutoplaySupport() {
        // Vérifier si l'autoplay est supporté
        const video = document.createElement('video');
        video.muted = true;
        video.autoplay = true;
        video.playsInline = true;
        
        // Test sur différents navigateurs
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        const isIE = /MSIE|Trident/.test(navigator.userAgent);
        
        // Safari et IE ont des restrictions strictes
        if (isSafari || isIE) {
            return false;
        }
        
        // Mobile a des restrictions
        if (isMobile) {
            return false;
        }
        
        return true;
    }

    setupVideo() {
        if (!this.isVideoSupported) {
            console.log('⚠️ Support vidéo limité, utilisation du fallback');
            this.showFallback();
            return;
        }

        // Configuration de la vidéo
        this.video.muted = true;
        this.video.autoplay = this.isAutoplaySupported;
        this.video.playsInline = true;
        this.video.loop = true;
        this.video.preload = 'metadata';

        // Gestionnaires d'événements
        this.video.addEventListener('loadeddata', () => {
            console.log('✅ Vidéo chargée avec succès');
            this.video.classList.add('loaded');
            this.video.style.opacity = '1';
        });

        this.video.addEventListener('canplay', () => {
            console.log('✅ Vidéo prête à être lue');
            this.attemptPlay();
        });

        this.video.addEventListener('error', (e) => {
            console.warn('❌ Erreur vidéo:', e);
            this.handleVideoError();
        });

        this.video.addEventListener('stalled', () => {
            console.warn('⚠️ Vidéo en pause, tentative de reprise...');
            this.attemptPlay();
        });

        // Gestion des erreurs de format
        this.video.addEventListener('loadstart', () => {
            console.log('🔄 Début du chargement vidéo');
        });

        // Fallback si la vidéo ne se charge pas après un délai
        setTimeout(() => {
            if (this.video.readyState === 0) {
                console.warn('⚠️ Vidéo non chargée après délai, utilisation du fallback');
                this.showFallback();
            }
        }, 5000);
    }

    attemptPlay() {
        if (!this.isAutoplaySupported) {
            console.log('⚠️ Autoplay non supporté, tentative de lecture manuelle');
            return;
        }

        const playPromise = this.video.play();
        
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    console.log('✅ Lecture vidéo démarrée');
                })
                .catch((error) => {
                    console.warn('❌ Impossible de démarrer la lecture:', error);
                    this.handlePlaybackError();
                });
        }
    }

    handleVideoError() {
        console.warn('❌ Erreur de chargement vidéo, utilisation du fallback');
        this.showFallback();
        
        // Essayer de recharger avec un format différent
        this.tryAlternativeFormats();
    }

    handlePlaybackError() {
        console.warn('❌ Erreur de lecture vidéo');
        
        // Sur mobile, on peut essayer de démarrer la lecture après interaction utilisateur
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            this.setupMobilePlayback();
        } else {
            this.showFallback();
        }
    }

    setupMobilePlayback() {
        console.log('📱 Configuration de la lecture mobile');
        
        // Ajouter un bouton de lecture pour mobile
        const playButton = document.createElement('button');
        playButton.textContent = '▶️ Lire la vidéo';
        playButton.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 128, 0, 0.9);
            color: white;
            border: none;
            padding: 1rem 2rem;
            border-radius: 10px;
            z-index: 10000;
            cursor: pointer;
            font-size: 1rem;
        `;
        
        playButton.addEventListener('click', () => {
            this.video.play().then(() => {
                playButton.remove();
                console.log('✅ Lecture mobile démarrée');
            }).catch(() => {
                this.showFallback();
                playButton.remove();
            });
        });
        
        document.body.appendChild(playButton);
        
        // Supprimer le bouton après 10 secondes
        setTimeout(() => {
            if (playButton.parentNode) {
                playButton.remove();
                this.showFallback();
            }
        }, 10000);
    }

    tryAlternativeFormats() {
        console.log('🔄 Tentative avec des formats alternatifs...');
        
        // Vérifier les sources disponibles
        const sources = this.video.querySelectorAll('source');
        let currentSourceIndex = 0;
        
        const tryNextSource = () => {
            if (currentSourceIndex < sources.length) {
                const source = sources[currentSourceIndex];
                console.log(`🔄 Essai avec: ${source.src}`);
                
                this.video.src = source.src;
                this.video.load();
                
                currentSourceIndex++;
                
                // Attendre un peu avant d'essayer la prochaine source
                setTimeout(() => {
                    if (this.video.readyState === 0) {
                        tryNextSource();
                    }
                }, 2000);
            } else {
                console.warn('❌ Aucun format vidéo supporté');
                this.showFallback();
            }
        };
        
        tryNextSource();
    }

    setupFallbacks() {
        // Fallback CSS pour les navigateurs sans support vidéo
        if (!this.isVideoSupported) {
            this.showFallback();
            return;
        }

        // Fallback pour les navigateurs avec support limité
        if (!this.isAutoplaySupported) {
            console.log('⚠️ Autoplay non supporté, configuration du fallback');
            this.setupAutoplayFallback();
        }
    }

    setupAutoplayFallback() {
        // Créer un fallback qui s'affiche si la vidéo ne peut pas être lue
        const checkVideoPlayback = () => {
            if (this.video.paused && this.video.readyState >= 2) {
                console.log('⚠️ Vidéo en pause, affichage du fallback');
                this.showFallback();
            }
        };

        // Vérifier après 3 secondes
        setTimeout(checkVideoPlayback, 3000);
    }

    showFallback() {
        console.log('🎨 Affichage du fallback');
        
        if (this.video) {
            this.video.style.display = 'none';
        }
        
        if (this.fallback) {
            this.fallback.classList.add('show');
            this.fallback.style.opacity = '1';
        }
    }

    handleBrowserSpecificIssues() {
        const userAgent = navigator.userAgent;
        
        // Internet Explorer
        if (/MSIE|Trident/.test(userAgent)) {
            console.log('🌐 Détection IE, utilisation du fallback');
            this.showFallback();
        }
        
        // Safari
        if (/^((?!chrome|android).)*safari/i.test(userAgent)) {
            console.log('🍎 Détection Safari, configuration spéciale');
            this.setupSafariCompatibility();
        }
        
        // Firefox
        if (/Firefox/.test(userAgent)) {
            console.log('🦊 Détection Firefox, configuration spéciale');
            this.setupFirefoxCompatibility();
        }
        
        // Chrome/Edge
        if (/Chrome|Edge/.test(userAgent)) {
            console.log('🔵 Détection Chrome/Edge, configuration optimale');
            this.setupChromeCompatibility();
        }
    }

    setupSafariCompatibility() {
        // Safari a des restrictions strictes sur l'autoplay
        this.video.muted = true;
        this.video.playsInline = true;
        
        // Essayer de démarrer la lecture après un délai
        setTimeout(() => {
            if (this.video.paused) {
                this.video.play().catch(() => {
                    console.log('⚠️ Safari: Impossible de démarrer la lecture automatique');
                    this.showFallback();
                });
            }
        }, 1000);
    }

    setupFirefoxCompatibility() {
        // Firefox peut avoir des problèmes avec certains formats
        this.video.preload = 'metadata';
        
        // Vérifier le support des formats
        const canPlayWebM = this.video.canPlayType('video/webm');
        const canPlayMP4 = this.video.canPlayType('video/mp4');
        
        console.log(`🦊 Firefox - Support WebM: ${canPlayWebM}, Support MP4: ${canPlayMP4}`);
    }

    setupChromeCompatibility() {
        // Chrome a généralement le meilleur support
        this.video.preload = 'metadata';
        
        // Optimisations pour Chrome
        this.video.style.willChange = 'transform';
    }
}

// Initialisation automatique
document.addEventListener('DOMContentLoaded', () => {
    new VideoBackgroundManager();
});

// Fallback pour les navigateurs sans JavaScript
if (typeof VideoBackgroundManager === 'undefined') {
    console.warn('⚠️ JavaScript non supporté, utilisation du fallback CSS');
    const fallback = document.querySelector('.background-fallback');
    if (fallback) {
        fallback.style.opacity = '1';
    }
}
