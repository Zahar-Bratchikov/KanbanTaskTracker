import React from 'react';
import { Task } from '../types/Task';

interface TaskCardProps {
    task: Task;
    onEdit: (task: Task) => void;
    onDelete: (id: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete }) => {
    return (
        <div
            draggable
            onDragStart={(e) => e.dataTransfer.setData('taskId', task.id)}
            style={{
                padding: '12px',
                margin: '8px 0',
                background: '#f9f9f9',
                border: '1px solid #ddd',
                borderRadius: '6px',
                cursor: 'move',
            }}
        >
            <h4>{task.title}</h4>
            <p>{task.description}</p>
            <small>{new Date(task.updatedAt).toLocaleString()}</small>
            <div style={{ marginTop: '8px' }}>
                <button onClick={() => onEdit(task)} style={{ marginRight: '6px' }}>Edit</button>
                <button onClick={() => onDelete(task.id)} style={{ color: 'red' }}>Delete</button>
            </div>
        </div>
    );
};