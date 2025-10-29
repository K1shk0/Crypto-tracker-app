// --- Imports ---
const express = require('express');
const cors = require('cors');
// NYT: Importer 'dotenv' og kald config() for at indlæse .env filen
require('dotenv').config();
// NYT: Importer 'Pool' klassen fra 'pg' pakken
const { Pool } = require('pg');

// --- App Setup ---
const app = express();
const PORT = 3000;

// --- Middlewares ---
app.use(cors());
app.use(express.json());

// --- NYT: Database Forbindelse ---
// Opret en ny 'Pool' (en samling af databaseforbindelser)
// 'pg' pakken vil automatisk lede efter variablerne i .env filen
const pool = new Pool();

// --- Ruter ---
app.get('/', (req, res) => {
    res.send('APIen kører! Klar til at modtage requests.');
});

// --- NYT: Test-rute til databasen ---
// Vi laver en ny rute for at tjekke, om databasen svarer
app.get('/db-test', async (req, res) => {
    try {
        // Vi sender en simpel SQL-forespørgsel til databasen
        // RETTET: Sørg for at bruge dit tabelnavn "brugere"
        const result = await pool.query('SELECT * FROM public."brugere"');

        // Send de rækker (brugere) vi fandt tilbage som JSON
        res.json(result.rows);
    } catch (error) {
        console.error('Fejl ved databaseforespørgsel:', error);
        res.status(500).send('Databasefejl');
    }
});

// --- Start Serveren ---
app.listen(PORT, () => {
    console.log(`Server kører på http://localhost:${PORT}`);
});
