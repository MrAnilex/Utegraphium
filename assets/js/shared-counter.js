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
            totalVisits: 0,
            uniqueVisitors: 0
        };
        this.init();
    }

    SharedCounter.prototype.init = function() {
        var _this = this;

        try {
            this.ensureConfig();
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
