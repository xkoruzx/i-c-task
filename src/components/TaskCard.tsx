import React from 'react';
import { Task } from '@/types';
import { Clock, CheckCircle, RotateCcw, AlertCircle, Bookmark } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AsyncImage } from './AsyncImage';

interface TaskCardProps {
    task: Task;
    onClaim?: (task: Task) => void;
    onFinish?: (task: Task) => void;
    onRelease?: (task: Task) => void;
    onClick?: (task: Task) => void;
}

const priorityStyles = {
    low: 'bg-sky-100 text-sky-600',
    medium: 'bg-butter-100 text-butter-600',
    high: 'bg-coral-100 text-coral-600',
};

const priorityIcons = {
    low: <Bookmark size={12} />,
    medium: <Clock size={12} />,
    high: <AlertCircle size={12} />,
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClaim, onFinish, onRelease, onClick }) => {
    const { user } = useAuth();

    // Snapshot logic
    const displayName = task.assigneeSnapshot?.displayName || task.assignedToName || 'Unassigned';
    const avatarUrl = task.assigneeSnapshot?.avatarUrl;
    const avatarId = task.assigneeSnapshot?.avatarId;
    const isAssigned = !!task.assignedTo;

    // Permissions: Only assignee can finish
    const canFinish = user && task.assignedTo === user.uid;

    return (
        <div
            className={`
                group
                bg-white p-5 rounded-2xl shadow-sm border border-cozy-border 
                mb-4 transition-all duration-200 
                hover:shadow-md hover:scale-[1.02] active:scale-[0.98]
                ${task.status === 'finished' ? 'cursor-pointer opacity-80 hover:opacity-100' : ''}
            `}
            onClick={() => {
                if (task.status === 'finished' && onClick) onClick(task);
            }}
        >
            {/* Header: Priority Badge + Status Icon */}
            <div className="flex justify-between items-start mb-3">
                <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${priorityStyles[task.priority]}`}>
                    {priorityIcons[task.priority]}
                    {task.priority}
                </span>

                {task.status === 'in_progress' && (
                    <div className="w-2 h-2 rounded-full bg-matcha-600 animate-pulse shadow-[0_0_8px_rgba(5,150,105,0.4)]"></div>
                )}
            </div>

            {/* Content */}
            <h3 className="font-bold text-gray-800 mb-2 text-base leading-snug">{task.title}</h3>
            <p className="text-cozy-muted text-sm mb-4 line-clamp-2 leading-relaxed">{task.description}</p>

            {/* Footer: Avatar + Actions */}
            <div className="flex justify-between items-center pt-3 mt-1 border-t border-gray-50">
                <div className="flex items-center gap-2 max-w-[50%]">
                    {isAssigned ? (
                        <>
                            {avatarUrl || avatarId ? (
                                avatarUrl ? (
                                    <img
                                        src={avatarUrl}
                                        alt={displayName}
                                        className="w-7 h-7 rounded-full object-cover ring-2 ring-white shadow-sm"
                                    />
                                ) : (
                                    <AsyncImage
                                        imageId={avatarId!}
                                        alt={displayName}
                                        className="w-7 h-7 rounded-full object-cover ring-2 ring-white shadow-sm" // Ring for sticker effect
                                    />
                                )
                            ) : (
                                <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-[10px] text-gray-400 font-bold ring-2 ring-white">
                                    {displayName.charAt(0).toUpperCase()}
                                </div>
                            )}
                            {/* Hide name on small cards to keep clean, or show truncated */}
                            <span className="text-xs text-gray-400 font-medium truncate">{displayName.split(' ')[0]}</span>
                        </>
                    ) : (
                        <div className="flex items-center gap-1 text-gray-300">
                            <div className="w-7 h-7 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center">?</div>
                            <span className="text-xs italic">Free</span>
                        </div>
                    )}
                </div>

                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    {task.status === 'available' && onClaim && (
                        <button
                            onClick={() => onClaim(task)}
                            className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full hover:bg-indigo-100 font-bold transition-colors"
                        >
                            Claim
                        </button>
                    )}

                    {task.status === 'in_progress' && (
                        <>
                            {onRelease && (canFinish || !isAssigned) && (
                                <button
                                    onClick={() => onRelease(task)}
                                    className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                                    title="Release Task"
                                >
                                    <RotateCcw size={14} />
                                </button>
                            )}
                            {onFinish && canFinish && (
                                <button
                                    onClick={() => onFinish(task)}
                                    className="text-xs bg-matcha-100 text-matcha-600 px-3 py-1.5 rounded-full hover:bg-matcha-600 hover:text-white font-bold transition-all shadow-sm flex items-center gap-1"
                                >
                                    <CheckCircle size={12} />
                                    Done
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
