export type MessageRole = 'user' | 'model';

export interface Message {
    id: string;
    role: MessageRole;
    text: string;
    isLive?: boolean;
}

export type AppLanguage = 'es' | 'en';
export type AppTheme = 'light' | 'dark';
