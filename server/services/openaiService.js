const OpenAI = require('openai');
const dotenv = require('dotenv');

dotenv.config();

let openaiInstance = null;

function getOpenAIClient() {
    if (!openaiInstance) {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error("La variable de entorno OPENAI_API_KEY está vacía o no definida. Por favor, configúrala en Vercel y vuelve a realizar un despliegue (redeploy).");
        }
        openaiInstance = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }
    return openaiInstance;
}

const ASSISTANT_ID = process.env.ASSISTANT_ID || 'asst_rLRaCIuVwz87zBwo2P8IXugp';

// Create a new Thread for a user session
async function createThread() {
    try {
        const openai = getOpenAIClient();
        const thread = await openai.beta.threads.create();
        return thread.id;
    } catch (error) {
        console.error("Error creating thread:", error);
        throw error;
    }
}

// Send a message to an existing thread and run the assistant
async function sendMessage(threadId, text, language) {
    try {
        const openai = getOpenAIClient();
        // 1. Add the user message to the thread
        // We can pass language as an instruction, but since it's a conversation, 
        // we can just append it to the user message context if needed, or let the assistant naturally detect it.
        // To be safe, we'll gently guide it via text prefix if it's not Spanish.
        const content = language === 'es' ? text : `[Respond in ${language}] ${text}`;

        await openai.beta.threads.messages.create(threadId, {
            role: "user",
            content: content
        });

        // 2. Run the Assistant on the Thread
        const run = await openai.beta.threads.runs.createAndPoll(threadId, {
            assistant_id: ASSISTANT_ID,
        });

        if (run.status === 'completed') {
            // 3. Retrieve the messages
            const openai = getOpenAIClient();
            const messages = await openai.beta.threads.messages.list(run.thread_id);
            
            // The first message is the latest response from the assistant
            const latestMessage = messages.data[0];
            
            if (latestMessage.role === 'assistant' && latestMessage.content[0].type === 'text') {
                return latestMessage.content[0].text.value;
            } else {
                return "Lo siento, hubo un problema al procesar la respuesta.";
            }
        } else {
            console.error("Run ended with status:", run.status);
            return "Lo siento, el asistente no pudo completar la solicitud.";
        }
    } catch (error) {
        console.error("Error sending message:", error);
        throw error;
    }
}

// Translate texts using standard chat completions (faster and cheaper than assistant for simple translation)
async function translateTexts(texts, targetLang) {
    try {
        const openai = getOpenAIClient();
        const prompt = `Translate the following Padel-related chat messages to ${targetLang}. 
Keep the tone professional and encouraging. 
Return ONLY a JSON array of strings in the exact same order.
Messages: ${JSON.stringify(texts)}`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.3,
        });

        const rawResponse = response.choices[0].message.content || '[]';
        // Clean markdown JSON formatting if present
        const jsonMatch = rawResponse.match(/\\[.*\\]/s);
        let translatedTexts;
        try {
            translatedTexts = JSON.parse(jsonMatch ? jsonMatch[0] : rawResponse.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, ''));
        } catch (e) {
            console.error("Failed to parse translation JSON:", rawResponse);
            translatedTexts = texts; // fallback
        }

        return translatedTexts;
    } catch (error) {
        console.error("Error translating texts:", error);
        throw error;
    }
}

module.exports = {
    createThread,
    sendMessage,
    translateTexts
};
