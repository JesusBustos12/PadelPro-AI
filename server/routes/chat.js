const express = require('express');
const router = express.Router();
const openaiService = require('../services/openaiService');

// Create a new thread
router.post('/thread', async (req, res, next) => {
    try {
        const threadId = await openaiService.createThread();
        res.json({ threadId });
    } catch (error) {
        next(error);
    }
});

// Chat Endpoint
router.post('/chat', async (req, res, next) => {
    try {
        const { threadId, text, language } = req.body;

        if (!text) {
            return res.status(400).json({ error: "Text is required" });
        }
        if (!threadId) {
            return res.status(400).json({ error: "ThreadId is required" });
        }

        const responseText = await openaiService.sendMessage(threadId, text, language || 'es');
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
