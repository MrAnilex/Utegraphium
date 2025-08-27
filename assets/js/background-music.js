// Système de musique d'arrière-plan optimisé pour Utegraphium
class BackgroundMusic {
    constructor() {
        this.audio = null;
        this.isPlaying = false;
        this.volume = 0.3;
        this.initialized = false;
        this.init();
    }

    init() {
        // Délai d'initialisation pour éviter de bloquer le chargement de la page
        setTimeout(() => {
            try {
                this.createAudioElement();
                this.createMusicControls();
                this.loadUserPreferences();
                this.setupEventListeners();
                this.initialized = true;
            } catch (error) {
                console.warn('Musique non initialisée:', error);
            }
        }, 1000);
    }

    // Crée l'élément audio optimisé
    createAudioElement() {
        try {
            this.audio = new Audio();
            this.audio.src = 'assets/music/background-music.mp3';
            this.audio.loop = true;
            this.audio.volume = this.volume;
            this.audio.preload = 'none'; // Éviter le préchargement automatique
            
            // Gestion des erreurs simplifiée
            this.audio.addEventListener('error', () => {
                console.warn('Erreur audio - musique désactivée');
                this.disableMusic();
            });
            
            this.audio.addEventListener('canplay', () => {
                console.log('🎵 Audio prêt');
            });
        } catch (error) {
            console.warn('Audio non supporté:', error);
            this.disableMusic();
        }
    }

    // Désactive la musique en cas de problème
    disableMusic() {
        this.audio = null;
        this.isPlaying = false;
        const controls = document.querySelector('.music-controls');
        if (controls) {
            controls.style.display = 'none';
        }
    }

    // Crée les contrôles de musique simplifiés
    createMusicControls() {
        try {
            const controlsContainer = document.createElement('div');
            controlsContainer.className = 'music-controls';
            controlsContainer.innerHTML = `
                <div class="music-controls-panel">
                    <div class="volume-control">
                        <input type="range" class="volume-slider" min="0" max="100" value="${this.volume * 100}" title="Volume">
                        <span class="volume-icon">🔊</span>
                    </div>
                </div>
            `;

            const navbar = document.querySelector('.nav-container');
            if (navbar) {
                navbar.appendChild(controlsContainer);
            }
        } catch (error) {
            console.warn('Contrôles non créés:', error);
        }
    }

    // Charge les préférences utilisateur
    loadUserPreferences() {
        try {
            const savedVolume = localStorage.getItem('utegraphium_music_volume');
            
            if (savedVolume !== null) {
                this.volume = parseFloat(savedVolume);
                if (this.audio) {
                    this.audio.volume = this.volume;
                    this.updateVolumeSlider();
                }
            }
            
            // Tentative de lecture différée
            setTimeout(() => {
                this.attemptPlay();
            }, 2000);
        } catch (error) {
            console.warn('Préférences non chargées:', error);
        }
    }

    // Tentative de lecture simplifiée
    attemptPlay() {
        if (!this.audio || this.isPlaying) return;

        try {
            const playPromise = this.audio.play();
            
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    this.isPlaying = true;
                    console.log('🎵 Musique lancée !');
                }).catch(() => {
                    // Lecture automatique bloquée - normal sur mobile
                    this.setupUserInteractionPlay();
                });
            }
        } catch (error) {
            console.warn('Lecture échouée:', error);
            this.setupUserInteractionPlay();
        }
    }

    // Configure la lecture sur interaction utilisateur
    setupUserInteractionPlay() {
        const events = ['click', 'keydown', 'scroll'];
        
        const playOnInteraction = () => {
            if (!this.isPlaying && this.audio) {
                this.attemptPlay();
                // Nettoyer après utilisation
                events.forEach(event => {
                    document.removeEventListener(event, playOnInteraction);
                });
            }
        };
        
        events.forEach(event => {
            document.addEventListener(event, playOnInteraction, { once: true });
        });
    }

    // Configure les événements
    setupEventListeners() {
        try {
            const volumeSlider = document.querySelector('.volume-slider');
            
            if (volumeSlider) {
                volumeSlider.addEventListener('input', (e) => {
                    this.setVolume(e.target.value / 100);
                });
            }
        } catch (error) {
            console.warn('Événements non configurés:', error);
        }
    }

    // Définit le volume
    setVolume(volume) {
        try {
            this.volume = Math.max(0, Math.min(1, volume));
            
            if (this.audio) {
                this.audio.volume = this.volume;
            }
            
            this.updateVolumeSlider();
            localStorage.setItem('utegraphium_music_volume', this.volume.toString());
        } catch (error) {
            console.warn('Volume non défini:', error);
        }
    }

    // Met à jour le slider de volume
    updateVolumeSlider() {
        try {
            const volumeSlider = document.querySelector('.volume-slider');
            if (volumeSlider) {
                volumeSlider.value = this.volume * 100;
            }
        } catch (error) {
            console.warn('Slider non mis à jour:', error);
        }
    }

    // Méthode de nettoyage
    destroy() {
        try {
            if (this.audio) {
                this.audio.pause();
                this.audio.src = '';
                this.audio = null;
            }
            this.isPlaying = false;
        } catch (error) {
            console.warn('Nettoyage échoué:', error);
        }
    }
}

// Initialisation différée pour éviter de bloquer le chargement
let musicInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    // Délai pour prioriser le chargement de la page
    setTimeout(() => {
        try {
            musicInstance = new BackgroundMusic();
        } catch (error) {
            console.warn('Musique non initialisée:', error);
        }
    }, 1500);
});

// Nettoyage lors de la fermeture
window.addEventListener('beforeunload', () => {
    if (musicInstance) {
        musicInstance.destroy();
    }
});
