import React from 'react';
import { Task } from '../types/Task';
import styles from '../styles/TaskCard.module.css';

interface TaskCardProps {
    task: Task;
    onEdit: (task: Task) => void;
    onDelete: (id: string) => void;
    darkMode: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, darkMode }) => {
    const isOverdue =
        task.deadline &&
        task.status !== 'done' &&
        new Date(task.deadline) < new Date();

    const getStatusClass = () => {
        if (isOverdue) return styles.overdue;
        if (task.status === 'todo') return styles.todo;
        if (task.status === 'in_progress') return styles.inProgress;
        return styles.done;
    };

    const theme = darkMode ? 'dark' : 'light';

    return (
        <div
            data-testid={`task-card-${task.id}`}
            className={`${styles.card} ${styles[theme]} ${getStatusClass()} task-card`}
            draggable
            onDragStart={(e) => e.dataTransfer.setData('taskId', task.id)}
        >
            <h4 className={styles.title} data-testid="task-title">
                {task.title}
            </h4>
            <p className={`${styles.description} ${styles[theme]}`} data-testid="task-description">
                {task.description}
            </p>

            {task.deadline && (
                <div
                    className={`${styles.deadline} ${isOverdue ? styles.overdue : styles.normal} ${styles[theme]}`}
                    data-testid="task-deadline"
                >
                    🕒 {new Date(task.deadline).toLocaleString('ru-RU', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </div>
            )}

            <div className={styles.footer}>
                <small className={`${styles.updatedDate} ${styles[theme]}`} data-testid="task-updated-date">
                    {new Date(task.updatedAt).toLocaleDateString()}
                </small>
                <div className={styles.actions}>
                    <button
                        className={`${styles.editButton} ${styles[theme]} task-edit-button`}
                        onClick={() => onEdit(task)}
                        data-testid={`task-edit-button-${task.id}`}
                        aria-label={`Edit task ${task.title}`}
                    >
                        ✏️
                    </button>
                    <button
                        className={`${styles.deleteButton} ${styles[theme]} task-delete-button`}
                        onClick={() => onDelete(task.id)}
                        data-testid={`task-delete-button-${task.id}`}
                        aria-label={`Delete task ${task.title}`}
                    >
                        🗑️
                    </button>
                </div>
            </div>
        </div>
    );
};