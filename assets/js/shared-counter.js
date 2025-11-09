// Compteur de visites partagé via CounterAPI
(function() {
    'use strict';

    var STORAGE_KEY = 'utegraphium_has_visited';

    function getConfig() {
        var defaults = {
            mode: 'proxy',
            proxyBaseUrl: '',
            baseUrl: 'https://counterapi.dev',
            namespace: '',
            totalKey: '',
            uniqueKey: '',
            token: '',
            authHeader: 'Authorization'
        };

        if (typeof window !== 'undefined' && window.CounterApiConfig && typeof window.CounterApiConfig === 'object') {
            return Object.assign({}, defaults, window.CounterApiConfig);
        }

        return defaults;
    }

    function SharedCounter() {
        this.config = getConfig();
        this.state = {
        this.config = this.resolveConfig();
        this.initialized = false;
        this.counters = {
            uniqueVisitors: 0,
            totalVisits: 0,
            uniqueVisitors: 0
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
        var _this = this;

        try {
            this.ensureConfig();
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
            console.error('[shared-counter] Configuration invalide:', error.message);
            return;
        }

        this.updateFromApi().then(function() {
            _this.render();
            window.sharedCounter = _this;
        }).catch(function(error) {
            console.error('[shared-counter] Échec de la mise à jour des compteurs:', error);
        });
    };

    SharedCounter.prototype.ensureConfig = function() {
        if (!this.config.totalKey) {
            throw new Error('totalKey manquant dans CounterApiConfig');
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

        if (this.usingProxy()) {
            if (!this.config.proxyBaseUrl) {
                throw new Error('proxyBaseUrl manquant pour le mode proxy');
            }
        } else {
            if (!this.config.namespace) {
                throw new Error('namespace manquant pour l\'usage direct');
            }
            if (!this.config.token) {
                throw new Error('token requis pour l\'usage direct');
            }
        }
    };

    SharedCounter.prototype.usingProxy = function() {
        if (typeof this.config.mode === 'string') {
            return this.config.mode.toLowerCase() === 'proxy';
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
        return Boolean(this.config.proxyBaseUrl);
    };

    SharedCounter.prototype.updateFromApi = function() {
        var _this = this;
        var isNewVisitor = this.isNewVisitor();

        var totalPromise = this.incrementCounter(this.config.totalKey).catch(function(error) {
            console.error('[shared-counter] Impossible d\'incrémenter le total:', error);
            return _this.state.totalVisits + 1;
        });

        var uniquePromise;
        if (this.config.uniqueKey) {
            if (isNewVisitor) {
                uniquePromise = this.incrementCounter(this.config.uniqueKey).catch(function(error) {
                    console.error('[shared-counter] Impossible d\'incrémenter les uniques:', error);
                    return _this.state.uniqueVisitors + 1;
                });
            } else {
                uniquePromise = this.fetchCounter(this.config.uniqueKey).catch(function(error) {
                    console.error('[shared-counter] Impossible de récupérer les uniques:', error);
                    return _this.state.uniqueVisitors;
                });
            }
        } else {
            uniquePromise = Promise.resolve(null);
        }

        return Promise.all([totalPromise, uniquePromise]).then(function(values) {
            var total = values[0];
            var unique = values[1];

            _this.state.totalVisits = sanitizeNumber(total, _this.state.totalVisits);
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

            if (_this.config.uniqueKey) {
                _this.state.uniqueVisitors = sanitizeNumber(unique, _this.state.uniqueVisitors);
            } else {
                _this.state.uniqueVisitors = _this.state.totalVisits;
            }
        });
    };

    SharedCounter.prototype.fetchCounter = function(counterKey) {
        return this.request('get', counterKey);
    };

    SharedCounter.prototype.incrementCounter = function(counterKey) {
        return this.request('increment', counterKey, { amount: 1 });
    };

    SharedCounter.prototype.request = function(action, counterKey, body) {
        var url = this.buildUrl(counterKey, action);
        var options = {
            method: action === 'increment' ? 'POST' : 'GET',
            headers: this.buildHeaders(action === 'increment')
        };

        if (body && options.method === 'POST') {
            options.body = JSON.stringify(body);
        }

        return fetch(url, options).then(function(response) {
            if (response.status === 404) {
                return action === 'increment' ? 1 : 0;
            }

            if (!response.ok) {
                throw new Error('Requête CounterAPI échouée (' + response.status + ')');
            }

            return response.json();
        }).then(function(payload) {
            return extractValue(payload);
        });
    };

    SharedCounter.prototype.buildUrl = function(counterKey, action) {
        var key = encodeURIComponent(counterKey);

        if (this.usingProxy()) {
            var proxy = (this.config.proxyBaseUrl || '').replace(/\/+$/, '');
            return proxy + '/counter/' + key + (action === 'increment' ? '/increment' : '');
        }

        var base = (this.config.baseUrl || '').replace(/\/+$/, '');
        var namespace = encodeURIComponent(this.config.namespace || '');
        var path = '/api/v1/counter/' + namespace + '/' + key;
        return base + path + (action === 'increment' ? '/increment' : '');
    };

    SharedCounter.prototype.buildHeaders = function(hasBody) {
        var headers = {};

        if (hasBody) {
            headers['Content-Type'] = 'application/json';
        }

        if (!this.usingProxy() && this.config.token) {
            headers[this.config.authHeader || 'Authorization'] = this.config.token;
        }

        return headers;
    };

    SharedCounter.prototype.isNewVisitor = function() {
        try {
            if (localStorage.getItem(STORAGE_KEY)) {
                return false;
            }
            localStorage.setItem(STORAGE_KEY, '1');
            return true;
        } catch (error) {
            console.warn('[shared-counter] localStorage indisponible, comptage approximatif:', error);
            return false;
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

    SharedCounter.prototype.render = function() {
        updateElements('.total-visits-count', this.state.totalVisits);
        updateElements('.visitor-count', this.state.uniqueVisitors);
    };

    function updateElements(selector, value) {
        var nodes = document.querySelectorAll(selector);
        var displayValue = formatNumber(value);

        for (var i = 0; i < nodes.length; i++) {
            nodes[i].textContent = displayValue;
        }
    }

    function sanitizeNumber(value, fallback) {
        return typeof value === 'number' && isFinite(value) ? value : fallback;
    }

    function extractValue(payload) {
        if (typeof payload === 'number') {
            return payload;
        }

        if (payload && typeof payload.count === 'number') {
            return payload.count;
        }

        if (payload && payload.data && typeof payload.data.count === 'number') {
            return payload.data.count;
        }

        return 0;
    }

    function formatNumber(value) {
        var number = sanitizeNumber(value, 0);
        try {
            return number.toLocaleString('fr-FR');
        } catch (error) {
            return String(number);
        }
    }

    function onReady(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    onReady(function() {
        new SharedCounter();
    });
})();
