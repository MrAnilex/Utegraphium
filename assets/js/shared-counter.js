// Système de compteurs partagés sans serveur pour Utegraphium
class SharedCounter {
    constructor() {
        this.initialized = false;
        this.counters = {
            uniqueVisitors: 0,
            totalVisits: 0,
            visitsToday: 0,
            visitsWeek: 0
        };
        
        this.init();
    }

    init() {
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
    }

    // Méthode de récupération en cas d'erreur
    fallbackInit() {
        try {
            setTimeout(() => {
                this.updateDisplay();
                this.initialized = true;
                console.log('⚠️ Compteur initialisé en mode fallback');
            }, 1000);
        } catch (error) {
            console.error('Échec de la récupération du compteur:', error);
        }
    }

    // Charger les compteurs depuis le localStorage
    loadCounters() {
        try {
            const stored = localStorage.getItem('utegraphium_shared_counters');
            if (stored) {
                const data = JSON.parse(stored);
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
    }

    // Sauvegarder les compteurs dans le localStorage
    saveCounters() {
        try {
            const data = {
                ...this.counters,
                lastUpdate: new Date().toISOString()
            };
            localStorage.setItem('utegraphium_shared_counters', JSON.stringify(data));
            console.log('💾 Compteurs sauvegardés:', this.counters);
        } catch (error) {
            console.warn('Erreur lors de la sauvegarde des compteurs:', error);
        }
    }

    // Traiter une nouvelle visite
    processVisit() {
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
            
            console.log(`👥 Visite traitée - Total: ${this.counters.totalVisits}, Uniques: ${this.counters.uniqueVisitors}`);
            
        } catch (error) {
            console.error('Erreur lors du traitement de la visite:', error);
        }
    }

    // Vérifier si c'est un nouveau visiteur
    checkIfNewVisitor() {
        try {
            const visitorId = this.getVisitorId();
            const storedVisitors = localStorage.getItem('utegraphium_known_visitors');
            const knownVisitors = storedVisitors ? JSON.parse(storedVisitors) : [];
            
            if (!knownVisitors.includes(visitorId)) {
                knownVisitors.push(visitorId);
                localStorage.setItem('utegraphium_known_visitors', JSON.stringify(knownVisitors));
                return true;
            }
            
            return false;
        } catch (error) {
            console.warn('Erreur lors de la vérification du visiteur:', error);
            return false;
        }
    }

    // Générer un identifiant unique pour le visiteur
    getVisitorId() {
        try {
            const data = navigator.userAgent + navigator.language + screen.width + screen.height;
            let hash = 0;
            for (let i = 0; i < data.length; i++) {
                const char = data.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash;
            }
            return Math.abs(hash).toString(36);
        } catch (error) {
            return 'visitor_' + Date.now();
        }
    }

    // Mettre à jour les statistiques quotidiennes
    updateDailyStats() {
        try {
            const today = new Date().toDateString();
            const lastVisit = localStorage.getItem('utegraphium_last_visit_date');
            
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
    }

    // Mettre à jour l'affichage
    updateDisplay() {
        try {
            // Vérifier si les éléments existent
            if (!document.querySelector('.visitor-count') && !document.querySelector('.total-visits-count')) {
                console.log('Éléments de compteur non trouvés, attente...');
                return;
            }

            // Mettre à jour le compteur de visiteurs uniques
            const uniqueElements = document.querySelectorAll('.visitor-count');
            uniqueElements.forEach(element => {
                element.textContent = this.formatNumber(this.counters.uniqueVisitors);
                element.classList.add('updated');
                setTimeout(() => element.classList.remove('updated'), 500);
            });
            
            // Mettre à jour le compteur de visites totales
            const totalElements = document.querySelectorAll('.total-visits-count');
            totalElements.forEach(element => {
                element.textContent = this.formatNumber(this.counters.totalVisits);
                element.classList.add('updated');
                setTimeout(() => element.classList.remove('updated'), 500);
            });
            
            // Mettre à jour les statistiques détaillées
            this.updateDetailedStats();
            
        } catch (error) {
            console.warn('Erreur lors de la mise à jour de l\'affichage:', error);
        }
    }

    // Mettre à jour les statistiques détaillées
    updateDetailedStats() {
        try {
            // Mettre à jour les visites aujourd'hui
            this.updateStatElement('.visits-today', this.counters.visitsToday);
            
            // Mettre à jour les visites cette semaine
            this.updateStatElement('.visits-week', this.counters.visitsWeek);
            
        } catch (error) {
            console.warn('Erreur lors de la mise à jour des statistiques détaillées:', error);
        }
    }

    // Mettre à jour un élément de statistique
    updateStatElement(selector, value) {
        try {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                element.textContent = this.formatNumber(value);
                element.classList.add('updated');
                setTimeout(() => element.classList.remove('updated'), 500);
            });
        } catch (error) {
            // Ignore silencieusement si l'élément n'existe pas
        }
    }

    // Formater le nombre avec des séparateurs
    formatNumber(num) {
        try {
            if (typeof num !== 'number' || isNaN(num)) {
                return '0';
            }
            
            if (num >= 1000000) {
                return (num / 1000000).toFixed(1) + 'M';
            } else if (num >= 1000) {
                return (num / 1000).toFixed(1) + 'K';
            } else {
                return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
            }
        } catch (error) {
            return num.toString();
        }
    }

    // Configurer la mise à jour périodique
    setupPeriodicUpdate() {
        // Mettre à jour l'affichage toutes les 30 secondes
        setInterval(() => {
            if (this.initialized) {
                this.updateDisplay();
            }
        }, 30000);
    }

    // Forcer une nouvelle visite (pour les tests)
    forceNewVisit() {
        try {
            this.counters.totalVisits++;
            this.counters.visitsToday++;
            this.counters.visitsWeek++;
            
            this.saveCounters();
            this.updateDisplay();
            
            console.log(`📊 Visite forcée ajoutée - Nouveau total: ${this.counters.totalVisits}`);
            return true;
            
        } catch (error) {
            console.warn('Erreur lors de l\'ajout de la visite forcée:', error);
            return false;
        }
    }

    // Vérifier si le compteur est prêt
    isReady() {
        return this.initialized;
    }

    // Forcer une mise à jour
    forceUpdate() {
        this.updateDisplay();
    }

    // Obtenir les statistiques actuelles
    getStats() {
        return { ...this.counters };
    }
}

// Initialisation du compteur partagé
let sharedCounter = null;

// Fonction d'initialisation
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

// Fonction globale pour forcer une nouvelle visite
async function forceNewVisit() {
    if (window.sharedCounter) {
        return await window.sharedCounter.forceNewVisit();
    } else {
        console.warn('Compteur non initialisé');
        return false;
    }
}

// Initialisation quand le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        initializeSharedCounter();
    }, 500);
});

// Export pour utilisation dans d'autres modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SharedCounter;
}
