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

    const statusModifier = isOverdue ? 'overdue' : task.status === 'in_progress' ? 'in-progress' : task.status;

    return (
        <div
            className={`kt-task-card kt-task-card--${statusModifier} kt-theme-${theme} ${styles.card} ${styles[theme]} ${getStatusClass()}`}
            data-testid={`task-card-${task.id}`}
            data-task-id={task.id}
            data-task-status={task.status}
            data-task-overdue={isOverdue ? 'true' : 'false'}
            draggable
            onDragStart={(e) => e.dataTransfer.setData('taskId', task.id)}
        >
            <h4 className={`kt-task-card-title ${styles.title}`} data-testid={`task-card-title-${task.id}`}>
                {task.title}
            </h4>
            <p className={`kt-task-card-description ${styles.description} ${styles[theme]}`} data-testid={`task-card-description-${task.id}`}>
                {task.description}
            </p>

            {task.deadline && (
                <div
                    className={`kt-task-card-deadline ${styles.deadline} ${isOverdue ? styles.overdue : styles.normal} ${styles[theme]}`}
                    data-testid={`task-card-deadline-${task.id}`}
                    data-deadline={task.deadline}
                >
                    🕒 {new Date(task.deadline).toLocaleString('ru-RU', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </div>
            )}

            <div className={`kt-task-card-footer ${styles.footer}`} data-testid={`task-card-footer-${task.id}`}>
                <small className={`kt-task-card-updated ${styles.updatedDate} ${styles[theme]}`} data-testid={`task-card-updated-${task.id}`}>
                    {new Date(task.updatedAt).toLocaleDateString()}
                </small>
                <div className={`kt-task-card-actions ${styles.actions}`} data-testid={`task-card-actions-${task.id}`}>
                    <button
                        className={`kt-button kt-task-edit-button ${styles.editButton} ${styles[theme]}`}
                        onClick={() => onEdit(task)}
                        data-testid={`task-edit-button-${task.id}`}
                        aria-label={`Edit task ${task.title}`}
                    >
                        ✏️
                    </button>
                    <button
                        className={`kt-button kt-task-delete-button ${styles.deleteButton} ${styles[theme]}`}
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