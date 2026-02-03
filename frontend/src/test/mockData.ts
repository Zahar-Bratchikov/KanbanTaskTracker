import { Task } from '../types/Task';

export const mockTasks: Task[] = [
    {
        id: '1',
        title: 'Test Task 1',
        description: 'Description for test task 1',
        status: 'todo',
        deadline: '2026-02-10T10:00:00',
        createdAt: '2026-02-01T10:00:00',
        updatedAt: '2026-02-01T10:00:00',
    },
    {
        id: '2',
        title: 'Test Task 2',
        description: 'Description for test task 2',
        status: 'in_progress',
        deadline: null,
        createdAt: '2026-02-01T11:00:00',
        updatedAt: '2026-02-01T11:00:00',
    },
    {
        id: '3',
        title: 'Test Task 3',
        description: 'Description for test task 3',
        status: 'done',
        deadline: '2026-01-30T10:00:00',
        createdAt: '2026-01-28T10:00:00',
        updatedAt: '2026-01-30T10:00:00',
    },
];

export const createMockTask = (overrides?: Partial<Task>): Task => ({
    id: '1',
    title: 'Mock Task',
    description: 'Mock Description',
    status: 'todo',
    deadline: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
});
