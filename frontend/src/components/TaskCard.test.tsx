import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../test/test-utils';
import { TaskCard } from './TaskCard';
import { createMockTask } from '../test/mockData';

describe('TaskCard', () => {
    const mockOnEdit = vi.fn();
    const mockOnDelete = vi.fn();

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('renders task card with all information', () => {
        const task = createMockTask({
            id: '1',
            title: 'Test Task',
            description: 'Test Description',
            status: 'todo',
        });

        render(
            <TaskCard
                task={task}
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
                darkMode={false}
            />
        );

        expect(screen.getByTestId('task-card-1')).toBeInTheDocument();
        expect(screen.getByTestId('task-title')).toHaveTextContent('Test Task');
        expect(screen.getByTestId('task-description')).toHaveTextContent('Test Description');
    });

    it('displays deadline when present', () => {
        const task = createMockTask({
            deadline: '2026-02-10T10:00:00',
        });

        render(
            <TaskCard
                task={task}
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
                darkMode={false}
            />
        );

        expect(screen.getByTestId('task-deadline')).toBeInTheDocument();
    });

    it('does not display deadline when not present', () => {
        const task = createMockTask({
            deadline: null,
        });

        render(
            <TaskCard
                task={task}
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
                darkMode={false}
            />
        );

        expect(screen.queryByTestId('task-deadline')).not.toBeInTheDocument();
    });

    it('calls onEdit when edit button is clicked', () => {
        const task = createMockTask({ id: '1' });

        render(
            <TaskCard
                task={task}
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
                darkMode={false}
            />
        );

        const editButton = screen.getByTestId('task-edit-button-1');
        fireEvent.click(editButton);

        expect(mockOnEdit).toHaveBeenCalledWith(task);
        expect(mockOnEdit).toHaveBeenCalledTimes(1);
    });

    it('calls onDelete when delete button is clicked', () => {
        const task = createMockTask({ id: '1' });

        render(
            <TaskCard
                task={task}
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
                darkMode={false}
            />
        );

        const deleteButton = screen.getByTestId('task-delete-button-1');
        fireEvent.click(deleteButton);

        expect(mockOnDelete).toHaveBeenCalledWith('1');
        expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });

    it('applies correct status class for todo', () => {
        const task = createMockTask({ status: 'todo' });

        render(
            <TaskCard
                task={task}
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
                darkMode={false}
            />
        );

        const card = screen.getByTestId(`task-card-${task.id}`);
        expect(card).toHaveClass('todo');
    });

    it('applies correct status class for in_progress', () => {
        const task = createMockTask({ status: 'in_progress' });

        render(
            <TaskCard
                task={task}
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
                darkMode={false}
            />
        );

        const card = screen.getByTestId(`task-card-${task.id}`);
        expect(card).toHaveClass('inProgress');
    });

    it('applies correct status class for done', () => {
        const task = createMockTask({ status: 'done' });

        render(
            <TaskCard
                task={task}
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
                darkMode={false}
            />
        );

        const card = screen.getByTestId(`task-card-${task.id}`);
        expect(card).toHaveClass('done');
    });

    it('applies overdue class when task is overdue', () => {
        const task = createMockTask({
            status: 'todo',
            deadline: '2020-01-01T10:00:00', // Past date
        });

        render(
            <TaskCard
                task={task}
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
                darkMode={false}
            />
        );

        const card = screen.getByTestId(`task-card-${task.id}`);
        expect(card).toHaveClass('overdue');
    });

    it('does not apply overdue class for done tasks', () => {
        const task = createMockTask({
            status: 'done',
            deadline: '2020-01-01T10:00:00', // Past date
        });

        render(
            <TaskCard
                task={task}
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
                darkMode={false}
            />
        );

        const card = screen.getByTestId(`task-card-${task.id}`);
        expect(card).not.toHaveClass('overdue');
    });

    it('applies dark mode styles when darkMode is true', () => {
        const task = createMockTask();

        render(
            <TaskCard
                task={task}
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
                darkMode={true}
            />
        );

        const card = screen.getByTestId(`task-card-${task.id}`);
        expect(card).toHaveClass('dark');
    });

    it('applies light mode styles when darkMode is false', () => {
        const task = createMockTask();

        render(
            <TaskCard
                task={task}
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
                darkMode={false}
            />
        );

        const card = screen.getByTestId(`task-card-${task.id}`);
        expect(card).toHaveClass('light');
    });

    it('is draggable', () => {
        const task = createMockTask({ id: '1' });

        render(
            <TaskCard
                task={task}
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
                darkMode={false}
            />
        );

        const card = screen.getByTestId('task-card-1');
        expect(card).toHaveAttribute('draggable', 'true');
    });

    it('sets correct data on drag start', () => {
        const task = createMockTask({ id: '1' });

        render(
            <TaskCard
                task={task}
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
                darkMode={false}
            />
        );

        const card = screen.getByTestId('task-card-1');
        const mockDataTransfer = {
            setData: vi.fn(),
        };

        fireEvent.dragStart(card, { dataTransfer: mockDataTransfer });

        expect(mockDataTransfer.setData).toHaveBeenCalledWith('taskId', '1');
    });

    it('has proper accessibility labels', () => {
        const task = createMockTask({ id: '1', title: 'Test Task' });

        render(
            <TaskCard
                task={task}
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
                darkMode={false}
            />
        );

        const editButton = screen.getByTestId('task-edit-button-1');
        const deleteButton = screen.getByTestId('task-delete-button-1');

        expect(editButton).toHaveAttribute('aria-label', 'Edit task Test Task');
        expect(deleteButton).toHaveAttribute('aria-label', 'Delete task Test Task');
    });
});
