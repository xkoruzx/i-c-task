"use client";

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, writeBatch, Timestamp, doc } from 'firebase/firestore';
import { Trash2, Calendar, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
    const { user } = useAuth();
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [deletedCount, setDeletedCount] = useState<number | null>(null);

    const handleCleanup = async () => {
        if (!startDate || !endDate) return alert("Please select a date range");
        if (!confirm("Are you sure you want to delete tasks AND linked images in this range? This cannot be undone.")) return;

        setLoading(true);
        setDeletedCount(null);

        try {
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);

            const batch = writeBatch(db);
            let count = 0;
            const proofIdsToDelete: string[] = [];

            // 1. Tasks
            const qTasks = query(
                collection(db, "tasks"),
                where("createdAt", ">=", Timestamp.fromDate(start)),
                where("createdAt", "<=", Timestamp.fromDate(end))
            );
            const taskSnapshot = await getDocs(qTasks);
            taskSnapshot.docs.forEach((d) => {
                batch.delete(d.ref);
                const data = d.data();
                if (data.proofId) proofIdsToDelete.push(data.proofId);
                count++;
            });

            // 2. Attendance
            const qAttendance = query(
                collection(db, "attendance_logs"),
                where("createdAt", ">=", Timestamp.fromDate(start)),
                where("createdAt", "<=", Timestamp.fromDate(end))
            );
            const attendanceSnapshot = await getDocs(qAttendance);
            attendanceSnapshot.docs.forEach((d) => {
                batch.delete(d.ref);
                const data = d.data();
                if (data.proofId) proofIdsToDelete.push(data.proofId);
                count++;
            });

            // 3. Images (Deduplicated)
            const uniqueProofIds = Array.from(new Set(proofIdsToDelete));
            uniqueProofIds.forEach((id) => {
                // Manually construct ref since we imported doc properly (aliased if needed, but here variable shadowing was resolved by renaming loop var to 'd')
                const imgRef = doc(db, "image_store", id);
                batch.delete(imgRef);
            });

            if (count === 0 && uniqueProofIds.length === 0) {
                setDeletedCount(0);
            } else {
                await batch.commit();
                setDeletedCount(count + uniqueProofIds.length);
            }

        } catch (error) {
            console.error("Cleanup failed", error);
            alert("Cleanup failed. See console for details.");
        } finally {
            setLoading(false);
        }
    };

    // ... Render ...
    // Since this file is getting complicated with logic fixes, let's rewrite the logic cleanly in the call.
    return (
        // ... (Same UI as before, mostly) ...
        <div className="min-h-screen bg-gray-50 p-8 font-[family-name:var(--font-geist-sans)]">
            <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                    <Link href="/" className="text-gray-500 hover:text-gray-800 flex items-center mb-4 transition-colors">
                        <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-500 mt-2">Manage system data and storage retention.</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-red-100 p-2 rounded-lg">
                            <Trash2 className="text-red-600" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800">Data Cleanup</h2>
                            <p className="text-sm text-gray-500">Delete tasks and attendance logs in range (includes images).</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                <input
                                    type="date"
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                <input
                                    type="date"
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleCleanup}
                        disabled={loading}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin mr-2" size={20} /> Processing...
                            </>
                        ) : (
                            <>
                                <Trash2 className="mr-2" size={20} /> Delete Data in Range
                            </>
                        )}
                    </button>

                    {deletedCount !== null && (
                        <div className={`mt-4 p-4 rounded-lg flex items-center ${deletedCount > 0 ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            <span className="font-medium">
                                {deletedCount > 0 ? `Successfully deleted ${deletedCount} items (and related images).` : "No items found in range."}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
