"use client";

import React from 'react';
import { AttendanceLog } from '@/types';
import { X, Calendar } from 'lucide-react';
import { AsyncImage } from './AsyncImage';

interface AttendanceDetailModalProps {
    log: AttendanceLog;
    isOpen: boolean;
    onClose: () => void;
}

export const AttendanceDetailModal: React.FC<AttendanceDetailModalProps> = ({ log, isOpen, onClose }) => {
    if (!isOpen) return null;

    const startDate = log.startDate.toDate().toLocaleDateString();
    const endDate = log.endDate.toDate().toLocaleDateString();

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <X size={20} />
                </button>

                <div className="mb-4 flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase
                        ${log.status === 'approved' ? 'bg-green-100 text-green-800' :
                            log.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {log.status}
                    </span>
                    <span className="text-xs text-gray-500">
                        Requested on {log.createdAt.toDate().toLocaleDateString()}
                    </span>
                </div>

                <div className="flex items-center gap-3 mb-6">
                    {log.userAvatarId ? (
                        <AsyncImage
                            imageId={log.userAvatarId}
                            alt={log.userName}
                            className="w-12 h-12 rounded-full object-cover border border-gray-200"
                        />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-gray-100">
                            {log.userName.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div>
                        <h3 className="font-bold text-gray-900">{log.userName}</h3>
                        <p className="text-sm text-gray-500 capitalize">{log.type} Leave</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <label className="text-xs text-gray-500 font-semibold uppercase mb-1 block">Duration</label>
                        <div className="flex items-center text-sm font-medium text-gray-800">
                            <Calendar size={14} className="mr-2 text-blue-500" />
                            {startDate} - {endDate}
                        </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <label className="text-xs text-gray-500 font-semibold uppercase mb-1 block">Reason</label>
                        <p className="text-sm text-gray-800 line-clamp-2">{log.reason}</p>
                    </div>
                </div>

                {log.proofId && (
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Proof of Leave</h3>
                        <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                            <AsyncImage
                                imageId={log.proofId}
                                alt="Leave Proof"
                                className="w-full h-auto max-h-64 object-contain"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
