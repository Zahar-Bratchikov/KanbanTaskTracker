import React, { useState, useEffect } from 'react';
import { KanbanBoard } from './components/KanbanBoard';
import styles from './styles/App.module.css';

export default function App() {
    const [darkMode, setDarkMode] = useState<boolean>(() => {
        const saved = localStorage.getItem('kanban-dark-mode');
        if (saved !== null) return saved === 'true';
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    useEffect(() => {
        localStorage.setItem('kanban-dark-mode', String(darkMode));
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
      html, body {
        margin: 0;
        padding: 0;
        border: 0;
        outline: 0;
        background: ${darkMode ? '#0f172a' : '#f8fafc'};
        color: ${darkMode ? '#f1f5f9' : '#1e293b'};
        font-family: system-ui, -apple-system, sans-serif;
        height: 100%;
        width: 100%;
        overflow-x: hidden;
      }
      * {
        box-sizing: border-box;
      }
    `;
        document.head.appendChild(style);
        return () => {
            document.head.removeChild(style);
        };
    }, [darkMode]);

    const theme = darkMode ? 'dark' : 'light';

    return (
        <div 
            className={`${styles.app} ${styles[theme]}`} 
            data-testid="app"
        >
            <KanbanBoard darkMode={darkMode} toggleDarkMode={() => setDarkMode(!darkMode)} />
        </div>
    );
}