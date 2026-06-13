import React from 'react';
import ReactMarkdown from 'react-markdown';
import { User, Bot, Loader2 } from 'lucide-react';
import { Message } from '../types';
import styles from './Chat.module.css';

interface MessageItemProps {
    message: Message;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
    const isModel = message.role === 'model';

    return (
        <div className={`${styles.messageWrapper} ${isModel ? styles.model : styles.user}`}>
            {isModel && (
                <div className={styles.avatarModel}>
                    <Bot size={20} />
                </div>
            )}

            <div className={`${styles.bubble} ${isModel ? styles.bubbleModel : styles.bubbleUser}`}>
                {isModel ? (
                    <div className={styles.markdown}>
                        <ReactMarkdown>{message.text}</ReactMarkdown>
                    </div>
                ) : (
                    <p className={styles.text}>{message.text}</p>
                )}
            </div>

            {!isModel && (
                <div className={styles.avatarUser}>
                    <User size={20} />
                </div>
            )}
        </div>
    );
};

interface MessageListProps {
    messages: Message[];
    isLoading: boolean;
    bottomRef: React.RefObject<HTMLDivElement | null>;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, isLoading, bottomRef }) => {
    return (
        <div className={styles.messageList} style={{ position: 'relative' }}>
            <div className={styles.container}>
                {messages.map((msg) => (
                    <MessageItem key={msg.id} message={msg} />
                ))}

                {isLoading && (
                    <div className={`${styles.messageWrapper} ${styles.model}`}>
                        <div className={styles.avatarModel}>
                            <Bot size={20} />
                        </div>
                        <div className={`${styles.bubble} ${styles.bubbleModel} ${styles.loading}`}>
                            <Loader2 size={18} className={styles.spinner} />
                            <span>Analizando jugada...</span>
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>
        </div>
    );
};
