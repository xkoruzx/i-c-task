import React from 'react';
import { TaskCard } from './TaskCard';
import { Task, TaskStatus } from '@/types';

interface TaskColumnProps {
    title: string;
    status: TaskStatus;
    tasks: Task[];
    onClaimTask?: (task: Task) => void;
    onFinishTask?: (task: Task) => void;
    onReleaseTask?: (task: Task) => void;
    onClick?: (task: Task) => void;
}

const columnStyles = {
    available: 'bg-gray-50/80 border-gray-100', // Subtle Gray
    in_progress: 'bg-indigo-50/50 border-indigo-100/50', // Subtle Indigo tint
    finished: 'bg-matcha-100/30 border-matcha-100/50' // Very subtle Green
};

export const TaskColumn: React.FC<TaskColumnProps> = ({ title, status, tasks, onClaimTask, onFinishTask, onReleaseTask, onClick }) => {
    return (
        <div className={`flex-1 min-w-[320px] rounded-3xl p-2 flex flex-col max-h-full border ${columnStyles[status]}`}>
            {/* Header */}
            <div className="p-4 flex justify-between items-center mb-2">
                <h2 className="font-bold text-gray-700 text-lg tracking-tight">{title}</h2>
                <span className="bg-white px-3 py-1 rounded-full text-xs text-gray-400 font-bold shadow-sm">
                    {tasks.length}
                </span>
            </div>

            {/* Scrollable Area */}
            <div className="overflow-y-auto flex-1 px-2 pb-2 custom-scrollbar">
                {tasks.map(task => (
                    <TaskCard
                        key={task.id}
                        task={task}
                        onClaim={onClaimTask}
                        onFinish={onFinishTask}
                        onRelease={onReleaseTask}
                        onClick={onClick}
                    />
                ))}

                {tasks.length === 0 && (
                    <div className="h-32 flex flex-col items-center justify-center text-gray-300 border-2 border-dashed border-gray-200 rounded-2xl m-2">
                        <span className="text-sm font-medium">Empty Tray</span>
                    </div>
                )}
            </div>
        </div>
    );
};
