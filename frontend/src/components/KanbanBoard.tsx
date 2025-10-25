import React, { useState, useEffect } from 'react';
import { Task, TaskStatus } from '../types/Task';
import { api } from '../services/api';
import { TaskCard } from './TaskCard';

const columnConfig: Record<TaskStatus, { title: string; color: string }> = {
    todo: { title: 'To Do', color: '#e0e7ff' },
    in_progress: { title: 'In Progress', color: '#fef3c7' },
    done: { title: 'Done', color: '#d1fae5' },
};

export const KanbanBoard: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [newTask, setNewTask] = useState({ title: '', description: '' });

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
            });
            setTasks(prev => [...prev, task]);
            setNewTask({ title: '', description: '' });
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

    const tasksByStatus = Object.keys(columnConfig).reduce((acc, statusKey) => {
        const status = statusKey as TaskStatus;
        acc[status] = tasks.filter(t => t.status === status);
        return acc;
    }, {} as Record<TaskStatus, Task[]>);

    return (
        <div style={{ padding: '32px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            <header style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '700', color: '#1e293b' }}>Kanban Task Tracker</h1>
                <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Перетаскивайте задачи между колонками</p>
            </header>

            <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap' }}>
                {/* Форма добавления */}
                <div style={{ width: '280px', background: '#f8fafc', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                    <h3 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>➕ Новая задача</h3>
                    <input
                        value={newTask.title}
                        onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                        placeholder="Название задачи"
                        style={{
                            width: '100%',
                            padding: '10px 12px',
                            marginBottom: '12px',
                            border: '1px solid #cbd5e1',
                            borderRadius: '8px',
                            fontSize: '14px',
                            outline: 'none',
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
                            border: '1px solid #cbd5e1',
                            borderRadius: '8px',
                            fontSize: '14px',
                            outline: 'none',
                            resize: 'vertical',
                        }}
                    />
                    <button
                        onClick={handleAddTask}
                        disabled={!newTask.title.trim()}
                        style={{
                            width: '100%',
                            padding: '10px',
                            background: newTask.title.trim() ? '#4f46e5' : '#cbd5e1',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: newTask.title.trim() ? 'pointer' : 'not-allowed',
                            transition: 'background 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            if (newTask.title.trim()) e.currentTarget.style.background = '#4338ca';
                        }}
                        onMouseLeave={(e) => {
                            if (newTask.title.trim()) e.currentTarget.style.background = '#4f46e5';
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
                                background: config.color,
                                borderRadius: '16px 16px 0 0',
                                padding: '12px 16px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}
                        >
                            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>
                                {config.title}
                            </h2>
                            <span
                                style={{
                                    background: 'white',
                                    color: '#64748b',
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
                                background: '#f8fafc',
                                borderRadius: '0 0 16px 16px',
                                padding: '16px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                border: '1px dashed #cbd5e1',
                            }}
                        >
                            {tasksByStatus[status as TaskStatus].length === 0 ? (
                                <div style={{ textAlign: 'center', color: '#94a3b8', padding: '20px 0' }}>
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
                        background: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                    }}
                    onClick={() => setEditingTask(null)}
                >
                    <div
                        style={{
                            background: 'white',
                            borderRadius: '16px',
                            padding: '24px',
                            width: '400px',
                            maxWidth: '90vw',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <h3 style={{ margin: '0 0 20px', fontSize: '20px', fontWeight: '600', color: '#1e293b' }}>
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
                                border: '1px solid #cbd5e1',
                                borderRadius: '8px',
                                fontSize: '16px',
                                outline: 'none',
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
                                marginBottom: '20px',
                                border: '1px solid #cbd5e1',
                                borderRadius: '8px',
                                fontSize: '14px',
                                outline: 'none',
                                resize: 'vertical',
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
                                }}
                            >
                                Сохранить
                            </button>
                            <button
                                onClick={() => setEditingTask(null)}
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    background: '#f1f5f9',
                                    color: '#1e293b',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
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