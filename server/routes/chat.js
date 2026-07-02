const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const openaiService = require('../services/openaiService');
const db = require('../db');

// Create a new thread
router.post('/thread', async (req, res, next) => {
    try {
        // Generating a unique ID for the session thread
        const threadId = crypto.randomUUID();
        
        // Save thread in database
        await db.query('INSERT INTO threads (id) VALUES (?)', [threadId]);

        res.json({ threadId });
    } catch (error) {
        next(error);
    }
});

// Get chat history for a specific thread
router.get('/history/:threadId', async (req, res, next) => {
    try {
        const { threadId } = req.params;

        const [rows] = await db.query(
            'SELECT role, content as text FROM messages WHERE thread_id = ? ORDER BY created_at ASC',
            [threadId]
        );

        // Format to match frontend structure (adding a pseudo-id based on time/index)
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
        const { threadId, text } = req.body;

        if (!text) {
            return res.status(400).json({ error: "Text is required" });
        }
        if (!threadId) {
            return res.status(400).json({ error: "ThreadId is required" });
        }

        // 1. Guardar mensaje del usuario en la base de datos
        await db.query(
            'INSERT INTO messages (thread_id, role, content) VALUES (?, ?, ?)',
            [threadId, 'user', text]
        );

        // 2. Extraer todo el historial del hilo desde la base de datos para dar contexto a OpenAI
        const [messages] = await db.query(
            'SELECT role, content as text FROM messages WHERE thread_id = ? ORDER BY created_at ASC',
            [threadId]
        );

        // 3. Enviar todo el historial a OpenAI
        const responseText = await openaiService.sendMessage(messages);

        // 4. Guardar la respuesta del bot en la base de datos
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
