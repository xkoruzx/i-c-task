"use client";

import React, { useState } from 'react';
import { Task } from '@/types';
import { X, Loader2, UploadCloud } from 'lucide-react';
import { uploadToCloudinary } from '@/utils/cloudinary';

interface TaskFinishModalProps {
    task: Task;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (taskId: string, proofUrl: string, comment: string) => Promise<void>;
}

export const TaskFinishModal: React.FC<TaskFinishModalProps> = ({ task, isOpen, onClose, onConfirm }) => {
    const [file, setFile] = useState<File | null>(null);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            setError('Please upload a proof image.');
            return;
        }
        if (!comment.trim()) {
            setError('Please add a completion comment.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // 1. Upload to Cloudinary
            const proofUrl = await uploadToCloudinary(file);

            // 2. Update Task
            await onConfirm(task.id, proofUrl, comment);

            alert('Task Finished Successfully!');
            onClose();
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to finish task.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300">
            <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <X size={20} />
                </button>

                <h2 className="text-xl font-bold mb-4">Finish Task</h2>
                <p className="text-sm text-gray-600 mb-4">"{task.title}"</p>

                {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Proof of Work (Image)
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            {file ? (
                                <div className="text-green-600 font-medium text-sm">
                                    {file.name}
                                </div>
                            ) : (
                                <div className="text-gray-500 flex flex-col items-center">
                                    <UploadCloud size={24} className="mb-2" />
                                    <span className="text-xs">Click to upload image</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Completion Comment
                        </label>
                        <textarea
                            required
                            className="w-full border rounded-md p-2 outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                            placeholder="Briefly describe what was done..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md font-medium"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium flex items-center"
                        >
                            {loading && <Loader2 className="animate-spin mr-2" size={16} />}
                            Complete Task
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
