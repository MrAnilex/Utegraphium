/**
 * Gestionnaire de vidéo de fond simplifié et robuste
 * Compatible avec tous les navigateurs
 */

class VideoBackgroundManager {
    constructor() {
        this.video = null;
        this.fallback = null;
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
    }

    setupVideo() {
        // Configuration de base de la vidéo
        this.video.muted = true;
        this.video.autoplay = true;
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

        this.video.addEventListener('loadstart', () => {
            console.log('🔄 Début du chargement vidéo');
        });

        // Fallback si la vidéo ne se charge pas après un délai
        setTimeout(() => {
            if (this.video.readyState === 0) {
                console.warn('⚠️ Vidéo non chargée après délai, utilisation du fallback');
                this.showFallback();
            }
        }, 3000);
    }

    attemptPlay() {
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
    }

    handlePlaybackError() {
        console.warn('❌ Erreur de lecture vidéo');
        
        // Sur mobile, essayer de démarrer après interaction utilisateur
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

    setupFallbacks() {
        // Vérifier le support vidéo
        const video = document.createElement('video');
        const canPlayMP4 = video.canPlayType('video/mp4');
        const canPlayWebM = video.canPlayType('video/webm');
        
        console.log(`🎬 Support vidéo - MP4: ${canPlayMP4}, WebM: ${canPlayWebM}`);
        
        if (!canPlayMP4 && !canPlayWebM) {
            console.log('⚠️ Aucun format vidéo supporté, utilisation du fallback');
            this.showFallback();
        }
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
