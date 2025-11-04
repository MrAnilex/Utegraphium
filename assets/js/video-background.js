/**
 * Gestionnaire de vidéo de fond simplifié et robuste
 * Compatible avec tous les navigateurs
 */
(function() {
    'use strict';

    function VideoBackgroundManager() {
        this.video = null;
        this.fallback = null;
        this.init();
    }

    VideoBackgroundManager.prototype.init = function() {
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
    };

    VideoBackgroundManager.prototype.setupVideo = function() {
        var self = this;
        // Configuration de base de la vidéo
        this.video.muted = true;
        this.video.autoplay = true;
        this.video.playsInline = true;
        this.video.loop = true;
        this.video.preload = 'metadata';

        this.video.addEventListener('loadeddata', function() {
            console.log('✅ Vidéo chargée avec succès');
            self.video.classList.add('loaded');
            self.video.style.opacity = '1';
        });

        this.video.addEventListener('canplay', function() {
            console.log('✅ Vidéo prête à être lue');
            self.attemptPlay();
        });

        this.video.addEventListener('error', function(e) {
            console.warn('❌ Erreur vidéo:', e);
            self.handleVideoError();
        });

        this.video.addEventListener('loadstart', function() {
            console.log('🔄 Début du chargement vidéo');
        });

        setTimeout(function() {
            if (self.video.readyState === 0) {
                console.warn('⚠️ Vidéo non chargée après délai, utilisation du fallback');
                self.showFallback();
            }
        }, 3000);
    };

    VideoBackgroundManager.prototype.attemptPlay = function() {
        var playPromise = null;
        try {
            playPromise = this.video.play();
        } catch (error) {
            playPromise = undefined;
        }

        if (playPromise !== undefined) {
            var self = this;
            playPromise
                .then(function() {
                    console.log('✅ Lecture vidéo démarrée');
                })
                .catch(function(error) {
                    console.warn('❌ Impossible de démarrer la lecture:', error);
                    self.handlePlaybackError();
                });
        }
    };

    VideoBackgroundManager.prototype.handleVideoError = function() {
        console.warn('❌ Erreur de chargement vidéo, utilisation du fallback');
        this.showFallback();
    };

    VideoBackgroundManager.prototype.handlePlaybackError = function() {
        console.warn('❌ Erreur de lecture vidéo');

        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            this.setupMobilePlayback();
        } else {
            this.showFallback();
        }
    };

    VideoBackgroundManager.prototype.setupMobilePlayback = function() {
        var self = this;
        console.log('📱 Configuration de la lecture mobile');

        var playButton = document.createElement('button');
        playButton.textContent = '▶️ Lire la vidéo';
        playButton.style.cssText = '' +
            'position: fixed;' +
            'top: 50%;' +
            'left: 50%;' +
            'transform: translate(-50%, -50%);' +
            'background: rgba(255, 128, 0, 0.9);' +
            'color: white;' +
            'border: none;' +
            'padding: 1rem 2rem;' +
            'border-radius: 10px;' +
            'z-index: 10000;' +
            'cursor: pointer;' +
            'font-size: 1rem;';

        playButton.addEventListener('click', function() {
            var promise = null;
            try {
                promise = self.video.play();
            } catch (error) {
                promise = undefined;
            }

            if (promise && typeof promise.then === 'function') {
                promise.then(function() {
                    if (playButton.parentNode) {
                        playButton.parentNode.removeChild(playButton);
                    }
                    console.log('✅ Lecture mobile démarre');
                }).catch(function() {
                    self.showFallback();
                    if (playButton.parentNode) {
                        playButton.parentNode.removeChild(playButton);
                    }
                });
            } else {
                self.showFallback();
                if (playButton.parentNode) {
                    playButton.parentNode.removeChild(playButton);
                }
            }
        });

        document.body.appendChild(playButton);

        setTimeout(function() {
            if (playButton.parentNode) {
                playButton.parentNode.removeChild(playButton);
                self.showFallback();
            }
        }, 10000);
    };

    VideoBackgroundManager.prototype.setupFallbacks = function() {
        var video = document.createElement('video');
        var canPlayMP4 = '';
        var canPlayWebM = '';

        try {
            canPlayMP4 = video.canPlayType('video/mp4');
            canPlayWebM = video.canPlayType('video/webm');
        } catch (error) {
            canPlayMP4 = '';
            canPlayWebM = '';
        }

        console.log('🎬 Support vidéo - MP4: ' + canPlayMP4 + ', WebM: ' + canPlayWebM);

        if (!canPlayMP4 && !canPlayWebM) {
            console.log('⚠️ Aucun format vidéo supporté, utilisation du fallback');
            this.showFallback();
        }
    };

    VideoBackgroundManager.prototype.showFallback = function() {
        console.log('🎨 Affichage du fallback');

        if (this.video) {
            this.video.style.display = 'none';
        }

        if (this.fallback) {
            this.fallback.classList.add('show');
            this.fallback.style.opacity = '1';
        }
    };

    function initVideoManager() {
        try {
            window.videoBackgroundManager = new VideoBackgroundManager();
        } catch (error) {
            console.warn('Impossible d\'initialiser VideoBackgroundManager:', error);
            var fallback = document.querySelector('.background-fallback');
            if (fallback) {
                fallback.style.opacity = '1';
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initVideoManager);
    } else {
        initVideoManager();
    }

    window.VideoBackgroundManager = VideoBackgroundManager;
})();
