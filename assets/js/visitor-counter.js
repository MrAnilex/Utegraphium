// Système de comptage centralisé pour Utegraphium
(function() {
    'use strict';

    function VisitorCounter() {
        this.apiUrl = window.location.origin + '/api';
        this.initialized = false;
        this.counters = {
            uniqueVisitors: 0,
            totalVisits: 0,
            visitsToday: 0,
            visitsWeek: 0
        };

        this.init();
    }

    VisitorCounter.prototype.init = function() {
        var self = this;
        try {
            console.log('🔄 Initialisation du compteur centralisé...');

            this.loadCounters().then(function() {
                self.processVisit().then(function() {
                    self.updateDisplay();
                    self.setupPeriodicUpdate();
                    self.initialized = true;
                    console.log('✅ Compteur centralisé initialisé avec succès');
                }).catch(function(error) {
                    console.warn('Erreur lors du traitement de la visite:', error);
                    self.fallbackInit();
                });
            }).catch(function(error) {
                console.warn('Erreur lors du chargement des compteurs:', error);
                self.fallbackInit();
            });
        } catch (error) {
            console.warn('Erreur lors de l\'initialisation du compteur:', error);
            this.fallbackInit();
        }
    };

    // Méthode de récupération en cas d'erreur
    VisitorCounter.prototype.fallbackInit = function() {
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

    // Charger les compteurs depuis l'API
    VisitorCounter.prototype.loadCounters = function() {
        var self = this;
        return fetch(this.apiUrl + '/counters')
            .then(function(response) {
                if (!response.ok) {
                    throw new Error('HTTP error! status: ' + response.status);
                }
                return response.json();
            })
            .then(function(result) {
                if (result && result.success) {
                    self.counters = {
                        uniqueVisitors: result.data.uniqueVisitors || 0,
                        totalVisits: result.data.totalVisits || 0,
                        visitsToday: result.data.visitsToday || 0,
                        visitsWeek: result.data.visitsWeek || 0
                    };
                } else {
                    throw new Error((result && result.error) || 'Erreur lors du chargement');
                }
                console.log('📊 Compteurs chargés depuis le serveur:', self.counters);
            })
            .catch(function(error) {
                console.warn('Erreur lors du chargement des compteurs:', error);
                self.counters = {
                    uniqueVisitors: 0,
                    totalVisits: 0,
                    visitsToday: 0,
                    visitsWeek: 0
                };
                throw error;
            });
    };

    // Sauvegarder les compteurs vers l'API
    VisitorCounter.prototype.saveCounters = function() {
        var self = this;
        try {
            var visitorId = this.getVisitorId();
            var isNewVisitor = this.checkIfNewVisitor();

            return fetch(this.apiUrl + '/visit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    visitorId: visitorId,
                    isNewVisitor: isNewVisitor
                })
            })
                .then(function(response) {
                    if (!response.ok) {
                        throw new Error('HTTP error! status: ' + response.status);
                    }
                    return response.json();
                })
                .then(function(result) {
                    if (result && result.success) {
                        self.counters = {
                            uniqueVisitors: result.data.uniqueVisitors || 0,
                            totalVisits: result.data.totalVisits || 0,
                            visitsToday: result.data.visitsToday || 0,
                            visitsWeek: result.data.visitsWeek || 0
                        };
                        console.log('💾 Compteurs sauvegardés sur le serveur:', self.counters);
                    } else {
                        throw new Error((result && result.error) || 'Erreur lors de la sauvegarde');
                    }
                })
                .catch(function(error) {
                    console.warn('Erreur lors de la sauvegarde des compteurs:', error);
                    throw error;
                });
        } catch (error) {
            console.warn('Erreur lors de la sauvegarde des compteurs:', error);
            return Promise.reject(error);
        }
    };

    // Traiter une nouvelle visite
    VisitorCounter.prototype.processVisit = function() {
        var self = this;
        return this.saveCounters()
            .then(function() {
                console.log('👥 Visite traitée et synchronisée avec le serveur');
                self.updateDailyStats();
            })
            .catch(function(error) {
                console.error('Erreur lors du traitement de la visite:', error);
                throw error;
            });
    };

    // Vérifier si c'est un nouveau visiteur
    VisitorCounter.prototype.checkIfNewVisitor = function() {
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
    VisitorCounter.prototype.getVisitorId = function() {
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
    VisitorCounter.prototype.updateDailyStats = function() {
        try {
            var today = new Date().toDateString();
            var lastVisit = localStorage.getItem('utegraphium_last_visit_date');

            if (lastVisit !== today) {
                this.counters.visitsToday = 1;
                localStorage.setItem('utegraphium_last_visit_date', today);
            } else {
                this.counters.visitsToday++;
            }

            this.counters.visitsWeek = Math.min(this.counters.visitsWeek + 1, 999);
        } catch (error) {
            console.warn('Erreur lors de la mise à jour des statistiques:', error);
        }
    };

    // Mettre à jour l'affichage
    VisitorCounter.prototype.updateDisplay = function() {
        try {
            if (!document.querySelector('.visitor-count') && !document.querySelector('.total-visits-count')) {
                console.log('Éléments de compteur non trouvés, attente...');
                return;
            }

            var uniqueElements = document.querySelectorAll('.visitor-count');
            this.updateElements(uniqueElements, this.counters.uniqueVisitors);

            var totalElements = document.querySelectorAll('.total-visits-count');
            this.updateElements(totalElements, this.counters.totalVisits);

            this.updateDetailedStats();
        } catch (error) {
            console.warn('Erreur lors de la mise à jour de l\'affichage:', error);
        }
    };

    VisitorCounter.prototype.updateElements = function(elements, value) {
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
    VisitorCounter.prototype.updateDetailedStats = function() {
        try {
            this.updateStatElement('.visits-today', this.counters.visitsToday);
            this.updateStatElement('.visits-week', this.counters.visitsWeek);
        } catch (error) {
            console.warn('Erreur lors de la mise à jour des statistiques détaillées:', error);
        }
    };

    // Mettre à jour un élément de statistique
    VisitorCounter.prototype.updateStatElement = function(selector, value) {
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
            // Ignore silencieusement si l'élément n'existe pas
        }
    };

    // Formater le nombre avec des séparateurs
    VisitorCounter.prototype.formatNumber = function(num) {
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
    VisitorCounter.prototype.setupPeriodicUpdate = function() {
        var self = this;
        setInterval(function() {
            if (self.initialized) {
                self.refreshFromServer();
            }
        }, 30000);
    };

    VisitorCounter.prototype.refreshFromServer = function() {
        var self = this;
        this.loadCounters().then(function() {
            self.updateDisplay();
        }).catch(function(error) {
            console.warn('Impossible de rafraîchir les compteurs:', error);
        });
    };

    // Forcer une nouvelle visite (pour les tests)
    VisitorCounter.prototype.forceNewVisit = function() {
        var self = this;
        this.counters.totalVisits++;
        this.counters.visitsToday++;
        this.counters.visitsWeek++;

        return this.saveCounters()
            .then(function() {
                self.updateDisplay();
                console.log('📊 Visite forcée ajoutée - Nouveau total: ' + self.counters.totalVisits);
                return true;
            })
            .catch(function(error) {
                console.warn('Erreur lors de l\'ajout de la visite forcée:', error);
                return false;
            });
    };

    // Vérifier si le compteur est prêt
    VisitorCounter.prototype.isReady = function() {
        return this.initialized;
    };

    // Forcer une mise à jour
    VisitorCounter.prototype.forceUpdate = function() {
        this.refreshFromServer();
    };

    // Obtenir les statistiques actuelles
    VisitorCounter.prototype.getStats = function() {
        return {
            uniqueVisitors: this.counters.uniqueVisitors,
            totalVisits: this.counters.totalVisits,
            visitsToday: this.counters.visitsToday,
            visitsWeek: this.counters.visitsWeek
        };
    };

    var visitorCounter = null;

    function initializeVisitorCounter() {
        try {
            if (!visitorCounter) {
                visitorCounter = new VisitorCounter();
                window.visitorCounter = visitorCounter;
                console.log('👥 Compteur centralisé initialisé');
            }
        } catch (error) {
            console.error('Erreur lors de l\'initialisation du compteur:', error);
        }
    }

    function exposeVisitorForceVisit() {
        window.forceNewVisit = function() {
            if (window.visitorCounter && typeof window.visitorCounter.forceNewVisit === 'function') {
                return window.visitorCounter.forceNewVisit();
            }
            console.warn('Compteur non initialisé');
            return Promise.resolve(false);
        };
    }

    function onDomReady() {
        initializeVisitorCounter();
        exposeVisitorForceVisit();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(onDomReady, 500);
        });
    } else {
        setTimeout(onDomReady, 500);
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = VisitorCounter;
    }
})();
