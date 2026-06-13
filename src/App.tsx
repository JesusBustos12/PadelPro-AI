import { useState, useEffect, useRef } from 'react';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import { Header } from './layout/Header';
import { MessageList } from './features/chat/components/MessageList';
import { ChatInput } from './features/chat/components/ChatInput';
import { useChat } from './features/chat/hooks/useChat';
import { AppTheme } from './features/chat/types';
import './styles/global.css';

export default function App() {
    const [theme, setTheme] = useState<AppTheme>('light');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Custom Hooks
    const { messages, isLoading, remainingMessages, sendMessage, resetMessages } = useChat();

    // Sync Theme with DOM
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

    return (
        <HelmetProvider>
            <Helmet>
                <title>Pro Pádel AI | Tu Entrenador Personal</title>
                <meta name="description" content="Mejora tu juego con Pro Pádel AI, tu instructor virtual de pádel impulsado por Inteligencia Artificial." />
            </Helmet>
            <div className="app-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
                <Header
                    theme={theme}
                    toggleTheme={toggleTheme}
                    onResetChat={() => resetMessages()}
                />

                <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <MessageList
                        messages={messages}
                        isLoading={isLoading}
                        bottomRef={messagesEndRef}
                    />

                    <ChatInput
                        isLoading={isLoading}
                        remainingMessages={remainingMessages}
                        onSendMessage={sendMessage}
                    />
                </main>
            </div>
        </HelmetProvider>
    );
}
