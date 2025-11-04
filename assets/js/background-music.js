// Système de musique d'arrière-plan optimisé pour Utegraphium
(function() {
    'use strict';

    function BackgroundMusic() {
        this.audio = null;
        this.isPlaying = false;
        this.volume = 0.3;
        this.initialized = false;
        this.init();
    }

    BackgroundMusic.prototype.init = function() {
        var self = this;
        // Délai d'initialisation pour éviter de bloquer le chargement de la page
        setTimeout(function() {
            try {
                self.createAudioElement();
                self.createMusicControls();
                self.loadUserPreferences();
                self.setupEventListeners();
                self.initialized = true;
            } catch (error) {
                console.warn('Musique non initialisée:', error);
            }
        }, 1000);
    };

    // Crée l'élément audio optimisé
    BackgroundMusic.prototype.createAudioElement = function() {
        try {
            this.audio = new Audio();
            this.audio.src = 'assets/music/background-music.mp3';
            this.audio.loop = true;
            this.audio.volume = this.volume;
            this.audio.preload = 'none'; // Éviter le préchargement automatique

            var self = this;
            // Gestion des erreurs simplifiée
            this.audio.addEventListener('error', function() {
                console.warn('Erreur audio - musique désactivée');
                self.disableMusic();
            });

            this.audio.addEventListener('canplay', function() {
                console.log('🎵 Audio prêt');
            });
        } catch (error) {
            console.warn('Audio non supporté:', error);
            this.disableMusic();
        }
    };

    // Désactive la musique en cas de problème
    BackgroundMusic.prototype.disableMusic = function() {
        this.audio = null;
        this.isPlaying = false;
        var controls = document.querySelector('.music-controls');
        if (controls) {
            controls.style.display = 'none';
        }
    };

    // Crée les contrôles de musique simplifiés
    BackgroundMusic.prototype.createMusicControls = function() {
        try {
            var controlsContainer = document.createElement('div');
            controlsContainer.className = 'music-controls';
            controlsContainer.innerHTML = '' +
                '<div class="music-controls-panel">' +
                '    <div class="volume-control">' +
                '        <input type="range" class="volume-slider" min="0" max="100" value="' + (this.volume * 100) + '" title="Volume">' +
                '        <span class="volume-icon">🔊</span>' +
                '    </div>' +
                '</div>';

            var navbar = document.querySelector('.nav-container');
            if (navbar) {
                navbar.appendChild(controlsContainer);
            }
        } catch (error) {
            console.warn('Contrôles non créés:', error);
        }
    };

    // Charge les préférences utilisateur
    BackgroundMusic.prototype.loadUserPreferences = function() {
        try {
            var savedVolume = localStorage.getItem('utegraphium_music_volume');

            if (savedVolume !== null) {
                this.volume = parseFloat(savedVolume);
                if (this.audio) {
                    this.audio.volume = this.volume;
                    this.updateVolumeSlider();
                }
            }

            var self = this;
            // Tentative de lecture différée
            setTimeout(function() {
                self.attemptPlay();
            }, 2000);
        } catch (error) {
            console.warn('Préférences non chargées:', error);
        }
    };

    // Tentative de lecture simplifiée
    BackgroundMusic.prototype.attemptPlay = function() {
        if (!this.audio || this.isPlaying) {
            return;
        }

        try {
            var playPromise = this.audio.play();

            if (playPromise !== undefined) {
                var self = this;
                playPromise.then(function() {
                    self.isPlaying = true;
                    console.log('🎵 Musique lancée !');
                }).catch(function() {
                    // Lecture automatique bloquée - normal sur mobile
                    self.setupUserInteractionPlay();
                });
            }
        } catch (error) {
            console.warn('Lecture échouée:', error);
            this.setupUserInteractionPlay();
        }
    };

    // Configure la lecture sur interaction utilisateur
    BackgroundMusic.prototype.setupUserInteractionPlay = function() {
        var self = this;
        var events = ['click', 'keydown', 'scroll'];

        function playOnInteraction() {
            if (!self.isPlaying && self.audio) {
                self.attemptPlay();
            }

            for (var i = 0; i < events.length; i++) {
                document.removeEventListener(events[i], playOnInteraction, false);
            }
        }

        for (var i = 0; i < events.length; i++) {
            document.addEventListener(events[i], playOnInteraction, false);
        }
    };

    // Configure les événements
    BackgroundMusic.prototype.setupEventListeners = function() {
        try {
            var self = this;
            var volumeSlider = document.querySelector('.volume-slider');

            if (volumeSlider) {
                volumeSlider.addEventListener('input', function(e) {
                    var value = e.target && e.target.value ? e.target.value : volumeSlider.value;
                    self.setVolume(parseFloat(value) / 100);
                });
            }
        } catch (error) {
            console.warn('Événements non configurés:', error);
        }
    };

    // Définit le volume
    BackgroundMusic.prototype.setVolume = function(volume) {
        try {
            if (isNaN(volume)) {
                return;
            }

            this.volume = Math.max(0, Math.min(1, volume));

            if (this.audio) {
                this.audio.volume = this.volume;
            }

            this.updateVolumeSlider();
            localStorage.setItem('utegraphium_music_volume', this.volume.toString());
        } catch (error) {
            console.warn('Volume non défini:', error);
        }
    };

    // Met à jour le slider de volume
    BackgroundMusic.prototype.updateVolumeSlider = function() {
        try {
            var volumeSlider = document.querySelector('.volume-slider');
            if (volumeSlider) {
                volumeSlider.value = this.volume * 100;
            }
        } catch (error) {
            console.warn('Slider non mis à jour:', error);
        }
    };

    // Méthode de nettoyage
    BackgroundMusic.prototype.destroy = function() {
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
    };

    var musicInstance = null;

    function startMusic() {
        try {
            musicInstance = new BackgroundMusic();
        } catch (error) {
            console.warn('Musique non initialisée:', error);
        }
    }

    function initWhenReady() {
        setTimeout(startMusic, 1500);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWhenReady);
    } else {
        initWhenReady();
    }

    window.addEventListener('beforeunload', function() {
        if (musicInstance) {
            musicInstance.destroy();
        }
    });

    window.BackgroundMusic = BackgroundMusic;
})();
