import { useState, useCallback, useEffect, useRef } from 'react';
import { Message, AppLanguage } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:3001');

export const useChat = () => {
    const [threadId, setThreadId] = useState<string | null>(() => localStorage.getItem('padel_chat_thread_id'));
    const [messages, setMessages] = useState<Message[]>(() => {
        const saved = localStorage.getItem('padel_chat_messages');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error("Error loading chat from storage:", e);
            }
        }
        return [
            {
                id: 'welcome',
                role: 'model',
                text: '¡Hola! Soy tu instructor virtual de pádel. ¿En qué puedo ayudarte hoy?'
            }
        ];
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isTranslating, setIsTranslating] = useState(false);
    const [remainingMessages, setRemainingMessages] = useState<{remaining: number, limit: number} | null>(null);

    // Persist messages to localStorage on change
    useEffect(() => {
        localStorage.setItem('padel_chat_messages', JSON.stringify(messages));
    }, [messages]);

    // Persist thread ID
    useEffect(() => {
        if (threadId) {
            localStorage.setItem('padel_chat_thread_id', threadId);
        } else {
            localStorage.removeItem('padel_chat_thread_id');
        }
    }, [threadId]);

    // Initialize thread if not exists
    useEffect(() => {
        const initThread = async () => {
            if (!threadId) {
                try {
                    const res = await fetch(`${API_BASE}/api/thread`, { method: 'POST' });
                    const data = await res.json();
                    if (data.threadId) {
                        setThreadId(data.threadId);
                    }
                } catch (e) {
                    console.error("Error creating thread:", e);
                }
            }
        };
        initThread();
    }, [threadId]);

    const sendMessage = useCallback(async (text: string) => {
        if (!text.trim() || isLoading || !threadId) return;

        const userMessage: Message = { id: Date.now().toString(), role: 'user', text };
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, threadId, language: 'es' })
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
    }, [isLoading, threadId]);

    const resetMessages = useCallback(async () => {
        const welcomeMsg: Message = {
            id: 'welcome',
            role: 'model',
            text: '¡Hola! Soy tu instructor virtual de pádel. ¿En qué puedo ayudarte hoy?'
        };
        setMessages([welcomeMsg]);
        localStorage.removeItem('padel_chat_messages');
        localStorage.removeItem('padel_chat_thread_id');
        setThreadId(null); // This will trigger the effect to create a new thread
    }, []);

    return { messages, setMessages, isLoading, remainingMessages, sendMessage, resetMessages };
};
