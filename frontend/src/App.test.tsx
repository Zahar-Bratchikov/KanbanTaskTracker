import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from './test/test-utils';
import App from './App';
import { api } from './services/api';

// Mock the API
vi.mock('./services/api', () => ({
    api: {
        getTasks: vi.fn(),
        createTask: vi.fn(),
        updateTask: vi.fn(),
        deleteTask: vi.fn(),
    },
}));

describe('App', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (api.getTasks as any).mockResolvedValue([]);
        localStorage.clear();
    });

    it('renders the app', () => {
        render(<App />);
        expect(screen.getByTestId('app')).toBeInTheDocument();
    });

    it('renders the kanban board', () => {
        render(<App />);
        expect(screen.getByTestId('kanban-board')).toBeInTheDocument();
    });

    it('initializes with system preference when no saved preference', () => {
        // Mock matchMedia to return dark mode preference
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: vi.fn().mockImplementation((query) => ({
                matches: query === '(prefers-color-scheme: dark)',
                media: query,
                onchange: null,
                addListener: vi.fn(),
                removeListener: vi.fn(),
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                dispatchEvent: vi.fn(),
            })),
        });

        render(<App />);
        const app = screen.getByTestId('app');
        expect(app).toHaveClass('kt-theme-dark');
    });

    it('initializes with saved preference from localStorage', () => {
        localStorage.setItem('kanban-dark-mode', 'false');

        render(<App />);
        const app = screen.getByTestId('app');
        expect(app).toHaveClass('kt-theme-light');
    });

    it('saves dark mode preference to localStorage', () => {
        localStorage.setItem('kanban-dark-mode', 'true');

        render(<App />);
        expect(localStorage.getItem('kanban-dark-mode')).toBe('true');
    });

    it('applies dark class to document when dark mode is enabled', () => {
        localStorage.setItem('kanban-dark-mode', 'true');

        render(<App />);
        expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('removes dark class from document when dark mode is disabled', () => {
        localStorage.setItem('kanban-dark-mode', 'false');

        render(<App />);
        expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
});
