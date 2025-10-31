// --- Imports ---
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcrypt'); // <-- NY IMPORT
const jwt = require('jsonwebtoken'); // <-- DENNE SKAL VÆRE DER
const auth = require('./auth'); // <-- TILFØJ DENNE DØRMAND

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

// --- NYT: REGISTER ENDPOINT ---
// SØRG FOR AT DIN /api/register SER SÅDAN HER UD:
app.post('/api/register', async (req, res) => {
    try {
        // 1. Hent ALLE tre værdier
        const { brugernavn, email, password } = req.body;

        // 2. Tjek om de mangler
        if (!brugernavn || !email || !password) {
            // Dette er en 400 Bad Request, ikke 401
            return res.status(400).json({ message: 'Brugernavn, email og password er påkrævet.' });
        }

        // 3. Hash adgangskoden
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 4. Indsæt i databasen
        const newUser = await pool.query(
            'INSERT INTO public."brugere" (brugernavn, email, password_hash) VALUES ($1, $2, $3) RETURNING id, email, brugernavn, created_at',
            [brugernavn, email, passwordHash]
        );

       // 5. SUCCESS! Opret et JWT-token

        // Opret en 'payload' - de data, vi vil gemme i tokenet
        // Vi gemmer KUN brugerens ID, aldrig adgangskoden.
        const payload = {
            user: {
                id: user.id
            }
        };

        // Underskriv tokenet med din hemmelige nøgle
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '3h' }, // Tokenet udløber om 3 timer
            (err, token) => {
                if (err) throw err;
                // Send KUN tokenet tilbage til Angular
                res.status(200).json({ token: token });
            }
        );

    } catch (error) {
        // 6. Håndter fejl korrekt
        if (error.code === '23505') { // Email/Brugernavn allerede i brug
            return res.status(400).json({ message: 'Email eller brugernavn er allerede i brug.' });
        }
        console.error('Fejl ved registrering:', error);
        // Default fejl er 500 (Serverfejl)
        res.status(500).json({ message: 'Serverfejl' });
    }
});

// --- LOGIN ENDPOINT (MED JWT TOKEN) ---
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email og password er påkrævet.' });
        }

        const userQuery = await pool.query(
            'SELECT * FROM public."brugere" WHERE email = $1',
            [email]
        );

        if (userQuery.rows.length === 0) {
            return res.status(401).json({ message: 'Ugyldig email eller adgangskode.' });
        }

        const user = userQuery.rows[0];

        const isPasswordCorrect = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordCorrect) {
            return res.status(401).json({ message: 'Ugyldig email eller adgangskode.' });
        }

        // ----- 5. SUCCESS! DET ER DENNE DEL, DER MANGLER -----

        // Opret en 'payload' med brugerens ID
        const payload = {
            user: {
                id: user.id
            }
        };

        // Underskriv tokenet med din hemmelige nøgle fra .env
        jwt.sign(
            payload,
            process.env.JWT_SECRET, // Tjek at JWT_SECRET er i din .env fil!
            { expiresIn: '3h' },
            (err, token) => {
                if (err) throw err;
                // Send KUN tokenet tilbage
                res.status(200).json({ token: token });
            }
        );
        // ----------------------------------------------------

    } catch (error) {
        console.error('Fejl ved login:', error);
        res.status(500).json({ message: 'Serverfejl' });
    }
});

// --- NYT: HENT BRUGERENS WALLET (BESKYTTET RUTE) ---

// Læg mærke til den nye 'auth' i midten.
// Det er vores "dørmand", der kører FØR resten af koden.
// Den sikrer, at kun en logget-ind bruger kan kalde denne rute.

app.get('/api/wallet', auth, async (req, res) => {
    try {
        // Fordi 'auth'-dørmanden kørte, har vi nu adgang til req.user.id
        // Dette ID blev sat ind i tokenet, da brugeren loggede ind.
        const userId = req.user.id;

        // Hent alle rækker fra 'wallets'-tabellen,
        // der matcher den logget-ind brugers ID.
        const walletQuery = await pool.query(
            'SELECT * FROM public.wallets WHERE user_id = $1',
            [userId]
        );

        // Send pungens indhold tilbage
        res.status(200).json(walletQuery.rows);

    } catch (error) {
        console.error('Fejl ved hentning af wallet:', error);
        res.status(500).json({ message: 'Serverfejl' });
    }
});

// --- NYT: TILFØJ/OPDATER COIN I WALLET (BESKYTTET RUTE) ---
app.post('/api/wallet/add', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        // Hent coin ID og amount fra Angular
        const { coin_id, amount } = req.body;

        if (!coin_id || !amount || amount <= 0) {
            return res.status(400).json({ message: 'Coin ID og et gyldigt antal (amount) er påkrævet.' });
        }

        // Tjek om brugeren ALLEREDE ejer denne coin
        const existingCoin = await pool.query(
            'SELECT * FROM public.wallets WHERE user_id = $1 AND coin_id = $2',
            [userId, coin_id]
        );

        if (existingCoin.rows.length > 0) {
            // ----- OPDATER EKSISTERENDE -----
            // Brugeren ejer den: Læg det nye antal til det gamle
            const newAmount = existingCoin.rows[0].amount + parseFloat(amount);

            const updatedCoin = await pool.query(
                'UPDATE public.wallets SET amount = $1, last_updated = CURRENT_TIMESTAMP WHERE user_id = $2 AND coin_id = $3 RETURNING *',
                [newAmount, userId, coin_id]
            );
            res.status(200).json(updatedCoin.rows[0]);
        } else {
            // ----- INDSÆT NY -----
            // Brugeren ejer den ikke: Opret en ny række
            const newCoin = await pool.query(
                'INSERT INTO public.wallets (user_id, coin_id, amount) VALUES ($1, $2, $3) RETURNING *',
                [userId, coin_id, parseFloat(amount)]
            );
            res.status(201).json(newCoin.rows[0]);
        }

    } catch (error) {
        console.error('Fejl ved tilføjelse til wallet:', error);
        res.status(500).json({ message: 'Serverfejl' });
    }
});

// --- Start Serveren ---
app.listen(PORT, () => {
    console.log(`Server kører på http://localhost:${PORT}`);
});
