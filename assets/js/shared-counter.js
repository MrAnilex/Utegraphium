// Système de compteurs partagés sans serveur pour Utegraphium
(function() {
    'use strict';

    function SharedCounter() {
        this.initialized = false;
        this.counters = {
            uniqueVisitors: 0,
            totalVisits: 0,
            visitsToday: 0,
            visitsWeek: 0
        };

        this.init();
    }

    SharedCounter.prototype.init = function() {
        try {
            console.log('🔄 Initialisation du compteur partagé...');

            // Charger les compteurs depuis le localStorage
            this.loadCounters();
            this.processVisit();
            this.updateDisplay();
            this.setupPeriodicUpdate();
            this.initialized = true;

            console.log('✅ Compteur partagé initialisé avec succès');
        } catch (error) {
            console.warn('Erreur lors de l\'initialisation du compteur:', error);
            this.fallbackInit();
        }
    };

    // Méthode de récupération en cas d'erreur
    SharedCounter.prototype.fallbackInit = function() {
        var self = this;
        try {
            setTimeout(function() {
                self.updateDisplay();
                self.initialized = true;
                console.log('⚠️ Compteur initialisé en mode fallback');
            }, 1000);
        } catch (error) {
            console.error('Échec de la récupération du compteur:', error);
        }
    };

    // Charger les compteurs depuis le localStorage
    SharedCounter.prototype.loadCounters = function() {
        try {
            var stored = localStorage.getItem('utegraphium_shared_counters');
            if (stored) {
                var data = JSON.parse(stored);
                this.counters = {
                    uniqueVisitors: data.uniqueVisitors || 0,
                    totalVisits: data.totalVisits || 0,
                    visitsToday: data.visitsToday || 0,
                    visitsWeek: data.visitsWeek || 0
                };
            }

            console.log('📊 Compteurs chargés:', this.counters);
        } catch (error) {
            console.warn('Erreur lors du chargement des compteurs:', error);
            this.counters = {
                uniqueVisitors: 0,
                totalVisits: 0,
                visitsToday: 0,
                visitsWeek: 0
            };
        }
    };

    // Sauvegarder les compteurs dans le localStorage
    SharedCounter.prototype.saveCounters = function() {
        try {
            var data = {
                uniqueVisitors: this.counters.uniqueVisitors,
                totalVisits: this.counters.totalVisits,
                visitsToday: this.counters.visitsToday,
                visitsWeek: this.counters.visitsWeek,
                lastUpdate: new Date().toISOString()
            };
            localStorage.setItem('utegraphium_shared_counters', JSON.stringify(data));
            console.log('💾 Compteurs sauvegardés:', this.counters);
        } catch (error) {
            console.warn('Erreur lors de la sauvegarde des compteurs:', error);
        }
    };

    // Traiter une nouvelle visite
    SharedCounter.prototype.processVisit = function() {
        try {
            // Incrémenter le compteur de visites totales
            this.counters.totalVisits++;

            // Vérifier si c'est un nouveau visiteur
            if (this.checkIfNewVisitor()) {
                this.counters.uniqueVisitors++;
            }

            // Mettre à jour les statistiques quotidiennes
            this.updateDailyStats();

            // Sauvegarder les changements
            this.saveCounters();

            console.log('👥 Visite traitée - Total: ' + this.counters.totalVisits + ', Uniques: ' + this.counters.uniqueVisitors);
        } catch (error) {
            console.error('Erreur lors du traitement de la visite:', error);
        }
    };

    // Vérifier si c'est un nouveau visiteur
    SharedCounter.prototype.checkIfNewVisitor = function() {
        try {
            var visitorId = this.getVisitorId();
            var storedVisitors = localStorage.getItem('utegraphium_known_visitors');
            var knownVisitors = storedVisitors ? JSON.parse(storedVisitors) : [];

            if (knownVisitors.indexOf(visitorId) === -1) {
                knownVisitors.push(visitorId);
                localStorage.setItem('utegraphium_known_visitors', JSON.stringify(knownVisitors));
                return true;
            }

            return false;
        } catch (error) {
            console.warn('Erreur lors de la vérification du visiteur:', error);
            return false;
        }
    };

    // Générer un identifiant unique pour le visiteur
    SharedCounter.prototype.getVisitorId = function() {
        try {
            var data = (navigator.userAgent || '') + (navigator.language || '') + (screen.width || 0) + (screen.height || 0);
            var hash = 0;
            for (var i = 0; i < data.length; i++) {
                var char = data.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash;
            }
            return Math.abs(hash).toString(36);
        } catch (error) {
            return 'visitor_' + new Date().getTime();
        }
    };

    // Mettre à jour les statistiques quotidiennes
    SharedCounter.prototype.updateDailyStats = function() {
        try {
            var today = new Date().toDateString();
            var lastVisit = localStorage.getItem('utegraphium_last_visit_date');

            if (lastVisit !== today) {
                // Nouveau jour, réinitialiser les compteurs quotidiens
                this.counters.visitsToday = 1;
                localStorage.setItem('utegraphium_last_visit_date', today);

                // Mettre à jour les visites de la semaine
                this.counters.visitsWeek = Math.min(this.counters.visitsWeek + 1, 999);
            } else {
                // Même jour, incrémenter
                this.counters.visitsToday++;
                this.counters.visitsWeek = Math.min(this.counters.visitsWeek + 1, 999);
            }
        } catch (error) {
            console.warn('Erreur lors de la mise à jour des statistiques:', error);
        }
    };

    // Mettre à jour l'affichage
    SharedCounter.prototype.updateDisplay = function() {
        try {
            // Vérifier si les éléments existent
            if (!document.querySelector('.visitor-count') && !document.querySelector('.total-visits-count')) {
                console.log('Éléments de compteur non trouvés, attente...');
                return;
            }

            // Mettre à jour le compteur de visiteurs uniques
            var uniqueElements = document.querySelectorAll('.visitor-count');
            this.updateElements(uniqueElements, this.counters.uniqueVisitors);

            // Mettre à jour le compteur de visites totales
            var totalElements = document.querySelectorAll('.total-visits-count');
            this.updateElements(totalElements, this.counters.totalVisits);

            // Mettre à jour les statistiques détaillées
            this.updateDetailedStats();
        } catch (error) {
            console.warn('Erreur lors de la mise à jour de l\'affichage:', error);
        }
    };

    SharedCounter.prototype.updateElements = function(elements, value) {
        if (!elements) {
            return;
        }

        for (var i = 0; i < elements.length; i++) {
            var element = elements[i];
            element.textContent = this.formatNumber(value);
            element.classList.add('updated');
            (function(el) {
                setTimeout(function() {
                    el.classList.remove('updated');
                }, 500);
            })(element);
        }
    };

    // Mettre à jour les statistiques détaillées
    SharedCounter.prototype.updateDetailedStats = function() {
        try {
            // Mettre à jour les visites aujourd'hui
            this.updateStatElement('.visits-today', this.counters.visitsToday);

            // Mettre à jour les visites cette semaine
            this.updateStatElement('.visits-week', this.counters.visitsWeek);
        } catch (error) {
            console.warn('Erreur lors de la mise à jour des statistiques détaillées:', error);
        }
    };

    // Mettre à jour un élément de statistique
    SharedCounter.prototype.updateStatElement = function(selector, value) {
        try {
            var elements = document.querySelectorAll(selector);
            if (!elements) {
                return;
            }

            for (var i = 0; i < elements.length; i++) {
                var element = elements[i];
                element.textContent = this.formatNumber(value);
                element.classList.add('updated');
                (function(el) {
                    setTimeout(function() {
                        el.classList.remove('updated');
                    }, 500);
                })(element);
            }
        } catch (error) {
            // Ignorer silencieusement si l'élément n'existe pas
        }
    };

    // Formater le nombre avec des séparateurs
    SharedCounter.prototype.formatNumber = function(num) {
        try {
            if (typeof num !== 'number' || isNaN(num)) {
                return '0';
            }

            if (num >= 1000000) {
                return (num / 1000000).toFixed(1) + 'M';
            } else if (num >= 1000) {
                return (num / 1000).toFixed(1) + 'K';
            } else {
                return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
            }
        } catch (error) {
            return num.toString();
        }
    };

    // Configurer la mise à jour périodique
    SharedCounter.prototype.setupPeriodicUpdate = function() {
        var self = this;
        setInterval(function() {
            if (self.initialized) {
                self.updateDisplay();
            }
        }, 30000);
    };

    // Forcer une nouvelle visite (pour les tests)
    SharedCounter.prototype.forceNewVisit = function() {
        try {
            this.counters.totalVisits++;
            this.counters.visitsToday++;
            this.counters.visitsWeek++;

            this.saveCounters();
            this.updateDisplay();

            console.log('📊 Visite forcée ajoutée - Nouveau total: ' + this.counters.totalVisits);
            return true;
        } catch (error) {
            console.warn('Erreur lors de l\'ajout de la visite forcée:', error);
            return false;
        }
    };

    // Vérifier si le compteur est prêt
    SharedCounter.prototype.isReady = function() {
        return this.initialized;
    };

    // Forcer une mise à jour
    SharedCounter.prototype.forceUpdate = function() {
        this.updateDisplay();
    };

    // Obtenir les statistiques actuelles
    SharedCounter.prototype.getStats = function() {
        return {
            uniqueVisitors: this.counters.uniqueVisitors,
            totalVisits: this.counters.totalVisits,
            visitsToday: this.counters.visitsToday,
            visitsWeek: this.counters.visitsWeek
        };
    };

    var sharedCounter = null;

    function initializeSharedCounter() {
        try {
            if (!sharedCounter) {
                sharedCounter = new SharedCounter();
                window.sharedCounter = sharedCounter;
                console.log('👥 Compteur partagé initialisé');
            }
        } catch (error) {
            console.error('Erreur lors de l\'initialisation du compteur:', error);
        }
    }

    function exposeForceNewVisit() {
        window.forceNewVisit = function() {
            if (window.sharedCounter && typeof window.sharedCounter.forceNewVisit === 'function') {
                return Promise.resolve(window.sharedCounter.forceNewVisit());
            }
            console.warn('Compteur non initialisé');
            return Promise.resolve(false);
        };
    }

    function onDomReady() {
        initializeSharedCounter();
        exposeForceNewVisit();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(onDomReady, 500);
        });
    } else {
        setTimeout(onDomReady, 500);
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = SharedCounter;
    }
})();
