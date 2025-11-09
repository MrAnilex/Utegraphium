// Système de compteurs partagés sans serveur pour Utegraphium
(function() {
    'use strict';

    function SharedCounter() {
        this.config = this.resolveConfig();
        this.initialized = false;
        this.counters = {
            uniqueVisitors: 0,
            totalVisits: 0,
            visitsToday: 0,
            visitsWeek: 0
        };

        this.init();
    }

    SharedCounter.prototype.resolveConfig = function() {
        var defaults = {
            baseUrl: 'https://counterapi.dev',
            namespace: '',
            totalKey: '',
            uniqueKey: '',
            token: '',
            tokenPlacement: 'query',
            tokenQueryParameter: 'token',
            authHeader: 'Authorization',
            getPath: '/api/v1/counter/{namespace}/{key}',
            incrementPath: '/api/v1/counter/{namespace}/{key}/increment',
            incrementMethod: 'POST',
            refreshInterval: 60000,
            headers: {}
        };

        if (typeof window !== 'undefined' && window.CounterApiConfig && typeof window.CounterApiConfig === 'object') {
            return Object.assign({}, defaults, window.CounterApiConfig);
        }

        return defaults;
    };

    SharedCounter.prototype.validateConfig = function() {
        if (!this.config.namespace || !this.config.totalKey) {
            throw new Error('Configuration CounterAPI manquante: namespace et totalKey sont requis');
        }
    };

    SharedCounter.prototype.buildUrl = function(counterKey, action) {
        var pathTemplate = action === 'increment' ? this.config.incrementPath : this.config.getPath;
        var baseUrl = (this.config.baseUrl || '').replace(/\/+$/, '');
        var path = (pathTemplate || '').replace('{namespace}', encodeURIComponent(this.config.namespace || ''))
            .replace('{key}', encodeURIComponent(counterKey || ''));
        var url = baseUrl + path;

        if (this.config.token && this.config.tokenPlacement !== 'header') {
            url = this.appendQueryParameter(url, this.config.tokenQueryParameter || 'token', this.config.token);
        }

        return url;
    };

    SharedCounter.prototype.appendQueryParameter = function(url, key, value) {
        if (!value) {
            return url;
        }

        var separator = url.indexOf('?') === -1 ? '?' : '&';
        return url + separator + encodeURIComponent(key) + '=' + encodeURIComponent(value);
    };

    SharedCounter.prototype.buildHeaders = function(hasBody) {
        var headers = {};

        if (hasBody) {
            headers['Content-Type'] = 'application/json';
        }

        if (this.config.token && this.config.tokenPlacement === 'header') {
            headers[this.config.authHeader || 'Authorization'] = this.config.token;
        }

        if (this.config.headers && typeof this.config.headers === 'object') {
            for (var key in this.config.headers) {
                if (Object.prototype.hasOwnProperty.call(this.config.headers, key)) {
                    headers[key] = this.config.headers[key];
                }
            }
        }

        return headers;
    };

    SharedCounter.prototype.extractCounterValue = function(payload) {
        if (!payload) {
            return 0;
        }

        if (typeof payload.count === 'number') {
            return payload.count;
        }

        if (typeof payload.value === 'number') {
            return payload.value;
        }

        if (payload.data) {
            if (typeof payload.data.count === 'number') {
                return payload.data.count;
            }
            if (typeof payload.data.value === 'number') {
                return payload.data.value;
            }
        }

        return 0;
    };

    SharedCounter.prototype.fetchCounter = function(counterKey) {
        var url = this.buildUrl(counterKey, 'get');
        var headers = this.buildHeaders(false);
        var self = this;

        return fetch(url, {
            method: 'GET',
            headers: headers
        })
            .then(function(response) {
                if (response.status === 404) {
                    return 0;
                }

                if (!response.ok) {
                    throw new Error('CounterAPI GET ' + counterKey + ' → ' + response.status);
                }

                return response.json();
            })
            .then(function(payload) {
                if (typeof payload === 'number') {
                    return payload;
                }

                return self.extractCounterValue(payload);
            });
    };

    SharedCounter.prototype.incrementCounter = function(counterKey, amount) {
        var method = (this.config.incrementMethod || 'POST').toUpperCase();
        var hasBody = method !== 'GET';
        var url = this.buildUrl(counterKey, 'increment');

        if (!hasBody && typeof amount === 'number' && amount !== 1) {
            url = this.appendQueryParameter(url, 'amount', amount);
        }

        var options = {
            method: method,
            headers: this.buildHeaders(hasBody)
        };

        if (hasBody) {
            options.body = JSON.stringify({ amount: typeof amount === 'number' ? amount : 1 });
        }

        return fetch(url, options)
            .then(function(response) {
                if (response.status === 404) {
                    return {
                        count: typeof amount === 'number' ? amount : 1
                    };
                }

                if (!response.ok) {
                    throw new Error('CounterAPI increment ' + counterKey + ' → ' + response.status);
                }
                return response.json();
            })
            .then(this.extractCounterValue.bind(this));
    };

    SharedCounter.prototype.syncFromApi = function() {
        var self = this;
        this.validateConfig();

        var requests = [];

        requests.push(
            this.fetchCounter(this.config.totalKey).then(function(value) {
                if (typeof value === 'number') {
                    self.counters.totalVisits = value;
                }
            })
        );

        if (this.config.uniqueKey) {
            requests.push(
                this.fetchCounter(this.config.uniqueKey).then(function(value) {
                    if (typeof value === 'number') {
                        self.counters.uniqueVisitors = value;
                    }
                })
            );
        }

        return Promise.all(requests).then(function() {
            self.saveCounters();
        });
    };

    SharedCounter.prototype.refreshFromApi = function() {
        var self = this;
        return this.syncFromApi()
            .then(function() {
                self.updateDisplay();
            })
            .catch(function(error) {
                console.warn('Synchronisation CounterAPI échouée:', error);
            });
    };

    SharedCounter.prototype.init = function() {
        var self = this;

        try {
            console.log('🔄 Initialisation du compteur partagé...');

            this.loadCounters();

            this.syncFromApi()
                .catch(function(error) {
                    console.warn('Impossible de récupérer les compteurs distants, utilisation du cache local:', error);
                })
                .then(function() {
                    return self.processVisit();
                })
                .then(function() {
                    self.updateDisplay();
                    self.setupPeriodicUpdate();
                    self.initialized = true;
                    console.log('✅ Compteur partagé initialisé avec succès');
                })
                .catch(function(error) {
                    console.warn('Erreur lors de la synchronisation du compteur:', error);
                    self.fallbackInit();
                });
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
                console.warn('Vérifiez la configuration CounterApiConfig dans assets/js/counterapi-config.js');
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
                provider: 'counterapi.dev',
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
        var self = this;

        try {
            this.validateConfig();
            var isNewVisitor = this.checkIfNewVisitor();
            var operations = [];

            operations.push(
                this.incrementCounter(this.config.totalKey).then(function(value) {
                    if (typeof value === 'number') {
                        self.counters.totalVisits = value;
                    } else {
                        self.counters.totalVisits++;
                    }
                }).catch(function(error) {
                    console.warn('Erreur CounterAPI lors de l\'incrément du total:', error);
                    self.counters.totalVisits++;
                })
            );

            if (isNewVisitor) {
                if (this.config.uniqueKey) {
                    operations.push(
                        this.incrementCounter(this.config.uniqueKey).then(function(value) {
                            if (typeof value === 'number') {
                                self.counters.uniqueVisitors = value;
                            } else {
                                self.counters.uniqueVisitors++;
                            }
                        }).catch(function(error) {
                            console.warn('Erreur CounterAPI lors de l\'incrément des uniques:', error);
                            self.counters.uniqueVisitors++;
                        })
                    );
                } else {
                    self.counters.uniqueVisitors++;
                }
            }

            return Promise.all(operations).then(function() {
                self.updateDailyStats();
                self.saveCounters();
                console.log('👥 Visite traitée via CounterAPI - Total:', self.counters.totalVisits, 'Uniques:', self.counters.uniqueVisitors);
            });
        } catch (error) {
            console.error('Erreur lors du traitement de la visite:', error);
            return Promise.reject(error);
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
        var interval = parseInt(this.config.refreshInterval, 10) || 60000;

        setInterval(function() {
            if (self.initialized) {
                self.refreshFromApi();
            }
        }, interval);
    };

    // Forcer une nouvelle visite (pour les tests)
    SharedCounter.prototype.forceNewVisit = function() {
        var self = this;

        try {
            this.validateConfig();
            return Promise.all([
                this.incrementCounter(this.config.totalKey).catch(function(error) {
                    console.warn('Erreur CounterAPI lors du forçage du total:', error);
                    self.counters.totalVisits++;
                    return self.counters.totalVisits;
                }),
                this.config.uniqueKey ? this.incrementCounter(this.config.uniqueKey).catch(function(error) {
                    console.warn('Erreur CounterAPI lors du forçage des uniques:', error);
                    self.counters.uniqueVisitors++;
                    return self.counters.uniqueVisitors;
                }) : Promise.resolve(null)
            ]).then(function(results) {
                var totalValue = results[0];
                var uniqueValue = results[1];

                if (typeof totalValue === 'number') {
                    self.counters.totalVisits = totalValue;
                }

                if (uniqueValue !== null && typeof uniqueValue === 'number') {
                    self.counters.uniqueVisitors = uniqueValue;
                } else if (uniqueValue === null) {
                    self.counters.uniqueVisitors++;
                }

                self.updateDailyStats();
                self.saveCounters();
                self.updateDisplay();

                console.log('📊 Visite forcée ajoutée - Nouveau total: ' + self.counters.totalVisits);
                return true;
            }).catch(function(error) {
                console.warn('Erreur lors de l\'ajout de la visite forcée:', error);
                return false;
            });
        } catch (error) {
            console.warn('Erreur lors de l\'ajout de la visite forcée:', error);
            return Promise.resolve(false);
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
