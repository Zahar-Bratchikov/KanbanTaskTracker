import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../test/test-utils';
import { KanbanBoard } from './KanbanBoard';
import { api } from '../services/api';
import { mockTasks } from '../test/mockData';

// Mock the API
vi.mock('../services/api', () => ({
    api: {
        getTasks: vi.fn(),
        createTask: vi.fn(),
        updateTask: vi.fn(),
        deleteTask: vi.fn(),
    },
}));

describe('KanbanBoard', () => {
    const mockToggleDarkMode = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (api.getTasks as any).mockResolvedValue([]);
    });

    it('renders kanban board with header', async () => {
        render(<KanbanBoard darkMode={false} toggleDarkMode={mockToggleDarkMode} />);

        expect(screen.getByTestId('kanban-board')).toBeInTheDocument();
        expect(screen.getByTestId('board-header')).toBeInTheDocument();
        expect(screen.getByTestId('board-title')).toHaveTextContent('Kanban Task Tracker');
    });

    it('renders theme toggle button', () => {
        render(<KanbanBoard darkMode={false} toggleDarkMode={mockToggleDarkMode} />);

        const toggleButton = screen.getByTestId('theme-toggle-button');
        expect(toggleButton).toBeInTheDocument();
    });

    it('calls toggleDarkMode when theme button is clicked', () => {
        render(<KanbanBoard darkMode={false} toggleDarkMode={mockToggleDarkMode} />);

        const toggleButton = screen.getByTestId('theme-toggle-button');
        fireEvent.click(toggleButton);

        expect(mockToggleDarkMode).toHaveBeenCalledTimes(1);
    });

    it('renders all three columns', () => {
        render(<KanbanBoard darkMode={false} toggleDarkMode={mockToggleDarkMode} />);

        expect(screen.getByTestId('column-todo')).toBeInTheDocument();
        expect(screen.getByTestId('column-in_progress')).toBeInTheDocument();
        expect(screen.getByTestId('column-done')).toBeInTheDocument();
    });

    it('renders new task form', () => {
        render(<KanbanBoard darkMode={false} toggleDarkMode={mockToggleDarkMode} />);

        expect(screen.getByTestId('new-task-form')).toBeInTheDocument();
        expect(screen.getByTestId('new-task-title-input')).toBeInTheDocument();
        expect(screen.getByTestId('new-task-description-input')).toBeInTheDocument();
        expect(screen.getByTestId('new-task-deadline-input')).toBeInTheDocument();
        expect(screen.getByTestId('add-task-button')).toBeInTheDocument();
    });

    it('loads tasks on mount', async () => {
        (api.getTasks as any).mockResolvedValue(mockTasks);

        render(<KanbanBoard darkMode={false} toggleDarkMode={mockToggleDarkMode} />);

        await waitFor(() => {
            expect(api.getTasks).toHaveBeenCalledTimes(1);
        });
    });

    it('displays tasks in correct columns', async () => {
        (api.getTasks as any).mockResolvedValue(mockTasks);

        render(<KanbanBoard darkMode={false} toggleDarkMode={mockToggleDarkMode} />);

        await waitFor(() => {
            expect(screen.getByTestId('task-card-1')).toBeInTheDocument();
            expect(screen.getByTestId('task-card-2')).toBeInTheDocument();
            expect(screen.getByTestId('task-card-3')).toBeInTheDocument();
        });

        // Check column counts
        expect(screen.getByTestId('column-count-todo')).toHaveTextContent('1');
        expect(screen.getByTestId('column-count-in_progress')).toHaveTextContent('1');
        expect(screen.getByTestId('column-count-done')).toHaveTextContent('1');
    });

    it('shows empty state when column has no tasks', async () => {
        (api.getTasks as any).mockResolvedValue([]);

        render(<KanbanBoard darkMode={false} toggleDarkMode={mockToggleDarkMode} />);

        await waitFor(() => {
            expect(screen.getByTestId('empty-column-todo')).toBeInTheDocument();
            expect(screen.getByTestId('empty-column-in_progress')).toBeInTheDocument();
            expect(screen.getByTestId('empty-column-done')).toBeInTheDocument();
        });
    });

    it('disables add button when title is empty', () => {
        render(<KanbanBoard darkMode={false} toggleDarkMode={mockToggleDarkMode} />);

        const addButton = screen.getByTestId('add-task-button');
        expect(addButton).toBeDisabled();
    });

    it('enables add button when title is filled', async () => {
        render(<KanbanBoard darkMode={false} toggleDarkMode={mockToggleDarkMode} />);

        const titleInput = screen.getByTestId('new-task-title-input');
        const addButton = screen.getByTestId('add-task-button');

        fireEvent.change(titleInput, { target: { value: 'New Task' } });

        await waitFor(() => {
            expect(addButton).not.toBeDisabled();
        });
    });

    it('creates new task when add button is clicked', async () => {
        const newTask = {
            id: '4',
            title: 'New Task',
            description: 'New Description',
            status: 'todo' as const,
            deadline: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        (api.createTask as any).mockResolvedValue(newTask);
        (api.getTasks as any).mockResolvedValue([]);

        render(<KanbanBoard darkMode={false} toggleDarkMode={mockToggleDarkMode} />);

        const titleInput = screen.getByTestId('new-task-title-input');
        const descriptionInput = screen.getByTestId('new-task-description-input');
        const addButton = screen.getByTestId('add-task-button');

        fireEvent.change(titleInput, { target: { value: 'New Task' } });
        fireEvent.change(descriptionInput, { target: { value: 'New Description' } });
        fireEvent.click(addButton);

        await waitFor(() => {
            expect(api.createTask).toHaveBeenCalledWith({
                title: 'New Task',
                description: 'New Description',
                status: 'todo',
                deadline: null,
            });
        });
    });

    it('clears form after task is created', async () => {
        const newTask = {
            id: '4',
            title: 'New Task',
            description: 'New Description',
            status: 'todo' as const,
            deadline: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        (api.createTask as any).mockResolvedValue(newTask);
        (api.getTasks as any).mockResolvedValue([]);

        render(<KanbanBoard darkMode={false} toggleDarkMode={mockToggleDarkMode} />);

        const titleInput = screen.getByTestId('new-task-title-input') as HTMLInputElement;
        const descriptionInput = screen.getByTestId('new-task-description-input') as HTMLTextAreaElement;
        const addButton = screen.getByTestId('add-task-button');

        fireEvent.change(titleInput, { target: { value: 'New Task' } });
        fireEvent.change(descriptionInput, { target: { value: 'New Description' } });
        fireEvent.click(addButton);

        await waitFor(() => {
            expect(titleInput.value).toBe('');
            expect(descriptionInput.value).toBe('');
        });
    });

    it('opens edit modal when edit button is clicked', async () => {
        (api.getTasks as any).mockResolvedValue(mockTasks);

        render(<KanbanBoard darkMode={false} toggleDarkMode={mockToggleDarkMode} />);

        await waitFor(() => {
            expect(screen.getByTestId('task-card-1')).toBeInTheDocument();
        });

        const editButton = screen.getByTestId('task-edit-button-1');
        fireEvent.click(editButton);

        await waitFor(() => {
            expect(screen.getByTestId('edit-task-modal')).toBeInTheDocument();
            expect(screen.getByTestId('edit-task-modal-content')).toBeInTheDocument();
        });
    });

    it('closes edit modal when cancel button is clicked', async () => {
        (api.getTasks as any).mockResolvedValue(mockTasks);

        render(<KanbanBoard darkMode={false} toggleDarkMode={mockToggleDarkMode} />);

        await waitFor(() => {
            expect(screen.getByTestId('task-card-1')).toBeInTheDocument();
        });

        const editButton = screen.getByTestId('task-edit-button-1');
        fireEvent.click(editButton);

        await waitFor(() => {
            expect(screen.getByTestId('edit-task-modal')).toBeInTheDocument();
        });

        const cancelButton = screen.getByTestId('cancel-edit-button');
        fireEvent.click(cancelButton);

        await waitFor(() => {
            expect(screen.queryByTestId('edit-task-modal')).not.toBeInTheDocument();
        });
    });

    it('updates task when save button is clicked', async () => {
        (api.getTasks as any).mockResolvedValue(mockTasks);
        (api.updateTask as any).mockResolvedValue(undefined);

        render(<KanbanBoard darkMode={false} toggleDarkMode={mockToggleDarkMode} />);

        await waitFor(() => {
            expect(screen.getByTestId('task-card-1')).toBeInTheDocument();
        });

        const editButton = screen.getByTestId('task-edit-button-1');
        fireEvent.click(editButton);

        await waitFor(() => {
            expect(screen.getByTestId('edit-task-modal')).toBeInTheDocument();
        });

        const titleInput = screen.getByTestId('edit-task-title-input');
        fireEvent.change(titleInput, { target: { value: 'Updated Task' } });

        const saveButton = screen.getByTestId('save-task-button');
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(api.updateTask).toHaveBeenCalled();
            expect(screen.queryByTestId('edit-task-modal')).not.toBeInTheDocument();
        });
    });

    it('deletes task when delete button is clicked', async () => {
        (api.getTasks as any).mockResolvedValue(mockTasks);
        (api.deleteTask as any).mockResolvedValue(undefined);

        render(<KanbanBoard darkMode={false} toggleDarkMode={mockToggleDarkMode} />);

        await waitFor(() => {
            expect(screen.getByTestId('task-card-1')).toBeInTheDocument();
        });

        const deleteButton = screen.getByTestId('task-delete-button-1');
        fireEvent.click(deleteButton);

        await waitFor(() => {
            expect(api.deleteTask).toHaveBeenCalledWith('1');
        });
    });

    it('applies dark mode styles', () => {
        render(<KanbanBoard darkMode={true} toggleDarkMode={mockToggleDarkMode} />);

        const board = screen.getByTestId('kanban-board');
        expect(board).toHaveClass('kt-theme-dark');
    });

    it('applies light mode styles', () => {
        render(<KanbanBoard darkMode={false} toggleDarkMode={mockToggleDarkMode} />);

        const board = screen.getByTestId('kanban-board');
        expect(board).toHaveClass('kt-theme-light');
    });

    it('has proper accessibility labels', () => {
        render(<KanbanBoard darkMode={false} toggleDarkMode={mockToggleDarkMode} />);

        expect(screen.getByTestId('theme-toggle-button')).toHaveAttribute('aria-label');
        expect(screen.getByTestId('new-task-title-input')).toHaveAttribute('aria-label');
        expect(screen.getByTestId('new-task-description-input')).toHaveAttribute('aria-label');
        expect(screen.getByTestId('new-task-deadline-input')).toHaveAttribute('aria-label');
        expect(screen.getByTestId('add-task-button')).toHaveAttribute('aria-label');
    });
});
