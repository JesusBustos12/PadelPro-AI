const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const http = require('http');
const path = require('path');
const db = require('./db');
const TiDBStore = require('./rateLimitStore');

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

// Trust the Vercel reverse proxy to get correct IPs for rate limiting
app.set('trust proxy', 1);

// Middleware
// Security HTTP headers
app.use(helmet());

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'http://localhost:5173';
app.use(cors({
    origin: ALLOWED_ORIGIN,
    methods: ['GET', 'POST'],
    exposedHeaders: ['RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset'],
}));
app.use(express.json());

// Rate Limiting Setup (Only applies to chat messages)
const limiterOptions = {
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 14, // Limit each IP to 14 requests per windowMs
    message: { error: 'Has alcanzado el límite diario de 14 mensajes. Vuelve a intentarlo mañana.' },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    store: new TiDBStore()
};
const apiLimiter = rateLimit(limiterOptions);
app.use('/api/chat', apiLimiter);

// Endpoint to retrieve the current limit state without consuming a point
app.get('/api/limit', async (req, res) => {
    try {
        // Obtenemos la llave exacta
        const key = typeof apiLimiter.keyGenerator === 'function' ? await apiLimiter.keyGenerator(req, res) : req.ip;
        
        // Consultamos directamente la base de datos sin afectar el contador
        const [rows] = await db.query('SELECT hits, reset_time FROM rate_limits WHERE ip = ?', [key]);
        
        let totalHits = 0;
        let resetTime = new Date(Date.now() + limiterOptions.windowMs);
        
        if (rows && rows.length > 0) {
            const hit = rows[0];
            const now = Date.now();
            if (hit.reset_time > now) {
                totalHits = hit.hits;
                resetTime = new Date(Number(hit.reset_time));
            }
        }
        
        res.json({
            limit: limiterOptions.max,
            remaining: Math.max(0, limiterOptions.max - totalHits),
            resetTime
        });
    } catch(err) {
        console.error("Error fetching rate limit from DB:", err);
        res.json({ limit: limiterOptions.max, remaining: limiterOptions.max });
    }
});

const chatRoutes = require('./routes/chat');
app.use('/api', chatRoutes);

// Serve Static Frontend Files (Vercel & Local)
app.use(express.static(path.join(process.cwd(), 'dist')));

app.use((req, res) => {
    res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("🏁 Global Server Error:", err.stack);
    res.status(500).json({
        error: "Internal Server Error",
        message: err.message,
        stack: err.stack
    });
});

const PORT = process.env.PORT || 3001;
if (process.env.NODE_ENV !== 'production') {
    server.listen(PORT, () => {
        console.log(`✅ Secure Backend Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;
