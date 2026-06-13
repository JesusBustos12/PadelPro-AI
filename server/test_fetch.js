const { GoogleGenAI } = require('@google/genai');
const dotenv = require('dotenv');

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
    console.error("GEMINI_API_KEY not found in environment");
    process.exit(1);
}

const genAI = new GoogleGenAI({ apiKey: API_KEY });

async function test() {
    try {
        console.log("Testing generateContent with gemini-2.5-flash-lite...");
        const response = await genAI.models.generateContent({
            model: 'gemini-2.5-flash-lite',
            contents: [{ role: 'user', parts: [{ text: "Hola" }] }]
        });
        console.log("Success! Response text:", response.text);
    } catch (err) {
        console.error("SDK Error Details:");
        const fs = require('fs');
        fs.writeFileSync('quota_error.txt', JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
        console.log("Saved error to quota_error.txt");
    }
}

test();
