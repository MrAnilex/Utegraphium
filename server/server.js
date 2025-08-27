const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const COUNTERS_FILE = path.join(__dirname, 'counters.json');

// Middleware
app.use(cors());
app.use(express.json());

// Fonction pour lire les compteurs
async function readCounters() {
    try {
        const data = await fs.readFile(COUNTERS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // Si le fichier n'existe pas, créer des compteurs par défaut
        const defaultCounters = {
            uniqueVisitors: 0,
            totalVisits: 0,
            visitsToday: 0,
            visitsWeek: 0,
            lastUpdate: new Date().toISOString(),
            visitorIds: [],
            dailyStats: {}
        };
        await fs.writeFile(COUNTERS_FILE, JSON.stringify(defaultCounters, null, 2));
        return defaultCounters;
    }
}

// Fonction pour sauvegarder les compteurs
async function saveCounters(counters) {
    try {
        await fs.writeFile(COUNTERS_FILE, JSON.stringify(counters, null, 2));
        return true;
    } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        return false;
    }
}

// Route pour obtenir les compteurs
app.get('/api/counters', async (req, res) => {
    try {
        const counters = await readCounters();
        res.json({
            success: true,
            data: counters
        });
    } catch (error) {
        console.error('Erreur lors de la lecture des compteurs:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la lecture des compteurs'
        });
    }
});

// Route pour enregistrer une visite
app.post('/api/visit', async (req, res) => {
    try {
        const { visitorId, isNewVisitor } = req.body;
        const counters = await readCounters();
        
        // Incrémenter le compteur de visites totales
        counters.totalVisits++;
        
        // Si c'est un nouveau visiteur, incrémenter le compteur de visiteurs uniques
        if (isNewVisitor && visitorId) {
            if (!counters.visitorIds.includes(visitorId)) {
                counters.visitorIds.push(visitorId);
                counters.uniqueVisitors++;
            }
        }
        
        // Mettre à jour les statistiques quotidiennes
        const today = new Date().toISOString().split('T')[0];
        if (!counters.dailyStats[today]) {
            counters.dailyStats[today] = 0;
        }
        counters.dailyStats[today]++;
        counters.visitsToday = counters.dailyStats[today];
        
        // Calculer les visites de la semaine
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        let visitsThisWeek = 0;
        
        for (const [date, count] of Object.entries(counters.dailyStats)) {
            if (new Date(date) >= weekAgo) {
                visitsThisWeek += count;
            }
        }
        counters.visitsWeek = visitsThisWeek;
        
        // Mettre à jour la date de dernière modification
        counters.lastUpdate = new Date().toISOString();
        
        // Sauvegarder les changements
        await saveCounters(counters);
        
        res.json({
            success: true,
            data: {
                uniqueVisitors: counters.uniqueVisitors,
                totalVisits: counters.totalVisits,
                visitsToday: counters.visitsToday,
                visitsWeek: counters.visitsWeek
            }
        });
        
    } catch (error) {
        console.error('Erreur lors de l\'enregistrement de la visite:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de l\'enregistrement de la visite'
        });
    }
});



// Route pour obtenir les statistiques détaillées
app.get('/api/stats', async (req, res) => {
    try {
        const counters = await readCounters();
        
        // Calculer des statistiques supplémentaires
        const totalDays = Object.keys(counters.dailyStats).length;
        const averageVisitsPerDay = totalDays > 0 ? (counters.totalVisits / totalDays).toFixed(2) : 0;
        
        res.json({
            success: true,
            data: {
                ...counters,
                averageVisitsPerDay: parseFloat(averageVisitsPerDay),
                totalDays: totalDays
            }
        });
        
    } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération des statistiques'
        });
    }
});

// Route de santé
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Serveur de compteurs opérationnel',
        timestamp: new Date().toISOString()
    });
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`🚀 Serveur de compteurs démarré sur le port ${PORT}`);
    console.log(`📊 API disponible sur http://localhost:${PORT}/api`);
});

module.exports = app;
