import { Task } from '../types/Task';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const api = {
    async getTasks(): Promise<Task[]> {
        const res = await fetch(`${API_URL}/api/tasks`);
        if (!res.ok) throw new Error('Failed to fetch tasks');
        return res.json();
    },

    async createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
        const res = await fetch(`${API_URL}/api/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(task),
        });
        if (!res.ok) throw new Error('Failed to create task');
        return res.json();
    },

    async updateTask(id: string, task: Partial<Task>): Promise<void> {
        const res = await fetch(`${API_URL}/api/tasks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(task),
        });
        if (!res.ok) throw new Error('Failed to update task');
    },

    async deleteTask(id: string): Promise<void> {
        const res = await fetch(`${API_URL}/api/tasks/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete task');
    },
};