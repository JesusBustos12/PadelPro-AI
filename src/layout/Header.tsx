import React from 'react';
import { Moon, Sun, RotateCcw } from 'lucide-react';
import { AppTheme } from '../features/chat/types';
import styles from './Header.module.css';
import logoImg from '../assets/raqueta-de-padel.png';

interface HeaderProps {
    theme: AppTheme;
    toggleTheme: () => void;
    onResetChat: () => void;
}

export const Header: React.FC<HeaderProps> = ({ theme, toggleTheme, onResetChat }) => {
    return (
        <header className={styles.header}>
            <div className={styles.brand}>
                <div className={styles.logo}>
                    <img src={logoImg} alt="PadelPro AI Logo" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                </div>
                <div>
                    <h1 className={styles.title}>PadelPro AI</h1>
                    <p className={styles.subtitle}>Tu instructor virtual</p>
                </div>
            </div>

            <div className={styles.actions}>
                <button
                    onClick={onResetChat}
                    className={`${styles.resetBtn} ${styles.tooltipContainer}`}
                    data-tooltip="Reiniciar conversación"
                >
                    <RotateCcw size={18} />
                </button>

                <div
                    className={styles.themeToggle}
                    onClick={toggleTheme}
                    role="switch"
                    aria-checked={theme === 'dark'}
                    aria-label={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
                >
                    <div className={`${styles.toggleBall} ${theme === 'dark' ? styles.dark : ''}`}>
                        {theme === 'light' ? <Sun size={12} color="#f59e0b" /> : <Moon size={12} color="#6366f1" />}
                    </div>
                </div>
            </div>
        </header>
    );
};
