// --- Imports ---
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcrypt'); // <-- NY IMPORT

// --- App Setup ---
const app = express();
const PORT = 3000;

// --- Middlewares ---
app.use(cors());
app.use(express.json());

// --- Database Forbindelse ---
const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE
});

// --- Ruter ---
app.get('/', (req, res) => {
    res.send('APIen kører! Klar til at modtage requests.');
});

app.get('/db-test', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM public."brugere"');
        res.json(result.rows);
    } catch (error) {
        console.error('Fejl ved databaseforespørgsel:', error);
        res.status(500).send('Databasefejl');
    }
});

// --- NYT: LOGIN ENDPOINT (RETTET) ---
app.post('/api/login', async (req, res) => {
    try {
        // 1. Hent email og password fra body
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email og password er påkrævet.' });
        }

        // 2. RETTET: Opdateret SELECT til at inkludere brugernavn
        //    Selvom vi ikke bruger 'brugernavn' til login,
        //    er det godt at hente det, så vi kan sende det tilbage til app'en.
        const userQuery = await pool.query(
            'SELECT * FROM public."brugere" WHERE email = $1',
            [email]
        );

        // 3. Tjek om brugeren overhovedet findes
        if (userQuery.rows.length === 0) {
            return res.status(401).json({ message: 'Ugyldig email eller adgangskode.' });
        }

        const user = userQuery.rows[0];

        // 4. Sammenlign den indsendte adgangskode med den gemte hash
        const isPasswordCorrect = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordCorrect) {
            return res.status(401).json({ message: 'Ugyldig email eller adgangskode.' });
        }

        // 5. SUCCESS!
        //    RETTET: Inkluder nu også 'brugernavn' i svaret
        res.status(200).json({
            message: 'Login succesfuld!',
            user: {
                id: user.id,
                email: user.email,
                brugernavn: user.brugernavn // Tilføjet!
            }
        });

    } catch (error) {
        console.error('Fejl ved login:', error);
        res.status(500).json({ message: 'Serverfejl' });
    }
});

// --- Start Serveren ---
app.listen(PORT, () => {
    console.log(`Server kører på http://localhost:${PORT}`);
});
