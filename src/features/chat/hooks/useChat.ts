import { useState, useCallback, useEffect } from 'react';
import { Message } from '../types';

const API_BASE = import.meta.env.PROD ? '' : (import.meta.env.VITE_API_URL || 'http://localhost:3001');

const WELCOME_MSG: Message = {
    id: 'welcome',
    role: 'model',
    text: '¡Hola! Soy tu instructor virtual de pádel. ¿En qué puedo ayudarte hoy?'
};

export const useChat = () => {
    const [messages, setMessages] = useState<Message[]>([WELCOME_MSG]);
    const [isLoading, setIsLoading] = useState(false);
    const [remainingMessages, setRemainingMessages] = useState<{remaining: number, limit: number} | null>(null);

    // Initial load: fetch history (backend will set cookie if it doesn't exist)
    useEffect(() => {
        const fetchLimit = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/limit`, { credentials: 'omit' }); // Rate limit by IP, cookie not needed
                if (res.ok) {
                    const data = await res.json();
                    setRemainingMessages({
                        remaining: data.remaining,
                        limit: data.limit
                    });
                }
            } catch (e) {
                console.error("Error fetching rate limit:", e);
            }
        };

        const initChat = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/history`, { 
                    credentials: 'include' // This ensures the browser sends and stores the threadId cookie
                });
                const data = await res.json();
                if (data.messages && data.messages.length > 0) {
                    setMessages(data.messages);
                } else {
                    setMessages([WELCOME_MSG]);
                }
            } catch (e) {
                console.error("Error fetching history:", e);
            }
        };
        
        fetchLimit();
        initChat();
    }, []);

    const sendMessage = useCallback(async (text: string) => {
        if (!text.trim() || isLoading) return;

        const userMessage: Message = { id: Date.now().toString(), role: 'user', text };
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // Important to send the cookie back to identify the session
                body: JSON.stringify({ text }) // threadId is no longer sent here
            });

            if (!response.ok) {
                if (response.status === 429) {
                    throw new Error('Has alcanzado el límite de mensajes diarios.');
                }
                throw new Error('Chat API failed');
            }

            // Capture rate limit
            const remaining = response.headers.get('RateLimit-Remaining');
            const limit = response.headers.get('RateLimit-Limit');
            if (remaining !== null && limit !== null) {
                setRemainingMessages({
                    remaining: parseInt(remaining, 10),
                    limit: parseInt(limit, 10)
                });
            }

            const data = await response.json();

            const modelMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                text: data.text || ''
            };

            setMessages(prev => [...prev, modelMessage]);
        } catch (error) {
            console.error('Error sending message:', error);
            const isRateLimit = error instanceof Error && error.message.includes('límite');
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'model',
                text: isRateLimit 
                    ? 'Has alcanzado el límite diario de mensajes. Por favor, vuelve a intentarlo mañana.'
                    : 'Lo siento, hubo un error al procesar tu mensaje. Verifica tu conexión o intenta de nuevo.'
            }]);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading]);

    const resetMessages = useCallback(async () => {
        setMessages([WELCOME_MSG]);
        try {
            await fetch(`${API_BASE}/api/reset`, { 
                method: 'POST',
                credentials: 'include' 
            });
        } catch (e) {
            console.error("Error resetting chat:", e);
        }
    }, []);

    return { messages, setMessages, isLoading, remainingMessages, sendMessage, resetMessages };
};
