import React from 'react';
import { Task } from '@/types';
import { TaskColumn } from './TaskColumn';

interface TaskBoardProps {
    tasks: Task[];
    onClaimTask?: (task: Task) => void;
    onFinishTask?: (task: Task) => void;
    onReleaseTask?: (task: Task) => void;
    onClick?: (task: Task) => void;
}

export const TaskBoard: React.FC<TaskBoardProps> = ({ tasks, onClaimTask, onFinishTask, onReleaseTask, onClick }) => {
    const availableTasks = tasks.filter(t => t.status === 'available');
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
    const finishedTasks = tasks.filter(t => t.status === 'finished');

    return (
        <div className="flex h-full gap-6 overflow-x-auto pb-4 snap-x">
            <TaskColumn
                title="To Do"
                status="available"
                tasks={availableTasks}
                onClaimTask={onClaimTask}
            />
            <TaskColumn
                title="In Progress"
                status="in_progress"
                tasks={inProgressTasks}
                onFinishTask={onFinishTask}
                onReleaseTask={onReleaseTask}
            />
            <TaskColumn
                title="Done"
                status="finished"
                tasks={finishedTasks}
                onClick={onClick}
            />
        </div>
    );
};
