/**
 * Polyfills pour compatibilité maximale avec tous les navigateurs
 * Compatible avec Internet Explorer 11+, Chrome, Firefox, Safari, Edge, Opera, Brave, etc.
 */

(function() {
    'use strict';
    
    // Polyfill pour Promise (IE 11 et navigateurs anciens)
    if (typeof Promise === 'undefined') {
        window.Promise = function(executor) {
            var self = this;
            var state = 'pending';
            var value = undefined;
            var reason = undefined;
            var onFulfilledCallbacks = [];
            var onRejectedCallbacks = [];
            
            function resolve(val) {
                if (state === 'pending') {
                    state = 'fulfilled';
                    value = val;
                    onFulfilledCallbacks.forEach(function(callback) {
                        callback(value);
                    });
                }
            }
            
            function reject(err) {
                if (state === 'pending') {
                    state = 'rejected';
                    reason = err;
                    onRejectedCallbacks.forEach(function(callback) {
                        callback(reason);
                    });
                }
            }
            
            try {
                executor(resolve, reject);
            } catch (e) {
                reject(e);
            }
            
            this.then = function(onFulfilled, onRejected) {
                onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : function(val) { return val; };
                onRejected = typeof onRejected === 'function' ? onRejected : function(err) { throw err; };
                
                return new Promise(function(resolve, reject) {
                    if (state === 'fulfilled') {
                        setTimeout(function() {
                            try {
                                var result = onFulfilled(value);
                                resolve(result);
                            } catch (e) {
                                reject(e);
                            }
                        }, 0);
                    } else if (state === 'rejected') {
                        setTimeout(function() {
                            try {
                                var result = onRejected(reason);
                                resolve(result);
                            } catch (e) {
                                reject(e);
                            }
                        }, 0);
                    } else {
                        onFulfilledCallbacks.push(function(value) {
                            setTimeout(function() {
                                try {
                                    var result = onFulfilled(value);
                                    resolve(result);
                                } catch (e) {
                                    reject(e);
                                }
                            }, 0);
                        });
                        onRejectedCallbacks.push(function(reason) {
                            setTimeout(function() {
                                try {
                                    var result = onRejected(reason);
                                    resolve(result);
                                } catch (e) {
                                    reject(e);
                                }
                            }, 0);
                        });
                    }
                });
            };
            
            this.catch = function(onRejected) {
                return this.then(undefined, onRejected);
            };
        };
        
        Promise.resolve = function(value) {
            return new Promise(function(resolve) {
                resolve(value);
            });
        };
        
        Promise.reject = function(reason) {
            return new Promise(function(resolve, reject) {
                reject(reason);
            });
        };
        
        Promise.all = function(promises) {
            return new Promise(function(resolve, reject) {
                var results = [];
                var completed = 0;
                
                if (promises.length === 0) {
                    resolve(results);
                    return;
                }
                
                promises.forEach(function(promise, index) {
                    Promise.resolve(promise).then(function(value) {
                        results[index] = value;
                        completed++;
                        if (completed === promises.length) {
                            resolve(results);
                        }
                    }).catch(reject);
                });
            });
        };
        
        console.log('✅ Polyfill Promise chargé');
    }
    
    // Polyfill pour fetch (IE 11 et navigateurs anciens)
    if (typeof fetch === 'undefined') {
        window.fetch = function(url, options) {
            options = options || {};
            
            return new Promise(function(resolve, reject) {
                var xhr = new XMLHttpRequest();
                
                xhr.open(options.method || 'GET', url);
                
                if (options.headers) {
                    Object.keys(options.headers).forEach(function(key) {
                        xhr.setRequestHeader(key, options.headers[key]);
                    });
                }
                
                xhr.onload = function() {
                    var response = {
                        ok: xhr.status >= 200 && xhr.status < 300,
                        status: xhr.status,
                        statusText: xhr.statusText,
                        headers: {
                            get: function(name) {
                                return xhr.getResponseHeader(name);
                            }
                        },
                        text: function() {
                            return Promise.resolve(xhr.responseText);
                        },
                        json: function() {
                            return Promise.resolve(JSON.parse(xhr.responseText));
                        },
                        clone: function() {
                            return response;
                        }
                    };
                    
                    if (response.ok) {
                        resolve(response);
                    } else {
                        reject(response);
                    }
                };
                
                xhr.onerror = function() {
                    reject(new Error('Network error'));
                };
                
                xhr.send(options.body);
            });
        };
        
        console.log('✅ Polyfill fetch chargé');
    }
    
    // Polyfill pour Array.prototype.forEach (IE 8 et navigateurs très anciens)
    if (!Array.prototype.forEach) {
        Array.prototype.forEach = function(callback, thisArg) {
            var T, k;
            if (this == null) {
                throw new TypeError('this is null or not defined');
            }
            var O = Object(this);
            var len = O.length >>> 0;
            if (typeof callback !== 'function') {
                throw new TypeError(callback + ' is not a function');
            }
            if (arguments.length > 1) {
                T = thisArg;
            }
            k = 0;
            while (k < len) {
                var kValue;
                if (k in O) {
                    kValue = O[k];
                    callback.call(T, kValue, k, O);
                }
                k++;
            }
        };
    }
    
    // Polyfill pour Array.prototype.map
    if (!Array.prototype.map) {
        Array.prototype.map = function(callback, thisArg) {
            var T, A, k;
            if (this == null) {
                throw new TypeError('this is null or not defined');
            }
            var O = Object(this);
            var len = O.length >>> 0;
            if (typeof callback !== 'function') {
                throw new TypeError(callback + ' is not a function');
            }
            if (arguments.length > 1) {
                T = thisArg;
            }
            A = new Array(len);
            k = 0;
            while (k < len) {
                var kValue, mappedValue;
                if (k in O) {
                    kValue = O[k];
                    mappedValue = callback.call(T, kValue, k, O);
                    A[k] = mappedValue;
                }
                k++;
            }
            return A;
        };
    }
    
    // Polyfill pour Array.prototype.filter
    if (!Array.prototype.filter) {
        Array.prototype.filter = function(callback, thisArg) {
            var T, k, result = [];
            if (this == null) {
                throw new TypeError('this is null or not defined');
            }
            var O = Object(this);
            var len = O.length >>> 0;
            if (typeof callback !== 'function') {
                throw new TypeError(callback + ' is not a function');
            }
            if (arguments.length > 1) {
                T = thisArg;
            }
            k = 0;
            while (k < len) {
                var kValue;
                if (k in O) {
                    kValue = O[k];
                    if (callback.call(T, kValue, k, O)) {
                        result.push(kValue);
                    }
                }
                k++;
            }
            return result;
        };
    }
    
    // Polyfill pour Object.assign (IE 11 et navigateurs anciens)
    if (typeof Object.assign !== 'function') {
        Object.assign = function(target) {
            if (target == null) {
                throw new TypeError('Cannot convert undefined or null to object');
            }
            
            var to = Object(target);
            
            for (var index = 1; index < arguments.length; index++) {
                var nextSource = arguments[index];
                
                if (nextSource != null) {
                    for (var nextKey in nextSource) {
                        if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                            to[nextKey] = nextSource[nextKey];
                        }
                    }
                }
            }
            return to;
        };
        
        console.log('✅ Polyfill Object.assign chargé');
    }
    
    // Polyfill pour String.prototype.includes
    if (!String.prototype.includes) {
        String.prototype.includes = function(search, start) {
            if (typeof start !== 'number') {
                start = 0;
            }
            
            if (start + search.length > this.length) {
                return false;
            } else {
                return this.indexOf(search, start) !== -1;
            }
        };
    }
    
    // Polyfill pour String.prototype.startsWith
    if (!String.prototype.startsWith) {
        String.prototype.startsWith = function(searchString, position) {
            position = position || 0;
            return this.substr(position, searchString.length) === searchString;
        };
    }
    
    // Polyfill pour String.prototype.endsWith
    if (!String.prototype.endsWith) {
        String.prototype.endsWith = function(searchString, length) {
            if (length === undefined || length > this.length) {
                length = this.length;
            }
            return this.substring(length - searchString.length, length) === searchString;
        };
    }
    
    // Polyfill pour Element.prototype.classList (IE 9 et navigateurs anciens)
    if (!('classList' in document.createElement('_'))) {
        (function(view) {
            if (!('Element' in view)) return;
            
            var classListProp = 'classList',
                protoProp = 'prototype',
                elemCtrProto = view.Element[protoProp],
                objCtr = Object,
                strTrim = String[protoProp].trim || function() {
                    return this.replace(/^\s+|\s+$/g, '');
                },
                arrIndexOf = Array[protoProp].indexOf || function(item) {
                    var i = 0, len = this.length;
                    for (; i < len; i++) {
                        if (i in this && this[i] === item) {
                            return i;
                        }
                    }
                    return -1;
                },
                DOMTokenList = function(el) {
                    this.el = el;
                    var classes = el.className.replace(/^\s+|\s+$/g, '').split(/\s+/);
                    for (var i = 0; i < classes.length; i++) {
                        this.push(classes[i]);
                    }
                    this._updateClassName = function() {
                        el.className = this.toString();
                    };
                },
                testEl = document.createElement('span');
            
            DOMTokenList[protoProp] = [];
            
            var classListGetter = function() {
                return new DOMTokenList(this);
            };
            
                if (objCtr.defineProperty) {
                var classListPropDesc = {
                    get: classListGetter,
                        enumerable: true,
                        configurable: true
                };
                try {
                    objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
                } catch (ex) {
                    if (ex.number === -0x7ff5ec54) {
                        classListPropDesc.enumerable = false;
                        objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
                    }
                }
            } else if (objCtr[protoProp].__defineGetter__) {
                elemCtrProto.__defineGetter__(classListProp, classListGetter);
            }
        })(window);
    }
    
    // Polyfill pour Element.prototype.matches (IE 9 et navigateurs anciens)
    if (!Element.prototype.matches) {
        Element.prototype.matches = Element.prototype.matchesSelector ||
                                   Element.prototype.mozMatchesSelector ||
                                   Element.prototype.msMatchesSelector ||
                                   Element.prototype.oMatchesSelector ||
                                   Element.prototype.webkitMatchesSelector ||
                                   function(s) {
                                       var matches = (this.document || this.ownerDocument).querySelectorAll(s),
                                           i = matches.length;
                                       while (--i >= 0 && matches.item(i) !== this) {}
                                       return i > -1;
                                   };
    }
    
    // Polyfill pour Element.prototype.closest (IE 11 et navigateurs anciens)
    if (!Element.prototype.closest) {
        Element.prototype.closest = function(s) {
            var el = this;
            do {
                if (el.matches(s)) return el;
                el = el.parentElement || el.parentNode;
            } while (el !== null && el.nodeType === 1);
            return null;
        };
    }
    
    // Polyfill pour NodeList.prototype.forEach (IE 11 et navigateurs anciens)
    if (window.NodeList && !NodeList.prototype.forEach) {
        NodeList.prototype.forEach = Array.prototype.forEach;
    }
    
    // Polyfill pour requestAnimationFrame (IE 9 et navigateurs anciens)
    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = (function() {
            return window.webkitRequestAnimationFrame ||
                   window.mozRequestAnimationFrame ||
                   window.oRequestAnimationFrame ||
                   window.msRequestAnimationFrame ||
                   function(callback, element) {
                       window.setTimeout(callback, 1000 / 60);
                   };
        })();
    }
    
    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = (function() {
            return window.webkitCancelAnimationFrame ||
                   window.mozCancelAnimationFrame ||
                   window.oCancelAnimationFrame ||
                   window.msCancelAnimationFrame ||
                   function(id) {
                       window.clearTimeout(id);
                   };
        })();
    }
    
    // Polyfill pour IntersectionObserver (IE 11 et navigateurs anciens)
    if (!window.IntersectionObserver) {
        window.IntersectionObserver = function(callback, options) {
            this.callback = callback;
            this.options = options || {};
            this.entries = [];
            this.targets = [];
            
            this.observe = function(target) {
                this.targets.push(target);
                this.checkIntersection();
            };
            
            this.unobserve = function(target) {
                var index = this.targets.indexOf(target);
                if (index > -1) {
                    this.targets.splice(index, 1);
                }
            };
            
            this.disconnect = function() {
                this.targets = [];
            };
            
            this.checkIntersection = function() {
                var self = this;
                this.targets.forEach(function(target) {
                    var rect = target.getBoundingClientRect();
                    var isIntersecting = rect.top < window.innerHeight && rect.bottom > 0;
                    
                    var entry = {
                        target: target,
                        isIntersecting: isIntersecting,
                        boundingClientRect: rect,
                        intersectionRatio: isIntersecting ? 1 : 0
                    };
                    
                    self.callback([entry], self);
                });
            };
            
            // Vérifier l'intersection au scroll
            window.addEventListener('scroll', function() {
                this.checkIntersection();
            }.bind(this));
            
            // Vérifier l'intersection au redimensionnement
            window.addEventListener('resize', function() {
                this.checkIntersection();
            }.bind(this));
        };
        
        console.log('✅ Polyfill IntersectionObserver chargé');
    }
    
    // Polyfill pour ResizeObserver (IE 11 et navigateurs anciens)
    if (!window.ResizeObserver) {
        window.ResizeObserver = function(callback) {
            this.callback = callback;
            this.targets = [];
            
            this.observe = function(target) {
                this.targets.push(target);
                this.checkResize();
            };
            
            this.unobserve = function(target) {
                var index = this.targets.indexOf(target);
                if (index > -1) {
                    this.targets.splice(index, 1);
                }
            };
            
            this.disconnect = function() {
                this.targets = [];
            };
            
            this.checkResize = function() {
                var self = this;
                this.targets.forEach(function(target) {
                    var rect = target.getBoundingClientRect();
                    var entry = {
                        target: target,
                        contentRect: rect
                    };
                    self.callback([entry], self);
                });
            };
            
            // Vérifier le redimensionnement
            window.addEventListener('resize', function() {
                this.checkResize();
            }.bind(this));
        };
        
        console.log('✅ Polyfill ResizeObserver chargé');
    }
    
    // Polyfill pour PerformanceObserver (IE 11 et navigateurs anciens)
    if (!window.PerformanceObserver) {
        window.PerformanceObserver = function(callback) {
            this.callback = callback;
            
            this.observe = function(options) {
                // Fallback simple pour les navigateurs sans PerformanceObserver
                console.log('PerformanceObserver non supporté, utilisation du fallback');
            };
            
            this.disconnect = function() {
                // Rien à faire pour le fallback
            };
        };
        
        console.log('✅ Polyfill PerformanceObserver chargé');
    }
    
    // Polyfill pour localStorage (IE 7 et navigateurs très anciens)
    if (typeof localStorage === 'undefined') {
        window.localStorage = {
            data: {},
            setItem: function(id, val) {
                this.data[id] = String(val);
            },
            getItem: function(id) {
                return this.data.hasOwnProperty(id) ? this.data[id] : null;
            },
            removeItem: function(id) {
                delete this.data[id];
            },
            clear: function() {
                this.data = {};
            }
        };
        
        console.log('✅ Polyfill localStorage chargé');
    }
    
    // Polyfill pour sessionStorage
    if (typeof sessionStorage === 'undefined') {
        window.sessionStorage = {
            data: {},
            setItem: function(id, val) {
                this.data[id] = String(val);
            },
            getItem: function(id) {
                return this.data.hasOwnProperty(id) ? this.data[id] : null;
            },
            removeItem: function(id) {
                delete this.data[id];
            },
            clear: function() {
                this.data = {};
            }
        };
        
        console.log('✅ Polyfill sessionStorage chargé');
    }
    
    // Polyfill pour addEventListener (IE 8 et navigateurs très anciens)
    if (!Element.prototype.addEventListener) {
        Element.prototype.addEventListener = function(type, listener, useCapture) {
            this.attachEvent('on' + type, listener);
        };
        
        Element.prototype.removeEventListener = function(type, listener, useCapture) {
            this.detachEvent('on' + type, listener);
        };
    }
    
    // Polyfill pour preventDefault et stopPropagation (IE 8 et navigateurs très anciens)
    if (!Event.prototype.preventDefault) {
        Event.prototype.preventDefault = function() {
            this.returnValue = false;
        };
        
        Event.prototype.stopPropagation = function() {
            this.cancelBubble = true;
        };
    }
    
    // Polyfill pour getComputedStyle (IE 8 et navigateurs très anciens)
    if (!window.getComputedStyle) {
        window.getComputedStyle = function(element, pseudo) {
            return element.currentStyle;
        };
    }
    
    // Polyfill pour querySelector et querySelectorAll (IE 7 et navigateurs très anciens)
    if (!document.querySelector) {
        document.querySelector = function(selector) {
            // Fallback simple pour les sélecteurs basiques
            if (selector.startsWith('#')) {
                return document.getElementById(selector.substring(1));
            }
            if (selector.startsWith('.')) {
                var elements = document.getElementsByTagName('*');
                for (var i = 0; i < elements.length; i++) {
                    if (elements[i].className.indexOf(selector.substring(1)) !== -1) {
                        return elements[i];
                    }
                }
            }
            return document.getElementsByTagName(selector)[0];
        };
    }
    
    if (!document.querySelectorAll) {
        document.querySelectorAll = function(selector) {
            // Fallback simple pour les sélecteurs basiques
            if (selector.startsWith('#')) {
                var element = document.getElementById(selector.substring(1));
                return element ? [element] : [];
            }
            if (selector.startsWith('.')) {
                var elements = document.getElementsByTagName('*');
                var result = [];
                for (var i = 0; i < elements.length; i++) {
                    if (elements[i].className.indexOf(selector.substring(1)) !== -1) {
                        result.push(elements[i]);
                    }
                }
                return result;
            }
            return Array.prototype.slice.call(document.getElementsByTagName(selector));
        };
    }
    
    console.log('🚀 Tous les polyfills chargés avec succès');
    
})();
