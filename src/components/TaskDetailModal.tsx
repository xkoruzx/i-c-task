"use client";

import React from 'react';
import { Task } from '@/types';
import { X } from 'lucide-react';
import { AsyncImage } from './AsyncImage';

interface TaskDetailModalProps {
    task: Task;
    isOpen: boolean;
    onClose: () => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, isOpen, onClose }) => {
    if (!isOpen) return null;

    const displayName = task.assigneeSnapshot?.displayName || task.assignedToName || 'Unknown';
    const avatarId = task.assigneeSnapshot?.avatarId;

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <X size={20} />
                </button>

                <div className="mb-4">
                    <span className="text-xs font-semibold bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        FINISHED
                    </span>
                    <span className="ml-2 text-xs text-gray-500">
                        {task.completedAt?.toDate().toLocaleString()}
                    </span>
                </div>

                <h2 className="text-xl font-bold mb-2 text-gray-900">{task.title}</h2>
                <p className="text-gray-600 mb-6">{task.description}</p>

                <div className="border-t border-gray-100 pt-4 mb-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Completed By</h3>
                    <div className="flex items-center gap-3">
                        {avatarId ? (
                            <AsyncImage
                                imageId={avatarId}
                                alt={displayName}
                                className="w-10 h-10 rounded-full object-cover border border-gray-200"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold">
                                {displayName.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div>
                            <p className="text-sm font-medium text-gray-900">{displayName}</p>
                            <p className="text-xs text-gray-500">Team Member</p>
                        </div>
                    </div>
                </div>

                {task.completionComment && (
                    <div className="bg-gray-50 p-3 rounded-lg mb-4">
                        <p className="text-xs font-semibold text-gray-500 mb-1">COMMENT</p>
                        <p className="text-sm text-gray-700 italic">"{task.completionComment}"</p>
                    </div>
                )}

                {(task.proofImageUrl || task.proofId) && (
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Proof of Work</h3>
                        <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                            {task.proofImageUrl ? (
                                <img
                                    src={task.proofImageUrl}
                                    alt="Task Proof"
                                    className="w-full h-auto max-h-64 object-contain"
                                />
                            ) : (
                                <AsyncImage
                                    imageId={task.proofId!}
                                    alt="Task Proof"
                                    className="w-full h-auto max-h-64 object-contain"
                                />
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
