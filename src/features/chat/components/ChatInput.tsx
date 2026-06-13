import React, { useState } from 'react';
import { Send } from 'lucide-react';
import styles from './Chat.module.css';

interface ChatInputProps {
    isLoading: boolean;
    remainingMessages: { remaining: number; limit: number } | null;
    onSendMessage: (text: string) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
    isLoading,
    remainingMessages,
    onSendMessage,
}) => {
    const [input, setInput] = useState('');
    const MAX_CHARS = 500;
    const currentLimit = remainingMessages || { remaining: 14, limit: 14 };
    const isLimitReached = currentLimit.remaining === 0;

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (input.trim() && !isLoading && !isLimitReached && input.length <= MAX_CHARS) {
            onSendMessage(input);
            setInput('');
        }
    };

    const isNearLimit = input.length > MAX_CHARS * 0.8;

    return (
        <footer className={styles.footer}>
            <div className={styles.inputContainer}>
                <form className={styles.form} onSubmit={handleSubmit}>
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value.slice(0, MAX_CHARS))}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit();
                            }
                        }}
                        placeholder={
                            isLimitReached
                                ? 'Límite diario alcanzado.'
                                : 'Escribe tu pregunta al instructor...'
                        }
                        className={styles.textarea}
                        rows={1}
                        disabled={isLoading || isLimitReached}
                    />
                    


                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading || isLimitReached || input.length > MAX_CHARS}
                        className={styles.sendBtn}
                        aria-label="Enviar mensaje"
                    >
                        <Send size={18} />
                    </button>
                </form>

                <div className={styles.inputMeta}>
                    <span 
                        className={`${styles.charCount} ${isNearLimit ? styles.charCountWarning : ''} ${styles.tooltipContainer}`}
                        data-tooltip="Límite de caracteres por mensaje"
                    >
                        {input.length}/{MAX_CHARS}
                    </span>
                    <div 
                        className={`${styles.remainingContainer} ${styles.tooltipContainer}`}
                        data-tooltip="Mensajes con IA disponibles"
                    >
                        <span className={`${styles.remainingCount} ${currentLimit.remaining <= 3 ? styles.remainingWarning : ''}`}>
                            {`${currentLimit.remaining} msg restantes`}
                        </span>
                        <div className={styles.progressBarContainer}>
                            <div 
                                className={`${styles.progressBarFill} ${currentLimit.remaining <= 3 ? styles.progressBarWarning : ''}`} 
                                style={{ width: `${(currentLimit.remaining / currentLimit.limit) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};
