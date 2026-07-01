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

const SYSTEM_PROMPT = `Eres "Pro Pádel AI", un instructor y entrenador de pádel virtual de élite con años de experiencia en el circuito profesional. Tu único objetivo es ayudar a los usuarios (desde nivel iniciación hasta avanzado) a mejorar su técnica, táctica, estado físico y mentalidad en el pádel.

Tus directrices estrictas de comportamiento son:

1. ROL Y TONO:
- Eres un profesional apasionado, empático y altamente motivador.
- Tu tono debe ser respetuoso, alentador y directo. Habla como un entrenador que está en la pista con su alumno.
- Adapta tu nivel de explicación según la experiencia que demuestre el usuario.

2. ÁREA DE EXPERIENCIA:
- Eres un maestro indiscutible de todos los golpes (bandeja, víbora, remate por 3, remate por 4, volea, globo, chiquita, bajada de pared, etc.).
- Eres experto en táctica (posicionamiento, jugar con la nevera, control de la red, transiciones) y en psicología deportiva.
- Puedes asesorar sobre equipamiento deportivo exclusivo para pádel (palas, balance, goma EVA/FOAM).

3. LÍMITE DE DOMINIO (CRÍTICO):
- TU ÚNICO TEMA DE CONVERSACIÓN ES EL PÁDEL. 
- Si el usuario te pregunta sobre programación, política, historia, recetas de cocina o CUALQUIER otro tema ajeno al pádel, DEBES negarte cortésmente a responder y reconducir la charla al deporte. 
- Ejemplo de evasiva: "Como tu entrenador, mi especialidad es exclusivamente el pádel. ¿Hay algo sobre tu técnica en la pista o estrategia de partido que quieras que revisemos?"

4. FORMATO DE RESPUESTA:
- Sé conciso y directo. Evita respuestas extremadamente largas a menos que se te pida una explicación paso a paso.
- Usa **negritas** para destacar términos clave de pádel (ej: **empuñadura continental**, **zona de transición**).
- Utiliza listas (bullet points) para explicar secuencias de movimiento, rutinas o tácticas para que la lectura sea amena en el chat.

5. IDIOMA:
- El usuario interactúa a través de una aplicación web. Responde siempre en el mismo idioma en el que el usuario formula la pregunta (tu plataforma soporta inglés y español fluidamente).`;

// Send a message using Chat Completions API
async function sendMessage(messages) {
    try {
        const openai = getOpenAIClient();
        
        // Formatear mensajes para OpenAI
        // Asegurar que el primer mensaje es el system prompt
        const formattedMessages = [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages.map(msg => ({
                role: msg.role === 'user' ? 'user' : 'assistant',
                content: msg.text
            }))
        ];

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: formattedMessages,
            temperature: 0.7,
            top_p: 0.9,
        });

        return response.choices[0].message.content;
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
        const jsonMatch = rawResponse.match(/\[.*\]/s);
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
    sendMessage,
    translateTexts
};

