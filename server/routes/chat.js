const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const openaiService = require('../services/openaiService');
const db = require('../db');

// Helper to set the thread cookie
const setThreadCookie = (res, threadId) => {
    res.cookie('threadId', threadId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 365 * 24 * 60 * 60 * 1000 // 1 year
    });
};

// Reset chat / create new thread explicitly
router.post('/reset', async (req, res, next) => {
    try {
        const threadId = crypto.randomUUID();
        await db.query('INSERT INTO threads (id) VALUES (?)', [threadId]);
        setThreadCookie(res, threadId);
        res.json({ success: true, message: 'Chat reseteado' });
    } catch (error) {
        next(error);
    }
});

// Get chat history for the current session (cookie)
router.get('/history', async (req, res, next) => {
    try {
        let threadId = req.cookies.threadId;

        // If no cookie, create a new thread automatically
        if (!threadId) {
            threadId = crypto.randomUUID();
            await db.query('INSERT INTO threads (id) VALUES (?)', [threadId]);
            setThreadCookie(res, threadId);
            return res.json({ messages: [] });
        }

        const [rows] = await db.query(
            'SELECT role, content as text FROM messages WHERE thread_id = ? ORDER BY created_at ASC',
            [threadId]
        );

        const formattedMessages = rows.map((row, index) => ({
            id: `msg-${Date.now()}-${index}`,
            role: row.role,
            text: row.text
        }));

        res.json({ messages: formattedMessages });
    } catch (error) {
        next(error);
    }
});

// Chat Endpoint
router.post('/chat', async (req, res, next) => {
    try {
        const { text } = req.body;
        const threadId = req.cookies.threadId;

        if (!text) {
            return res.status(400).json({ error: "Text is required" });
        }
        if (!threadId) {
            return res.status(400).json({ error: "No session found. Please reload." });
        }

        // 1. Guardar mensaje del usuario
        await db.query(
            'INSERT INTO messages (thread_id, role, content) VALUES (?, ?, ?)',
            [threadId, 'user', text]
        );

        // 2. Extraer todo el historial
        const [messages] = await db.query(
            'SELECT role, content as text FROM messages WHERE thread_id = ? ORDER BY created_at ASC',
            [threadId]
        );

        // 3. Enviar a OpenAI
        const responseText = await openaiService.sendMessage(messages);

        // 4. Guardar la respuesta del bot
        await db.query(
            'INSERT INTO messages (thread_id, role, content) VALUES (?, ?, ?)',
            [threadId, 'model', responseText]
        );

        res.json({ text: responseText });
    } catch (error) {
        next(error);
    }
});

// Translation Endpoint
router.post('/translate', async (req, res, next) => {
    try {
        const { texts, targetLang } = req.body;

        if (!texts || !Array.isArray(texts)) {
            return res.status(400).json({ error: "Texts array is required" });
        }

        const translatedTexts = await openaiService.translateTexts(texts, targetLang);
        res.json({ translatedTexts });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
