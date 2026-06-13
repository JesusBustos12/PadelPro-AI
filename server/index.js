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

const chatRoutes = require('./routes/chat');
app.use('/api', chatRoutes);

// Serve Static Frontend Files (Vercel & Local)
app.use(express.static(path.join(process.cwd(), 'dist')));

app.get('*', (req, res) => {
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
