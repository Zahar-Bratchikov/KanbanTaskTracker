import React, { useState, useEffect } from 'react';
import { Task, TaskStatus } from '../types/Task';
import { api } from '../services/api';
import { TaskCard } from './TaskCard';
import styles from '../styles/KanbanBoard.module.css';

const columnConfig: Record<TaskStatus, { title: string; light: string; dark: string }> = {
    todo: { title: 'To Do', light: '#e0e7ff', dark: '#1e293b' },
    in_progress: { title: 'In Progress', light: '#fef3c7', dark: '#1e293b' },
    done: { title: 'Done', light: '#d1fae5', dark: '#064e3b' },
};

interface KanbanBoardProps {
    darkMode: boolean;
    toggleDarkMode: () => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ darkMode, toggleDarkMode }) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        deadline: null as string | null,
    });

    const theme = darkMode ? 'dark' : 'light';

    useEffect(() => {
        loadTasks();
    }, []);

    const loadTasks = async () => {
        try {
            const data = await api.getTasks();
            setTasks(data);
        } catch (err) {
            console.error('Failed to load tasks', err);
        }
    };

    const handleDrop = async (status: TaskStatus, e: React.DragEvent) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData('taskId');
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        const updatedTask = { ...task, status };
        try {
            await api.updateTask(task.id, updatedTask);
            setTasks(prev => prev.map(t => t.id === task.id ? updatedTask : t));
        } catch (err) {
            console.error('Failed to update task status', err);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleAddTask = async () => {
        if (!newTask.title.trim()) return;
        try {
            const task = await api.createTask({
                title: newTask.title,
                description: newTask.description,
                status: 'todo',
                deadline: newTask.deadline,
            });
            setTasks(prev => [...prev, task]);
            setNewTask({ title: '', description: '', deadline: null });
        } catch (err) {
            console.error('Failed to add task', err);
        }
    };

    const handleUpdateTask = async (updated: Task) => {
        try {
            await api.updateTask(updated.id, updated);
            setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
            setEditingTask(null);
        } catch (err) {
            console.error('Failed to update task', err);
        }
    };

    const handleDeleteTask = async (id: string) => {
        try {
            await api.deleteTask(id);
            setTasks(prev => prev.filter(t => t.id !== id));
        } catch (err) {
            console.error('Failed to delete task', err);
        }
    };

    // Сортировка задач по дедлайну внутри каждого статуса
    const tasksByStatus = Object.keys(columnConfig).reduce((acc, statusKey) => {
        const status = statusKey as TaskStatus;
        const tasksInStatus = tasks.filter(t => t.status === status);
        const sorted = [...tasksInStatus].sort((a, b) => {
            if (!a.deadline && !b.deadline) return 0;
            if (!a.deadline) return 1;
            if (!b.deadline) return -1;
            return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        });
        acc[status] = sorted;
        return acc;
    }, {} as Record<TaskStatus, Task[]>);

    return (
        <div className={`${styles.board} ${styles[theme]}`} data-testid="kanban-board">
            <header className={`${styles.header} ${styles[theme]}`} data-testid="board-header">
                <div className={styles.headerContent}>
                    <h1 className={`${styles.title} ${styles[theme]}`} data-testid="board-title">
                        Kanban Task Tracker
                    </h1>
                    <button
                        className={`${styles.themeToggle} ${styles[theme]} theme-toggle-button`}
                        onClick={toggleDarkMode}
                        data-testid="theme-toggle-button"
                        aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                    >
                        {darkMode ? '☀️' : '🌙'}
                    </button>
                </div>
                <p className={`${styles.subtitle} ${styles[theme]}`} data-testid="board-subtitle">
                    Перетаскивайте задачи между колонками
                </p>
            </header>

            <div className={styles.boardContent} data-testid="board-content">
                {/* Форма добавления */}
                <div className={`${styles.newTaskForm} ${styles[theme]}`} data-testid="new-task-form">
                    <h3 className={`${styles.formTitle} ${styles[theme]}`}>
                        ➕ Новая задача
                    </h3>
                    <input
                        className={`${styles.input} ${styles[theme]} new-task-title-input`}
                        value={newTask.title}
                        onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                        placeholder="Название задачи"
                        data-testid="new-task-title-input"
                        aria-label="Task title"
                    />
                    <textarea
                        className={`${styles.textarea} ${styles[theme]} new-task-description-input`}
                        value={newTask.description}
                        onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                        placeholder="Описание (опционально)"
                        rows={3}
                        data-testid="new-task-description-input"
                        aria-label="Task description"
                    />
                    <input
                        className={`${styles.dateInput} ${styles[theme]} new-task-deadline-input`}
                        type="datetime-local"
                        value={newTask.deadline || ''}
                        onChange={e => setNewTask({ ...newTask, deadline: e.target.value || null })}
                        placeholder="Дедлайн"
                        data-testid="new-task-deadline-input"
                        aria-label="Task deadline"
                    />
                    <button
                        className={`${styles.addButton} ${styles[theme]} add-task-button`}
                        onClick={handleAddTask}
                        disabled={!newTask.title.trim()}
                        data-testid="add-task-button"
                        aria-label="Add task"
                    >
                        Добавить задачу
                    </button>
                </div>

                {/* Колонки */}
                {Object.entries(columnConfig).map(([status, config]) => {
                    const statusKey = status as TaskStatus;
                    const columnClass = status === 'in_progress' ? 'inProgress' : status;
                    
                    return (
                        <div 
                            key={status} 
                            className={styles.column}
                            data-testid={`column-${status}`}
                        >
                            <div className={`${styles.columnHeader} ${styles[columnClass]} ${styles[theme]}`}>
                                <h2 className={styles.columnTitle} data-testid={`column-title-${status}`}>
                                    {config.title}
                                </h2>
                                <span 
                                    className={`${styles.columnCount} ${styles[theme]}`}
                                    data-testid={`column-count-${status}`}
                                >
                                    {tasksByStatus[statusKey].length}
                                </span>
                            </div>
                            <div
                                className={`${styles.columnContent} ${styles[theme]} kanban-column`}
                                onDragOver={handleDragOver}
                                onDrop={e => handleDrop(statusKey, e)}
                                data-testid={`column-content-${status}`}
                                data-status={status}
                            >
                                {tasksByStatus[statusKey].length === 0 ? (
                                    <div 
                                        className={`${styles.emptyColumn} ${styles[theme]}`}
                                        data-testid={`empty-column-${status}`}
                                    >
                                        <div>📭 Нет задач</div>
                                        <div className={styles.emptyColumnText}>
                                            Перетащите сюда или создайте новую
                                        </div>
                                    </div>
                                ) : (
                                    tasksByStatus[statusKey].map(task => (
                                        <TaskCard
                                            key={task.id}
                                            task={task}
                                            onEdit={setEditingTask}
                                            onDelete={handleDeleteTask}
                                            darkMode={darkMode}
                                        />
                                    ))
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Модальное окно редактирования */}
            {editingTask && (
                <div
                    className={`${styles.modal} ${styles[theme]}`}
                    onClick={() => setEditingTask(null)}
                    data-testid="edit-task-modal"
                >
                    <div
                        className={`${styles.modalContent} ${styles[theme]}`}
                        onClick={e => e.stopPropagation()}
                        data-testid="edit-task-modal-content"
                    >
                        <h3 className={`${styles.modalTitle} ${styles[theme]}`}>
                            Редактировать задачу
                        </h3>
                        <input
                            className={`${styles.input} ${styles[theme]} edit-task-title-input`}
                            value={editingTask.title}
                            onChange={e => setEditingTask({ ...editingTask, title: e.target.value })}
                            placeholder="Название задачи"
                            data-testid="edit-task-title-input"
                            aria-label="Edit task title"
                        />
                        <textarea
                            className={`${styles.textarea} ${styles[theme]} edit-task-description-input`}
                            value={editingTask.description}
                            onChange={e => setEditingTask({ ...editingTask, description: e.target.value })}
                            placeholder="Описание"
                            rows={4}
                            data-testid="edit-task-description-input"
                            aria-label="Edit task description"
                        />
                        <input
                            className={`${styles.dateInput} ${styles[theme]} edit-task-deadline-input`}
                            type="datetime-local"
                            value={editingTask.deadline || ''}
                            onChange={e => setEditingTask({ ...editingTask, deadline: e.target.value || null })}
                            placeholder="Дедлайн"
                            data-testid="edit-task-deadline-input"
                            aria-label="Edit task deadline"
                        />
                        <div className={styles.modalButtons}>
                            <button
                                className={`${styles.saveButton} save-task-button`}
                                onClick={() => editingTask && handleUpdateTask(editingTask)}
                                data-testid="save-task-button"
                                aria-label="Save task"
                            >
                                Сохранить
                            </button>
                            <button
                                className={`${styles.cancelButton} ${styles[theme]} cancel-edit-button`}
                                onClick={() => setEditingTask(null)}
                                data-testid="cancel-edit-button"
                                aria-label="Cancel editing"
                            >
                                Отмена
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
