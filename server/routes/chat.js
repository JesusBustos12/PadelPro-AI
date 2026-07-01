const express = require('express');
const router = express.Router();
const openaiService = require('../services/openaiService');

// Chat Endpoint
router.post('/chat', async (req, res, next) => {
    try {
        const { messages } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: "Messages array is required" });
        }

        const responseText = await openaiService.sendMessage(messages);
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
