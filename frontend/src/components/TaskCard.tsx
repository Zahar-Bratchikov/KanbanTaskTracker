import React from 'react';
import { Task } from '../types/Task';

interface TaskCardProps {
    task: Task;
    onEdit: (task: Task) => void;
    onDelete: (id: string) => void;
    darkMode: boolean;
}

const statusColors: Record<Task['status'], string> = {
    todo: '#4f46e5',
    in_progress: '#f59e0b',
    done: '#10b981',
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, darkMode }) => {
    const isOverdue =
        task.deadline &&
        task.status !== 'done' &&
        new Date(task.deadline) < new Date();

    return (
        <div
            draggable
            onDragStart={(e) => e.dataTransfer.setData('taskId', task.id)}
            style={{
                background: darkMode ? '#1e293b' : 'white',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '12px',
                boxShadow: darkMode ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 6px rgba(0,0,0,0.08)',
                borderLeft: `4px solid ${isOverdue ? '#ef4444' : statusColors[task.status]}`,
                cursor: 'move',
                transition: 'box-shadow 0.2s, transform 0.1s',
                color: darkMode ? '#f1f5f9' : '#1e293b',
                border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = darkMode
                    ? '0 4px 16px rgba(0,0,0,0.4)'
                    : '0 4px 12px rgba(0,0,0,0.12)';
                e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = darkMode
                    ? '0 2px 8px rgba(0,0,0,0.3)'
                    : '0 2px 6px rgba(0,0,0,0.08)';
                e.currentTarget.style.transform = 'translateY(0)';
            }}
        >
            <h4 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: '600' }}>
                {task.title}
            </h4>
            <p style={{ margin: '0 0 12px', fontSize: '14px', color: darkMode ? '#94a3b8' : '#64748b', lineHeight: 1.4 }}>
                {task.description}
            </p>

            {/* Отображение дедлайна */}
            {task.deadline && (
                <div
                    style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: isOverdue
                            ? (darkMode ? '#fecaca' : '#ef4444')
                            : (darkMode ? '#fbbf24' : '#d97706'),
                        marginBottom: '8px',
                    }}
                >
                    🕒 {new Date(task.deadline).toLocaleString('ru-RU', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <small style={{ color: darkMode ? '#64748b' : '#94a3b8', fontSize: '12px' }}>
                    {new Date(task.updatedAt).toLocaleDateString()}
                </small>
                <div>
                    <button
                        onClick={() => onEdit(task)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: darkMode ? '#94a3b8' : '#64748b',
                            cursor: 'pointer',
                            marginRight: '8px',
                            padding: '4px',
                            borderRadius: '4px',
                            transition: 'background 0.2s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = darkMode ? '#334155' : '#f1f5f9')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                    >
                        ✏️
                    </button>
                    <button
                        onClick={() => onDelete(task.id)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            padding: '4px',
                            borderRadius: '4px',
                            transition: 'background 0.2s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = darkMode ? '#3b1111' : '#fef2f2')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                    >
                        🗑️
                    </button>
                </div>
            </div>
        </div>
    );
};