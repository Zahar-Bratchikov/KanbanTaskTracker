import React, { useState, useEffect } from 'react';
import { Task, TaskStatus } from '../types/Task';
import { api } from '../services/api';
import { TaskCard } from './TaskCard';

const columns: { id: TaskStatus; title: string }[] = [
    { id: 'todo', title: 'To Do' },
    { id: 'in_progress', title: 'In Progress' },
    { id: 'done', title: 'Done' },
];

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

    const tasksByStatus = columns.reduce((acc, col) => {
        acc[col.id] = tasks.filter(t => t.status === col.id);
        return acc;
    }, {} as Record<TaskStatus, Task[]>);

    return (
        <div style={{ display: 'flex', padding: '20px', gap: '20px', fontFamily: 'sans-serif' }}>
            <div style={{ width: '300px' }}>
                <h3>Add New Task</h3>
                <input
                    value={newTask.title}
                    onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="Title"
                    style={{ width: '100%', marginBottom: '8px', padding: '6px' }}
                />
                <textarea
                    value={newTask.description}
                    onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                    placeholder="Description"
                    style={{ width: '100%', marginBottom: '8px', padding: '6px' }}
                />
                <button onClick={handleAddTask}>Add Task</button>
            </div>

            {columns.map(col => (
                <div key={col.id} style={{ width: '300px' }}>
                    <h3>{col.title}</h3>
                    <div
                        onDragOver={handleDragOver}
                        onDrop={e => handleDrop(col.id, e)}
                        style={{
                            minHeight: '400px',
                            background: '#fafafa',
                            padding: '8px',
                            borderRadius: '4px',
                            border: '1px dashed #ccc',
                        }}
                    >
                        {tasksByStatus[col.id].map(task => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                onEdit={setEditingTask}
                                onDelete={handleDeleteTask}
                            />
                        ))}
                    </div>
                </div>
            ))}

            {editingTask && (
                <div style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: 'white',
                    padding: '20px',
                    border: '1px solid #ccc',
                    zIndex: 1000,
                }}>
                    <h3>Edit Task</h3>
                    <input
                        value={editingTask.title}
                        onChange={e => setEditingTask({ ...editingTask, title: e.target.value })}
                        placeholder="Title"
                        style={{ width: '100%', marginBottom: '8px', padding: '6px' }}
                    />
                    <textarea
                        value={editingTask.description}
                        onChange={e => setEditingTask({ ...editingTask, description: e.target.value })}
                        placeholder="Description"
                        style={{ width: '100%', marginBottom: '8px', padding: '6px' }}
                    />
                    <div>
                        <button onClick={() => editingTask && handleUpdateTask(editingTask)}>Save</button>
                        <button onClick={() => setEditingTask(null)} style={{ marginLeft: '8px' }}>Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
};