"use client";

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { addDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { uploadToCloudinary } from '@/utils/cloudinary';
import { LeaveType } from '@/types';
import { Loader2, UploadCloud } from 'lucide-react';

export const LeaveRequestForm = () => {
    const { user, userProfile } = useAuth();

    const [type, setType] = useState<LeaveType>('personal');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('');
    const [file, setFile] = useState<File | null>(null);

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        if (!file) {
            setError("Proof image is required");
            return;
        }

        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            // 1. Upload to Cloudinary
            const proofUrl = await uploadToCloudinary(file);

            // 2. Save Log with Cloudinary URL
            await addDoc(collection(db, "attendance_logs"), {
                userId: user.uid,
                userName: userProfile?.name || user.displayName || 'Unknown',
                userAvatarUrl: userProfile?.avatarUrl,
                userAvatarId: userProfile?.avatarId || null, // Legacy Snapshot
                type,
                startDate: Timestamp.fromDate(new Date(startDate)),
                endDate: Timestamp.fromDate(new Date(endDate)),
                reason,
                proofImageUrl: proofUrl, // Cloudinary URL
                proofId: null, // Clear Legacy
                status: 'pending',
                createdAt: serverTimestamp()
            });

            setSuccess(true);
            setReason('');
            setFile(null);
            // Dates keep state usually or reset? let's keep for convenience or reset
            setStartDate('');
            setEndDate('');
        } catch (err: any) {
            console.error(err);
            setError("Failed to submit request.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">New Leave Request</h2>

            {success && (
                <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-4 text-sm">
                    Request submitted successfully!
                </div>
            )}
            {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value as LeaveType)}
                        className="w-full border rounded-lg p-2.5 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="sick">Sick Leave</option>
                        <option value="vacation">Vacation</option>
                        <option value="personal">Personal Leave</option>
                        <option value="other">Other</option>
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                            type="date"
                            required
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input
                            type="date"
                            required
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                    <textarea
                        required
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Why do you need leave?"
                        rows={3}
                        className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Proof (Required)</label>
                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors relative cursor-pointer">
                        <input
                            type="file"
                            required
                            accept="image/*"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        {file ? (
                            <span className="text-sm text-green-600 font-medium truncate block">{file.name}</span>
                        ) : (
                            <div className="flex flex-col items-center text-gray-400">
                                <UploadCloud size={20} className="mb-1" />
                                <span className="text-xs">Upload Document</span>
                            </div>
                        )}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg flex items-center justify-center transition-colors shadow-sm"
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : 'Submit Request'}
                </button>
            </form>
        </div>
    );
};
