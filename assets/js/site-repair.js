// Script de diagnostic et réparation automatique pour Utegraphium
class SiteRepair {
    constructor() {
        this.issues = [];
        this.fixes = [];
        this.init();
    }

    init() {
        console.log('🔧 Démarrage du diagnostic du site...');
        
        // Attendre que le DOM soit complètement chargé
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(() => this.runDiagnostics(), 1000);
            });
        } else {
            setTimeout(() => this.runDiagnostics(), 1000);
        }
    }

    runDiagnostics() {
        console.log('🔍 Lancement des diagnostics...');
        
        this.checkVideoBackground();
        this.checkImages();
        this.checkCSS();
        this.checkJavaScript();
        this.checkResponsive();
        this.checkPerformance();
        
        this.applyFixes();
        this.generateReport();
    }

    checkVideoBackground() {
        console.log('🎬 Vérification du fond vidéo...');
        
        const video = document.querySelector('.background-video');
        if (!video) {
            this.issues.push('Vidéo de fond manquante');
            return;
        }

        // Vérifier si la vidéo se charge
        video.addEventListener('loadeddata', () => {
            console.log('✅ Vidéo chargée avec succès');
            video.classList.add('loaded');
        });

        video.addEventListener('error', () => {
            console.warn('❌ Erreur de chargement vidéo');
            this.issues.push('Erreur de chargement vidéo');
            this.showVideoFallback();
        });

        // Vérifier les propriétés CSS
        const videoStyle = window.getComputedStyle(video);
        if (videoStyle.transform === 'none') {
            this.fixes.push('Ajout du dézoom vidéo');
            video.style.transform = 'scale(1.2)';
            video.style.objectPosition = 'center center';
        }
    }

    showVideoFallback() {
        const background = document.querySelector('.background');
        if (background) {
            const fallback = document.createElement('div');
            fallback.className = 'video-fallback';
            fallback.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #ffb366 0%, #ff9933 50%, #ff8000 100%);
                z-index: -3;
                opacity: 0;
                transition: opacity 0.5s ease;
            `;
            background.appendChild(fallback);
            
            setTimeout(() => {
                fallback.style.opacity = '1';
            }, 100);
        }
    }

    checkImages() {
        console.log('🖼️ Vérification des images...');
        
        const images = document.querySelectorAll('img');
        images.forEach((img, index) => {
            // Ajouter des gestionnaires d'erreur
            img.addEventListener('error', () => {
                console.warn(`❌ Image ${index + 1} non chargée:`, img.src);
                this.issues.push(`Image non chargée: ${img.src}`);
                this.createImageFallback(img);
            });

            img.addEventListener('load', () => {
                console.log(`✅ Image ${index + 1} chargée:`, img.src);
            });

            // Vérifier les attributs de performance
            if (!img.hasAttribute('loading')) {
                img.setAttribute('loading', 'lazy');
            }
            if (!img.hasAttribute('decoding')) {
                img.setAttribute('decoding', 'async');
            }
        });
    }

    createImageFallback(img) {
        const parent = img.parentElement;
        if (parent) {
            const fallback = document.createElement('div');
            fallback.style.cssText = `
                width: ${img.width || 100}px;
                height: ${img.height || 100}px;
                background: linear-gradient(45deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.2));
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: rgba(255, 255, 255, 0.6);
                font-size: 0.8rem;
                text-align: center;
            `;
            fallback.textContent = 'Image non disponible';
            parent.appendChild(fallback);
        }
    }

    checkCSS() {
        console.log('🎨 Vérification du CSS...');
        
        // Vérifier les propriétés CSS critiques
        const body = document.body;
        const bodyStyle = window.getComputedStyle(body);
        
        if (bodyStyle.overflowX !== 'hidden') {
            this.fixes.push('Correction overflow horizontal');
            body.style.overflowX = 'hidden';
        }

        // Vérifier les z-index
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            const navbarStyle = window.getComputedStyle(navbar);
            if (parseInt(navbarStyle.zIndex) < 1000) {
                this.fixes.push('Correction z-index navbar');
                navbar.style.zIndex = '1000';
            }
        }

        // Vérifier les backdrop-filter
        const elementsWithBackdrop = document.querySelectorAll('.navbar, .hero-content, .fact-card, .newsletter-section, .footer');
        elementsWithBackdrop.forEach(element => {
            const style = window.getComputedStyle(element);
            if (!style.backdropFilter || style.backdropFilter === 'none') {
                // Ajouter un fallback
                const currentBg = style.backgroundColor;
                if (currentBg && currentBg !== 'rgba(0, 0, 0, 0)') {
                    element.style.backgroundColor = currentBg.replace('0.1', '0.25');
                }
            }
        });
    }

    checkJavaScript() {
        console.log('⚡ Vérification du JavaScript...');
        
        // Vérifier les erreurs globales
        window.addEventListener('error', (event) => {
            console.error('❌ Erreur JavaScript détectée:', event.error);
            this.issues.push(`Erreur JS: ${event.message}`);
        });

        window.addEventListener('unhandledrejection', (event) => {
            console.error('❌ Promesse rejetée:', event.reason);
            this.issues.push(`Promesse rejetée: ${event.reason}`);
        });

        // Vérifier les scripts
        const scripts = document.querySelectorAll('script[src]');
        scripts.forEach(script => {
            script.addEventListener('error', () => {
                console.warn('❌ Script non chargé:', script.src);
                this.issues.push(`Script non chargé: ${script.src}`);
            });
        });
    }

    checkResponsive() {
        console.log('📱 Vérification du responsive...');
        
        const viewport = document.querySelector('meta[name="viewport"]');
        if (!viewport) {
            this.issues.push('Meta viewport manquant');
            const meta = document.createElement('meta');
            meta.name = 'viewport';
            meta.content = 'width=device-width, initial-scale=1.0';
            document.head.appendChild(meta);
        }

        // Vérifier les éléments flexibles
        const flexElements = document.querySelectorAll('.nav-container, .hero-stats, .facts-grid, .newsletter-form');
        flexElements.forEach(element => {
            const style = window.getComputedStyle(element);
            if (style.display === 'flex' && !style.flexWrap) {
                element.style.flexWrap = 'wrap';
            }
        });
    }

    checkPerformance() {
        console.log('⚡ Vérification des performances...');
        
        // Vérifier les ressources lourdes
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            if (img.src && img.src.includes('.png') && img.width > 500) {
                console.warn('⚠️ Image PNG potentiellement lourde:', img.src);
            }
        });

        // Optimiser les animations sur mobile
        if (window.innerWidth <= 768) {
            this.fixes.push('Optimisation mobile');
            this.optimizeForMobile();
        }
    }

    optimizeForMobile() {
        // Réduire les animations sur mobile
        const style = document.createElement('style');
        style.textContent = `
            @media (max-width: 768px) {
                .fact-card:hover,
                .stat-card:hover,
                .nav-link:hover {
                    transform: none !important;
                }
                
                .background-video {
                    transform: scale(1.1) !important;
                }
            }
        `;
        document.head.appendChild(style);
    }

    applyFixes() {
        console.log('🔧 Application des corrections...');
        
        this.fixes.forEach(fix => {
            console.log(`✅ Correction appliquée: ${fix}`);
        });

        // Corrections automatiques supplémentaires
        this.autoFixCommonIssues();
    }

    autoFixCommonIssues() {
        // Corriger les problèmes de z-index
        const elements = document.querySelectorAll('.hero-section, .quick-facts, .newsletter-section');
        elements.forEach((element, index) => {
            element.style.zIndex = (1 + index).toString();
        });

        // Corriger les problèmes de focus
        const focusableElements = document.querySelectorAll('a, button, input, textarea');
        focusableElements.forEach(element => {
            if (!element.hasAttribute('tabindex')) {
                element.setAttribute('tabindex', '0');
            }
        });

        // Corriger les problèmes de contraste
        const textElements = document.querySelectorAll('p, span, h1, h2, h3');
        textElements.forEach(element => {
            const style = window.getComputedStyle(element);
            if (style.color === 'rgba(255, 255, 255, 0.8)' || style.color === 'rgba(255, 255, 255, 0.6)') {
                element.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.5)';
            }
        });
    }

    generateReport() {
        console.log('📊 Rapport de diagnostic:');
        console.log(`🔍 Problèmes détectés: ${this.issues.length}`);
        console.log(`🔧 Corrections appliquées: ${this.fixes.length}`);
        
        if (this.issues.length > 0) {
            console.log('❌ Problèmes:', this.issues);
        }
        
        if (this.fixes.length > 0) {
            console.log('✅ Corrections:', this.fixes);
        }

        // Afficher un message à l'utilisateur si nécessaire
        if (this.issues.length > 0) {
            this.showUserNotification();
        }
    }

    showUserNotification() {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(255, 128, 0, 0.9);
            color: white;
            padding: 1rem;
            border-radius: 10px;
            z-index: 10000;
            max-width: 300px;
            font-size: 0.9rem;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        `;
        notification.innerHTML = `
            <strong>🔧 Diagnostic terminé</strong><br>
            ${this.issues.length} problème(s) détecté(s)<br>
            ${this.fixes.length} correction(s) appliquée(s)
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 500);
        }, 5000);
    }
}

// Initialisation du système de réparation
let siteRepair = null;

function initializeSiteRepair() {
    try {
        if (!siteRepair) {
            siteRepair = new SiteRepair();
            window.siteRepair = siteRepair;
            console.log('🔧 Système de réparation initialisé');
        }
    } catch (error) {
        console.error('Erreur lors de l\'initialisation du système de réparation:', error);
    }
}

// Initialisation quand le DOM est prêt
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSiteRepair);
} else {
    initializeSiteRepair();
}

// Export pour utilisation dans d'autres modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SiteRepair;
}
