// --- Imports ---
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const auth = require('./auth');

// --- App Setup ---
const app = express();
const PORT = 3000;

// --- Middlewares ---
app.use(cors());
app.use(express.json());

// --- Database Connection ---
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: true
});

// --- Routes ---
app.get('/', (req, res) => {
    res.send('API is running! Ready to receive requests.');
});

app.get('/db-test', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM public."brugere"');
        res.json(result.rows);
    } catch (error) {
        console.error('Error during database query:', error);
        res.status(500).send('Database error');
    }
});


app.post('/api/register', async (req, res) => {
    try {
        // 1. Get ALL three values
        const { brugernavn, email, password } = req.body;

        // 2. Check if they are missing
        if (!brugernavn || !email || !password) {
            // This is a 400 Bad Request, not 401
            return res.status(400).json({ message: 'Username, email, and password are required.' });
        }

        // 3. Hash the password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 4. Insert user into the database
        const newUser = await pool.query(
            'INSERT INTO public."brugere" (brugernavn, email, password_hash) VALUES ($1, $2, $3) RETURNING id, email, brugernavn, created_at',
            [brugernavn, email, passwordHash]
        );

        const user = newUser.rows[0];

        // 5. SUCCESS! Create a JWT token
        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '3h' }, // Token expires in 3 hours
            (err, token) => {
                if (err) throw err;
                // Send ONLY the token back to Angular
                res.status(201).json({ token: token });
            }
        );

    } catch (error) {
        // 6. Handle errors correctly
        if (error.code === '23505') { // Email/Username already in use
            return res.status(400).json({ message: 'Email or username is already in use.' });
        }
        console.error('Error during registration:', error);
        // Default error is 500 (Server error)
        res.status(500).json({ message: 'Server error' });
    }
});

// --- LOGIN ENDPOINT (WITH JWT TOKEN) ---
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        const userQuery = await pool.query(
            'SELECT * FROM public."brugere" WHERE email = $1',
            [email]
        );

        if (userQuery.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const user = userQuery.rows[0];

        const isPasswordCorrect = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordCorrect) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        // Create a 'payload' with the user's ID
        const payload = {
            user: {
                id: user.id
            }
        };

        // Sign the token with your secret key from .env
        jwt.sign(
            payload,
            process.env.JWT_SECRET, // Check that JWT_SECRET is in your .env file!
            { expiresIn: '3h' },
            (err, token) => {
                if (err) throw err;
                // Send ONLY the token back
                res.status(200).json({ token: token });
            }
        );

    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Server error' });
    }
});





app.get('/api/wallet', auth, async (req, res) => {
    try {

        const userId = req.user.id;


        const walletQuery = await pool.query(
            'SELECT * FROM public.wallets WHERE user_id = $1',
            [userId]
        );


        res.status(200).json(walletQuery.rows);

    } catch (error) {
        console.error('Error fetching wallet:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


app.post('/api/wallet/add', auth, async (req, res) => {
    // 1. Opret en "client" til at håndtere transaktionen
    const client = await pool.connect();

    try {
        const userId = req.user.id;
        // Vi parser data fra body med det samme
        const { coin_id } = req.body;
        const amountToAdd = parseFloat(req.body.amount);
        const purchasePrice = parseFloat(req.body.purchase_price);

        if (!coin_id || !amountToAdd || amountToAdd <= 0 || !purchasePrice || purchasePrice <= 0) {
            // Vi ruller ikke tilbage, da vi ikke har startet en transaktion endnu
            client.release(); // Frigiv clienten
            return res.status(400).json({ message: 'Coin ID, a valid amount, and a valid purchase price are required.' });
        }

        // 2. Start transaktionen
        await client.query('BEGIN');

        // 3. Tilføj 'FOR UPDATE' for at låse rækken
        const existingCoin = await client.query(
            'SELECT * FROM public.wallets WHERE user_id = $1 AND coin_id = $2 FOR UPDATE',
            [userId, coin_id]
        );

        let result;

        if (existingCoin.rows.length > 0) {
            // =======================================================
            // ▼▼▼ HER VAR FEJLEN ▼▼▼
            // =======================================================

            // RETTELSE: Konverter database-strenge til tal med parseFloat()
            const oldAmount = parseFloat(existingCoin.rows[0].amount);
            const oldPurchasePrice = parseFloat(existingCoin.rows[0].purchase_price);

            // Nu er det tal + tal
            const newAmount = oldAmount + amountToAdd;

            // Beregn gennemsnitspris (nu med korrekte tal)
            const oldTotalCost = oldPurchasePrice * oldAmount;
            const newPurchaseCost = purchasePrice * amountToAdd;
            const newAveragePurchasePrice = (oldTotalCost + newPurchaseCost) / newAmount;

            // =======================================================
            // ▲▲▲ RETTELSE SLUT ▲▲▲
            // =======================================================

            const updatedCoin = await client.query(
                'UPDATE public.wallets SET amount = $1, purchase_price = $2, last_updated = CURRENT_TIMESTAMP WHERE user_id = $3 AND coin_id = $4 RETURNING *',
                [newAmount, newAveragePurchasePrice, userId, coin_id]
            );

            result = { data: updatedCoin.rows[0], status: 200 };
        } else {
            // INSERT (denne var fin, men vi bruger de parsede variabler for en sikkerheds skyld)
            const newCoin = await client.query(
                'INSERT INTO public.wallets (user_id, coin_id, amount, purchase_price) VALUES ($1, $2, $3, $4) RETURNING *',
                [userId, coin_id, amountToAdd, purchasePrice]
            );

            result = { data: newCoin.rows[0], status: 201 };
        }

        // 4. Gennemfør transaktionen
        await client.query('COMMIT');

        // 5. Send svar TILBAGE (først efter COMMIT)
        res.status(result.status).json(result.data);

    } catch (error) {
        // 6. Hvis noget fejler, rul tilbage!
        await client.query('ROLLBACK');

        console.error('Error adding to wallet:', error); // Denne vil nu fange databasefejl
        res.status(500).json({ message: 'Server error' });
    } finally {
        // 7. VIGTIGT: Frigiv altid clienten
        client.release();
    }
});

app.post('/api/wallet/sell', auth, async (req, res) => {
    // 1. Valider simple inputs, FØR vi starter en transaktion
    const { coin_id, amount } = req.body;
    const userId = req.user.id;

    if (!coin_id || !amount || parseFloat(amount) <= 0) {
        return res.status(400).json({ message: 'Coin ID and a valid amount are required.' });
    }

    const amountToSell = parseFloat(amount);

    // 2. Forbind til databasen
    const client = await pool.connect();

    try {
        // 3. Start transaktionen
        await client.query('BEGIN');

        // 4. Hent og LÅS den række, vi vil sælge fra
        const existingCoin = await client.query(
            'SELECT * FROM public.wallets WHERE user_id = $1 AND coin_id = $2 FOR UPDATE',
            [userId, coin_id]
        );

        // 5. Validering (logik) - Nu *sikkert* inde i transaktionen
        if (existingCoin.rows.length === 0) {
            // Hvis coinen ikke findes, skal vi ikke gøre noget. Rul tilbage og stop.
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Coin not found in your wallet.' });
        }

        const currentAmount = existingCoin.rows[0].amount;

        if (amountToSell > currentAmount) {
            // Hvis de prøver at sælge mere, end de har, rul tilbage og stop.
            await client.query('ROLLBACK');
            return res.status(400).json({ message: 'You cannot sell more than you own.' });
        }

        // 6. Udfør salgslogikken (enten UPDATE eller DELETE)
        const newAmount = currentAmount - amountToSell;
        let responseData;
        let responseStatus = 200;

        if (newAmount === 0) {
            // Salg af alt: Fjern rækken fra databasen
            await client.query(
                'DELETE FROM public.wallets WHERE user_id = $1 AND coin_id = $2',
                [userId, coin_id]
            );
            responseData = { message: 'Coin successfully sold and removed from wallet.' };
        } else {
            // Delvist salg: Opdater rækken med den nye 'amount'
            // Vi beholder 'purchase_price', da gennemsnitsprisen ikke ændres ved salg
            const updatedCoin = await client.query(
                'UPDATE public.wallets SET amount = $1, last_updated = CURRENT_TIMESTAMP WHERE user_id = $2 AND coin_id = $3 RETURNING *',
                [newAmount, userId, coin_id]
            );
            responseData = updatedCoin.rows[0];
        }

        // 7. Gennemfør (COMMIT) transaktionen, da alt gik godt
        await client.query('COMMIT');

        // 8. Send det succesfulde svar
        res.status(responseStatus).json(responseData);

    } catch (error) {
        // 9. Håndter uventede fejl (f.eks. database er nede)
        // Rul alt tilbage, hvis noget fejlede!
        await client.query('ROLLBACK');
        console.error('Error selling coin:', error);
        res.status(500).json({ message: 'Server error' });

    } finally {
        // 10. VIGTIGT: Frigiv ALTID clienten tilbage til poolen
        client.release();
    }
});

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});


