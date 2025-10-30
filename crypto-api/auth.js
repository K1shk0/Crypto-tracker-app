const jwt = require('jsonwebtoken');
require('dotenv').config();

// Dette er vores "dørmand" middleware
module.exports = function(req, res, next) {
    // 1. Hent tokenet fra 'headeren'
    //    (Angular skal sende det som 'x-auth-token')
    const token = req.header('x-auth-token');

    // 2. Tjek om der overhovedet er et token
    if (!token) {
        return res.status(401).json({ message: 'Ingen token, adgang nægtet.' });
    }

    // 3. Tjek om tokenet er gyldigt
    try {
        // Afkod tokenet vha. vores hemmelige nøgle
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // LÆG MÆRKE TIL DENNE LINJE:
        // Vi tilføjer de afkodede bruger-data (f.eks. id)
        // til selve 'req' (request) objektet.
        // Nu ved alle fremtidige endpoints, hvem brugeren er.
        req.user = decoded.user;

        // Send brugeren videre til det rigtige endpoint (f.eks. /api/wallet)
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token er ikke gyldigt.' });
    }
};
