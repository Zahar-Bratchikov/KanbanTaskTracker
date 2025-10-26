import React, { useState, useEffect } from 'react';
import { Task, TaskStatus } from '../types/Task';
import { api } from '../services/api';
import { TaskCard } from './TaskCard';

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
        <div
            style={{
                padding: '32px',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                background: darkMode ? '#0f172a' : '#f8fafc',
                minHeight: '100vh',
                color: darkMode ? '#f1f5f9' : '#1e293b',
                transition: 'background 0.3s ease',
            }}
        >
            <header
                style={{
                    textAlign: 'center',
                    marginBottom: '32px',
                    padding: '20px',
                    background: darkMode ? '#1e293b' : '#ffffff',
                    borderRadius: '16px',
                    boxShadow: darkMode ? '0 4px 12px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.06)',
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '700', color: darkMode ? '#f1f5f9' : '#1e293b' }}>
                        Kanban Task Tracker
                    </h1>
                    <button
                        onClick={toggleDarkMode}
                        style={{
                            background: darkMode ? '#334155' : '#e2e8f0',
                            border: 'none',
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: darkMode ? '#f1f5f9' : '#1e293b',
                            fontSize: '18px',
                            transition: 'background 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = darkMode ? '#475569' : '#cbd5e1';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = darkMode ? '#334155' : '#e2e8f0';
                        }}
                        aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                    >
                        {darkMode ? '☀️' : '🌙'}
                    </button>
                </div>
                <p style={{ color: darkMode ? '#94a3b8' : '#64748b', fontSize: '1.1rem', marginTop: '8px' }}>
                    Перетаскивайте задачи между колонками
                </p>
            </header>

            <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap' }}>
                {/* Форма добавления */}
                <div
                    style={{
                        width: '280px',
                        background: darkMode ? '#1e293b' : '#ffffff',
                        borderRadius: '16px',
                        padding: '20px',
                        boxShadow: darkMode ? '0 4px 12px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.06)',
                        border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                    }}
                >
                    <h3 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: '600', color: darkMode ? '#f1f5f9' : '#1e293b' }}>
                        ➕ Новая задача
                    </h3>
                    <input
                        value={newTask.title}
                        onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                        placeholder="Название задачи"
                        style={{
                            width: '100%',
                            padding: '10px 12px',
                            marginBottom: '12px',
                            border: darkMode ? '1px solid #334155' : '1px solid #cbd5e1',
                            borderRadius: '8px',
                            fontSize: '14px',
                            outline: 'none',
                            background: darkMode ? '#0f172a' : 'white',
                            color: darkMode ? '#f1f5f9' : '#1e293b',
                            transition: 'border 0.2s',
                            boxSizing: 'border-box',
                        }}
                        onFocus={(e) => {
                            e.currentTarget.style.border = darkMode ? '1px solid #4f46e5' : '1px solid #4f46e5';
                        }}
                        onBlur={(e) => {
                            e.currentTarget.style.border = darkMode ? '1px solid #334155' : '1px solid #cbd5e1';
                        }}
                    />
                    <textarea
                        value={newTask.description}
                        onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                        placeholder="Описание (опционально)"
                        rows={3}
                        style={{
                            width: '100%',
                            padding: '10px 12px',
                            marginBottom: '16px',
                            border: darkMode ? '1px solid #334155' : '1px solid #cbd5e1',
                            borderRadius: '8px',
                            fontSize: '14px',
                            outline: 'none',
                            resize: 'vertical',
                            background: darkMode ? '#0f172a' : 'white',
                            color: darkMode ? '#f1f5f9' : '#1e293b',
                            transition: 'border 0.2s',
                            boxSizing: 'border-box',
                        }}
                        onFocus={(e) => {
                            e.currentTarget.style.border = darkMode ? '1px solid #4f46e5' : '1px solid #4f46e5';
                        }}
                        onBlur={(e) => {
                            e.currentTarget.style.border = darkMode ? '1px solid #334155' : '1px solid #cbd5e1';
                        }}
                    />
                    <input
                        type="datetime-local"
                        value={newTask.deadline || ''}
                        onChange={e => setNewTask({ ...newTask, deadline: e.target.value || null })}
                        placeholder="Дедлайн"
                        style={{
                            width: '100%',
                            padding: '10px 12px',
                            marginBottom: '16px',
                            border: darkMode ? '1px solid #334155' : '1px solid #cbd5e1',
                            borderRadius: '8px',
                            fontSize: '14px',
                            outline: 'none',
                            background: darkMode ? '#0f172a' : 'white',
                            color: darkMode ? '#f1f5f9' : '#1e293b',
                            transition: 'border 0.2s',
                            boxSizing: 'border-box',
                        }}
                        onFocus={(e) => {
                            e.currentTarget.style.border = darkMode ? '1px solid #4f46e5' : '1px solid #4f46e5';
                        }}
                        onBlur={(e) => {
                            e.currentTarget.style.border = darkMode ? '1px solid #334155' : '1px solid #cbd5e1';
                        }}
                    />
                    <button
                        onClick={handleAddTask}
                        disabled={!newTask.title.trim()}
                        style={{
                            width: '100%',
                            padding: '10px',
                            background: newTask.title.trim() ? (darkMode ? '#4f46e5' : '#4f46e5') : (darkMode ? '#334155' : '#cbd5e1'),
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: newTask.title.trim() ? 'pointer' : 'not-allowed',
                            transition: 'background 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            if (newTask.title.trim()) {
                                e.currentTarget.style.background = darkMode ? '#4338ca' : '#4338ca';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (newTask.title.trim()) {
                                e.currentTarget.style.background = darkMode ? '#4f46e5' : '#4f46e5';
                            }
                        }}
                    >
                        Добавить задачу
                    </button>
                </div>

                {/* Колонки */}
                {Object.entries(columnConfig).map(([status, config]) => (
                    <div key={status} style={{ width: '320px' }}>
                        <div
                            style={{
                                background: darkMode ? config.dark : config.light,
                                borderRadius: '16px 16px 0 0',
                                padding: '12px 16px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                borderBottom: darkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                                color: darkMode ? '#f1f5f9' : '#1e293b',
                            }}
                        >
                            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
                                {config.title}
                            </h2>
                            <span
                                style={{
                                    background: darkMode ? '#334155' : 'white',
                                    color: darkMode ? '#94a3b8' : '#64748b',
                                    borderRadius: '50%',
                                    width: '24px',
                                    height: '24px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                }}
                            >
                                {tasksByStatus[status as TaskStatus].length}
                            </span>
                        </div>
                        <div
                            onDragOver={handleDragOver}
                            onDrop={e => handleDrop(status as TaskStatus, e)}
                            style={{
                                minHeight: '500px',
                                background: darkMode ? '#0f172a' : '#ffffff',
                                borderRadius: '0 0 16px 16px',
                                padding: '16px',
                                boxShadow: darkMode ? '0 4px 12px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.06)',
                                border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                                overflowY: 'auto',
                            }}
                        >
                            {tasksByStatus[status as TaskStatus].length === 0 ? (
                                <div style={{ textAlign: 'center', color: darkMode ? '#64748b' : '#94a3b8', padding: '20px 0' }}>
                                    <div>📭 Нет задач</div>
                                    <div style={{ fontSize: '12px', marginTop: '4px' }}>Перетащите сюда или создайте новую</div>
                                </div>
                            ) : (
                                tasksByStatus[status as TaskStatus].map(task => (
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
                ))}
            </div>

            {/* Модальное окно редактирования */}
            {editingTask && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        background: darkMode ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                    }}
                    onClick={() => setEditingTask(null)}
                >
                    <div
                        style={{
                            background: darkMode ? '#1e293b' : 'white',
                            borderRadius: '16px',
                            padding: '24px',
                            width: '400px',
                            maxWidth: '90vw',
                            boxShadow: darkMode ? '0 10px 30px rgba(0,0,0,0.5)' : '0 10px 25px rgba(0,0,0,0.2)',
                            border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <h3 style={{ margin: '0 0 20px', fontSize: '20px', fontWeight: '600', color: darkMode ? '#f1f5f9' : '#1e293b' }}>
                            Редактировать задачу
                        </h3>
                        <input
                            value={editingTask.title}
                            onChange={e => setEditingTask({ ...editingTask, title: e.target.value })}
                            placeholder="Название задачи"
                            style={{
                                width: '100%',
                                padding: '12px',
                                marginBottom: '16px',
                                border: darkMode ? '1px solid #334155' : '1px solid #cbd5e1',
                                borderRadius: '8px',
                                fontSize: '16px',
                                outline: 'none',
                                background: darkMode ? '#0f172a' : 'white',
                                color: darkMode ? '#f1f5f9' : '#1e293b',
                                transition: 'border 0.2s',
                                boxSizing: 'border-box',
                            }}
                            onFocus={(e) => {
                                e.currentTarget.style.border = darkMode ? '1px solid #4f46e5' : '1px solid #4f46e5';
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.border = darkMode ? '1px solid #334155' : '1px solid #cbd5e1';
                            }}
                        />
                        <textarea
                            value={editingTask.description}
                            onChange={e => setEditingTask({ ...editingTask, description: e.target.value })}
                            placeholder="Описание"
                            rows={4}
                            style={{
                                width: '100%',
                                padding: '12px',
                                marginBottom: '16px',
                                border: darkMode ? '1px solid #334155' : '1px solid #cbd5e1',
                                borderRadius: '8px',
                                fontSize: '14px',
                                outline: 'none',
                                resize: 'vertical',
                                background: darkMode ? '#0f172a' : 'white',
                                color: darkMode ? '#f1f5f9' : '#1e293b',
                                transition: 'border 0.2s',
                                boxSizing: 'border-box',
                            }}
                            onFocus={(e) => {
                                e.currentTarget.style.border = darkMode ? '1px solid #4f46e5' : '1px solid #4f46e5';
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.border = darkMode ? '1px solid #334155' : '1px solid #cbd5e1';
                            }}
                        />
                        <input
                            type="datetime-local"
                            value={editingTask.deadline || ''}
                            onChange={e => setEditingTask({ ...editingTask, deadline: e.target.value || null })}
                            placeholder="Дедлайн"
                            style={{
                                width: '100%',
                                padding: '12px',
                                marginBottom: '20px',
                                border: darkMode ? '1px solid #334155' : '1px solid #cbd5e1',
                                borderRadius: '8px',
                                fontSize: '14px',
                                outline: 'none',
                                background: darkMode ? '#0f172a' : 'white',
                                color: darkMode ? '#f1f5f9' : '#1e293b',
                                transition: 'border 0.2s',
                                boxSizing: 'border-box',
                            }}
                            onFocus={(e) => {
                                e.currentTarget.style.border = darkMode ? '1px solid #4f46e5' : '1px solid #4f46e5';
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.border = darkMode ? '1px solid #334155' : '1px solid #cbd5e1';
                            }}
                        />
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={() => editingTask && handleUpdateTask(editingTask)}
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    background: '#4f46e5',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'background 0.2s',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#4338ca';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = '#4f46e5';
                                }}
                            >
                                Сохранить
                            </button>
                            <button
                                onClick={() => setEditingTask(null)}
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    background: darkMode ? '#334155' : '#f1f5f9',
                                    color: darkMode ? '#f1f5f9' : '#1e293b',
                                    border: darkMode ? '1px solid #334155' : '1px solid #cbd5e1',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'background 0.2s',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = darkMode ? '#475569' : '#e2e8f0';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = darkMode ? '#334155' : '#f1f5f9';
                                }}
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