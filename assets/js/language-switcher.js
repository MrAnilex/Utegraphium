// Système de traduction automatique pour Utegraphium
(function() {
    'use strict';

    function LanguageSwitcher() {
        this.currentLanguage = 'en'; // Langue par défaut : anglais
        this.init();
    }

    LanguageSwitcher.prototype.init = function() {
        this.loadSavedLanguage();
        this.applyTranslations();
        this.addLanguageToggle();
        this.updatePageLanguage();
    };

    // Charge la langue sauvegardée
    LanguageSwitcher.prototype.loadSavedLanguage = function() {
        var savedLang = null;
        try {
            savedLang = localStorage.getItem('utegraphium_language');
        } catch (error) {
            savedLang = null;
        }

        if (savedLang && (savedLang === 'fr' || savedLang === 'en')) {
            this.currentLanguage = savedLang;
        } else {
            // Si aucune langue sauvegardée, détecte automatiquement
            this.detectLanguage();
        }
    };

    // Détecte la langue du navigateur
    LanguageSwitcher.prototype.detectLanguage = function() {
        var browserLang = navigator.language || navigator.userLanguage || 'en';
        var langCode = browserLang.split('-')[0];

        // Si la langue du navigateur est français, on passe en français
        if (langCode === 'fr') {
            this.currentLanguage = 'fr';
            console.log('🇫🇷 Langue française détectée, passage en français');
        } else {
            // Sinon, on garde l'anglais par défaut
            this.currentLanguage = 'en';
            console.log('🇬🇧 Langue anglaise par défaut');
        }

        try {
            localStorage.setItem('utegraphium_language', this.currentLanguage);
        } catch (error) {
            // Ignorer les erreurs de stockage
        }
    };

    // Applique les traductions
    LanguageSwitcher.prototype.applyTranslations = function() {
        var lang = this.currentLanguage;
        var t = translations[lang];

        if (!t) {
            console.warn('Traductions non trouvées pour:', lang);
            return;
        }

        // Navigation
        this.updateText('.nav-menu li:nth-child(1) .nav-link', t.nav_home);
        this.updateText('.nav-menu li:nth-child(2) .nav-link', t.nav_blog);
        this.updateText('.nav-menu li:nth-child(3) .nav-link', t.nav_about);
        this.updateText('.nav-menu li:nth-child(4) .nav-link', t.nav_contact);

        // Section héro
        this.updateText('.hero-title', t.hero_title);
        this.updateText('.hero-subtitle', t.hero_subtitle);
        this.updateText('.stat-item:nth-child(1) .stat-label', t.stats_visitors);
        this.updateText('.stat-item:nth-child(2) .stat-label', t.stats_pages);
        this.updateText('.stat-item:nth-child(3) .stat-label', t.stats_passion);

        // Section infos rapides
        this.updateText('.section-title', t.quick_facts_title);
        this.updateText('.fact-card:nth-child(1) p', t.fact_gaming);
        this.updateText('.fact-card:nth-child(2) p', t.fact_chaos);
        this.updateText('.fact-card:nth-child(3) p', t.fact_social);
        this.updateText('.fact-card:nth-child(4) p', t.fact_french);

        // Section statistiques
        this.updateText('.detailed-stats .section-title', t.stats_title);
        this.updateText('.stat-card:nth-child(1) h3', t.stats_unique_visitors);
        this.updateText('.stat-card:nth-child(2) h3', t.stats_total_visits);
        this.updateText('.stat-card:nth-child(3) h3', t.stats_today);
        this.updateText('.stat-card:nth-child(4) h3', t.stats_week);
        this.updateText('.stat-card:nth-child(1) p', t.stats_unique_desc);
        this.updateText('.stat-card:nth-child(2) p', t.stats_total_desc);
        this.updateText('.stat-card:nth-child(3) p', t.stats_today_desc);
        this.updateText('.stat-card:nth-child(4) p', t.stats_week_desc);

        // Footer
        this.updateText('.footer-section:first-child h3', t.footer_title);
        this.updateText('.footer-section:first-child p', t.footer_description);
        this.updateText('.footer-section:nth-child(2) h4', t.quick_links);
        this.updateText('.footer-section:nth-child(3) h4', t.follow_me);
        this.updateText('.footer-bottom p', t.copyright);

        // Liens du footer
        this.updateText('.footer-section:nth-child(2) ul li:nth-child(1) a', t.nav_home);
        this.updateText('.footer-section:nth-child(2) ul li:nth-child(2) a', t.nav_blog);
        this.updateText('.footer-section:nth-child(2) ul li:nth-child(3) a', t.nav_about);
        this.updateText('.footer-section:nth-child(2) ul li:nth-child(4) a', t.nav_contact);

        // Réseaux sociaux
        this.updateText('.social-links a:nth-child(1)', t.youtube);
        this.updateText('.social-links a:nth-child(2)', t.tiktok);
        this.updateText('.social-links a:nth-child(3)', t.instagram);
        this.updateText('.social-links a:nth-child(4)', t.github);

        // Met à jour l'attribut lang du HTML
        this.updatePageLanguage();
    };

    // Met à jour le texte d'un élément
    LanguageSwitcher.prototype.updateText = function(selector, text) {
        try {
            var element = document.querySelector(selector);
            if (element && text) {
                element.textContent = text;
            }
        } catch (error) {
            console.warn('Erreur lors de la mise à jour du texte:', selector, error);
        }
    };

    // Met à jour la langue de la page
    LanguageSwitcher.prototype.updatePageLanguage = function() {
        document.documentElement.lang = this.currentLanguage;
        // Le titre reste le même dans les deux langues
        document.title = 'UTEGRAPHIUM !!';
    };

    // Ajoute un bouton de changement de langue
    LanguageSwitcher.prototype.addLanguageToggle = function() {
        try {
            var navbar = document.querySelector('.nav-container');
            if (!navbar) {
                return;
            }

            // Vérifie si le bouton existe déjà
            var toggleBtn = document.querySelector('.language-toggle');
            var self = this;

            if (!toggleBtn) {
                // Crée le bouton seulement s'il n'existe pas
                toggleBtn = document.createElement('button');
                toggleBtn.className = 'language-toggle';
                toggleBtn.setAttribute('aria-label', 'Changer de langue');

                toggleBtn.addEventListener('click', function() {
                    self.toggleLanguage();
                });

                navbar.appendChild(toggleBtn);
            }

            // Met à jour le contenu du bouton sans le recréer
            this.updateToggleButton(toggleBtn);

        } catch (error) {
            console.warn('Erreur lors de la création du bouton de langue:', error);
        }
    };

    // Met à jour le contenu du bouton de langue
    LanguageSwitcher.prototype.updateToggleButton = function(button) {
        try {
            if (this.currentLanguage === 'fr') {
                button.innerHTML = '🇫🇷 FR';
                button.title = 'Switch to English';
                button.setAttribute('aria-label', 'Changer de langue');
            } else {
                button.innerHTML = '🇬🇧 EN';
                button.title = 'Passer en français';
                button.setAttribute('aria-label', 'Change language');
            }
        } catch (error) {
            console.warn('Erreur lors de la mise à jour du bouton de langue:', error);
        }
    };

    // Change la langue
    LanguageSwitcher.prototype.toggleLanguage = function() {
        try {
            this.currentLanguage = this.currentLanguage === 'fr' ? 'en' : 'fr';
            try {
                localStorage.setItem('utegraphium_language', this.currentLanguage);
            } catch (error) {
                // Ignorer les erreurs de stockage
            }

            this.applyTranslations();

            // Met à jour le bouton sans le recréer
            var toggleBtn = document.querySelector('.language-toggle');
            if (toggleBtn) {
                this.updateToggleButton(toggleBtn);
            }

            var body = document.body;
            if (body) {
                body.style.opacity = '0.8';
                setTimeout(function() {
                    body.style.opacity = '1';
                }, 150);
            }

            console.log('🌍 Langue changée vers:', this.currentLanguage);
        } catch (error) {
            console.error('Erreur lors du changement de langue:', error);
        }
    };

    // Obtient la langue actuelle
    LanguageSwitcher.prototype.getCurrentLanguage = function() {
        return this.currentLanguage;
    };

    // Obtient une traduction
    LanguageSwitcher.prototype.getText = function(key) {
        var lang = this.currentLanguage;
        return translations[lang] && translations[lang][key] ? translations[lang][key] : key;
    };

    // Réinitialise la langue et force la détection automatique
    LanguageSwitcher.prototype.resetLanguage = function() {
        try {
            localStorage.removeItem('utegraphium_language');
        } catch (error) {
            // Ignorer les erreurs de stockage
        }
        this.detectLanguage();
        this.applyTranslations();
        this.updatePageLanguage();

        var toggleBtn = document.querySelector('.language-toggle');
        if (toggleBtn) {
            this.updateToggleButton(toggleBtn);
        }

        console.log('🔄 Langue réinitialisée et détectée automatiquement:', this.currentLanguage);
    };

    var languageSwitcher = null;

    function initLanguageSwitcher() {
        try {
            languageSwitcher = new LanguageSwitcher();
            window.languageSwitcher = languageSwitcher;
            console.log('🌍 Système de langue initialisé');

            window.resetLanguage = function() {
                if (languageSwitcher) {
                    languageSwitcher.resetLanguage();
                }
            };

            console.log('💡 Commandes disponibles:');
            console.log('  - resetLanguage() : Réinitialise et détecte automatiquement la langue');
            console.log('  - languageSwitcher.getCurrentLanguage() : Affiche la langue actuelle');
        } catch (error) {
            console.error('Erreur lors de l\'initialisation du système de langue:', error);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLanguageSwitcher);
    } else {
        initLanguageSwitcher();
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = LanguageSwitcher;
    }
})();
