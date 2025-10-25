import React from 'react';
import { Task } from '../types/Task';

interface TaskCardProps {
    task: Task;
    onEdit: (task: Task) => void;
    onDelete: (id: string) => void;
}

const statusColors: Record<Task['status'], string> = {
    todo: '#4f46e5',        // indigo
    in_progress: '#f59e0b', // amber
    done: '#10b981',        // emerald
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete }) => {
    return (
        <div
            draggable
            onDragStart={(e) => e.dataTransfer.setData('taskId', task.id)}
            style={{
                background: 'white',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '12px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                borderLeft: `4px solid ${statusColors[task.status]}`,
                cursor: 'move',
                transition: 'box-shadow 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)')}
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.08)')}
        >
            <h4 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>
                {task.title}
            </h4>
            <p style={{ margin: '0 0 12px', fontSize: '14px', color: '#64748b', lineHeight: 1.4 }}>
                {task.description}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <small style={{ color: '#94a3b8', fontSize: '12px' }}>
                    {new Date(task.updatedAt).toLocaleDateString()}
                </small>
                <div>
                    <button
                        onClick={() => onEdit(task)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#64748b',
                            cursor: 'pointer',
                            marginRight: '8px',
                            padding: '4px',
                            borderRadius: '4px',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
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
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#fef2f2')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                    >
                        🗑️
                    </button>
                </div>
            </div>
        </div>
    );
};