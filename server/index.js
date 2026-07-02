const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const http = require('http');
const path = require('path');

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
const apiLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 14, // Limit each IP to 14 requests per windowMs
    message: { error: 'Has alcanzado el límite diario de 14 mensajes. Vuelve a intentarlo mañana.' },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use('/api/chat', apiLimiter);

// Endpoint to retrieve the current limit state without consuming a point
app.get('/api/limit', async (req, res) => {
    try {
        const ip = req.ip;
        // Increment to retrieve the state, then decrement immediately to revert it
        const { totalHits, resetTime } = await apiLimiter.store.increment(ip);
        if (typeof apiLimiter.store.decrement === 'function') {
            await apiLimiter.store.decrement(ip);
        }
        res.json({
            limit: 14,
            remaining: Math.max(0, 14 - (totalHits - 1)),
            resetTime
        });
    } catch(err) {
        res.json({ limit: 14, remaining: 14 });
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
