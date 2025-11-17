// Compteur basé sur GitHub Issues + Actions - 100% autonome et partagé
(function() {
    'use strict';

    const CONFIG = {
        REPO_OWNER: 'MrAnilex',
        REPO_NAME: 'Utegraphium',
        ISSUE_NUMBER: 1, // ← CHANGE avec le vrai numéro de ton issue
        CACHE_KEY: 'gh_counter_cache',
        VISITOR_KEY: 'gh_visitor_id',
        VISITED_KEY: 'gh_visited_before',
        CACHE_DURATION: 2 * 60 * 1000, // 2 minutes de cache
    };

    class GitHubIssueCounter {
        constructor() {
            this.counters = {
                uniqueVisitors: 0,
                totalVisits: 0,
                visitsToday: 0,
                visitsThisWeek: 0
            };
            this.init();
        }

        async init() {
            console.log('📊 Initialisation du compteur GitHub Issues...');

            // 1. Charger depuis le cache local pour affichage instantané
            this.loadFromCache();
            this.updateDisplay();

            // 2. Enregistrer cette visite localement
            this.registerVisitLocally();

            // 3. Synchroniser avec GitHub (lecture de l'issue)
            await this.syncFromGitHub();

            // 4. Envoyer la visite à GitHub Actions
            await this.sendVisitToGitHub();

            // 5. Rafraîchir périodiquement depuis GitHub
            this.startPeriodicSync();

            console.log('✅ Compteur GitHub initialisé avec succès');
        }

        // ========== Cache Local ==========
        loadFromCache() {
            try {
                const cached = localStorage.getItem(CONFIG.CACHE_KEY);
                if (cached) {
                    const data = JSON.parse(cached);
                    const age = Date.now() - data.timestamp;
                    
                    if (age < CONFIG.CACHE_DURATION) {
                        this.counters = data.counters;
                        console.log('📦 Compteurs chargés depuis le cache');
                        return true;
                    }
                }
            } catch (error) {
                console.warn('Cache invalide:', error);
            }
            return false;
        }

        saveToCache() {
            try {
                localStorage.setItem(CONFIG.CACHE_KEY, JSON.stringify({
                    counters: this.counters,
                    timestamp: Date.now()
                }));
            } catch (error) {
                console.warn('Erreur sauvegarde cache:', error);
            }
        }

        // ========== Gestion Visiteur ==========
        getVisitorId() {
            let id = localStorage.getItem(CONFIG.VISITOR_KEY);
            
            if (!id) {
                // Créer un fingerprint simple mais efficace
                const fingerprint = [
                    navigator.userAgent,
                    navigator.language,
                    screen.width + 'x' + screen.height,
                    screen.colorDepth,
                    new Date().getTimezoneOffset()
                ].join('|');
                
                let hash = 0;
                for (let i = 0; i < fingerprint.length; i++) {
                    const char = fingerprint.charCodeAt(i);
                    hash = ((hash << 5) - hash) + char;
                    hash = hash & hash;
                }
                
                id = 'v' + Math.abs(hash).toString(36);
                localStorage.setItem(CONFIG.VISITOR_KEY, id);
                console.log('🆔 Nouveau visiteur créé:', id);
            }
            
            return id;
        }

        isNewVisitor() {
            return !localStorage.getItem(CONFIG.VISITED_KEY);
        }

        markAsVisited() {
            localStorage.setItem(CONFIG.VISITED_KEY, 'true');
        }

        registerVisitLocally() {
            const isNew = this.isNewVisitor();
            
            if (isNew) {
                this.counters.uniqueVisitors++;
                this.markAsVisited();
                console.log('👤 Nouveau visiteur unique détecté');
            }
            
            this.counters.totalVisits++;
            this.counters.visitsToday++;
            
            this.saveToCache();
            this.updateDisplay();
        }

        // ========== Synchronisation GitHub ==========
        async syncFromGitHub() {
            try {
                console.log('🔄 Synchronisation avec GitHub...');
                
                const url = `https://api.github.com/repos/${CONFIG.REPO_OWNER}/${CONFIG.REPO_NAME}/issues/${CONFIG.ISSUE_NUMBER}`;
                const response = await fetch(url, {
                    headers: {
                        'Accept': 'application/vnd.github.v3+json'
                    }
                });
                
                if (!response.ok) {
                    console.warn('Erreur API GitHub:', response.status);
                    return;
                }
                
                const issue = await response.json();
                const body = issue.body || '';
                
                // Extraire le JSON du corps de l'issue
                const match = body.match(/```json\s*\n([\s\S]*?)\n```/);
                
                if (match) {
                    const data = JSON.parse(match[1]);
                    
                    // Prendre les valeurs de GitHub (source de vérité)
                    this.counters = {
                        uniqueVisitors: data.uniqueVisitors || 0,
                        totalVisits: data.totalVisits || 0,
                        visitsToday: data.visitsToday || 0,
                        visitsThisWeek: data.visitsThisWeek || 0
                    };
                    
                    this.saveToCache();
                    this.updateDisplay();
                    
                    console.log('✅ Synchronisé avec GitHub:', this.counters);
                } else {
                    console.warn('Format JSON introuvable dans l\'issue');
                }
            } catch (error) {
                console.warn('Impossible de synchroniser avec GitHub:', error);
            }
        }

        async sendVisitToGitHub() {
            try {
                const isNew = this.isNewVisitor();
                const visitorId = this.getVisitorId();
                
                console.log('📤 Envoi de la visite à GitHub Actions...');
                
                const url = `https://api.github.com/repos/${CONFIG.REPO_OWNER}/${CONFIG.REPO_NAME}/dispatches`;
                
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/vnd.github.v3+json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        event_type: 'visit_recorded',
                        client_payload: {
                            isNewVisitor: isNew,
                            visitorId: visitorId,
                            timestamp: Date.now(),
                            userAgent: navigator.userAgent
                        }
                    })
                });
                
                if (response.ok || response.status === 204) {
                    console.log('✅ Visite envoyée à GitHub Actions');
                    
                    // Re-synchroniser après 3 secondes pour voir la mise à jour
                    setTimeout(() => this.syncFromGitHub(), 3000);
                } else {
                    console.warn('Erreur envoi visite:', response.status);
                }
            } catch (error) {
                console.warn('Impossible d\'envoyer la visite:', error);
            }
        }

        startPeriodicSync() {
            // Rafraîchir depuis GitHub toutes les 60 secondes
            setInterval(() => {
                this.syncFromGitHub();
            }, 60000);
            
            console.log('⏰ Synchronisation périodique activée (60s)');
        }

        // ========== Affichage ==========
        updateDisplay() {
            // Visiteurs uniques
            document.querySelectorAll('.visitor-count').forEach(el => {
                el.textContent = this.formatNumber(this.counters.uniqueVisitors);
                this.animateElement(el);
            });

            // Visites totales
            document.querySelectorAll('.total-visits-count').forEach(el => {
                el.textContent = this.formatNumber(this.counters.totalVisits);
                this.animateElement(el);
            });

            // Visites du jour
            document.querySelectorAll('.visits-today').forEach(el => {
                el.textContent = this.formatNumber(this.counters.visitsToday);
                this.animateElement(el);
            });

            // Visites de la semaine
            document.querySelectorAll('.visits-week').forEach(el => {
                el.textContent = this.formatNumber(this.counters.visitsThisWeek);
                this.animateElement(el);
            });
        }

        animateElement(element) {
            element.classList.add('updated');
            setTimeout(() => {
                element.classList.remove('updated');
            }, 300);
        }

        formatNumber(num) {
            if (typeof num !== 'number' || isNaN(num)) {
                return '0';
            }
            
            if (num >= 1000000) {
                return (num / 1000000).toFixed(1) + 'M';
            } else if (num >= 1000) {
                return (num / 1000).toFixed(1) + 'K';
            }
            
            return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
        }

        // ========== API Publique ==========
        getStats() {
            return { ...this.counters };
        }

        forceSync() {
            return this.syncFromGitHub();
        }

        resetLocalData() {
            localStorage.removeItem(CONFIG.CACHE_KEY);
            localStorage.removeItem(CONFIG.VISITOR_KEY);
            localStorage.removeItem(CONFIG.VISITED_KEY);
            console.log('🗑️ Données locales supprimées');
        }
    }

    // Initialisation globale
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.githubCounter = new GitHubIssueCounter();
        });
    } else {
        window.githubCounter = new GitHubIssueCounter();
    }

    // Exposer des fonctions utiles pour debug
    window.forceCounterSync = function() {
        if (window.githubCounter) {
            return window.githubCounter.forceSync();
        }
    };

    window.getCounterStats = function() {
        if (window.githubCounter) {
            return window.githubCounter.getStats();
        }
    };

})();