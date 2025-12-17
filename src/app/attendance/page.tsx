"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AttendanceLog } from '@/types';
import { LeaveRequestForm } from '@/components/LeaveRequestForm';
import { AttendanceDetailModal } from '@/components/AttendanceDetailModal';
import { AsyncImage } from '@/components/AsyncImage';
import Link from 'next/link';
import { ArrowLeft, Thermometer, Palmtree, User, HelpCircle, Calendar, Clock } from 'lucide-react';

export default function AttendancePage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    const [logs, setLogs] = useState<AttendanceLog[]>([]);
    const [selectedLog, setSelectedLog] = useState<AttendanceLog | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    useEffect(() => {
        if (!user) return;
        const q = query(collection(db, "attendance_logs"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as AttendanceLog[];
            setLogs(data);
        });
        return () => unsubscribe();
    }, [user]);

    const handleLogClick = (log: AttendanceLog) => {
        setSelectedLog(log);
        setDetailOpen(true);
    };

    // Helper for Leave Icons
    const getLeaveIcon = (type: string) => {
        switch (type) {
            case 'sick': return <Thermometer className="text-coral-600" size={20} />;
            case 'vacation': return <Palmtree className="text-sky-600" size={20} />;
            case 'personal': return <User className="text-indigo-600" size={20} />;
            default: return <HelpCircle className="text-gray-400" size={20} />;
        }
    };

    // Helper for Leave Colors
    const getLeaveColor = (type: string) => {
        switch (type) {
            case 'sick': return 'bg-coral-100';
            case 'vacation': return 'bg-sky-100';
            case 'personal': return 'bg-indigo-100';
            default: return 'bg-gray-100';
        }
    };

    if (loading || !user) return null;

    return (
        <div className="min-h-screen bg-cozy-bg font-sans pb-10">
            {/* Header */}
            <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-800">
                            <ArrowLeft size={22} />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-gray-800">Attendance & Leave</h1>
                            <p className="text-xs text-gray-500">Manage time off requests</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Request Form (Now styled as a Panel) */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24">
                        <LeaveRequestForm />
                    </div>
                </div>

                {/* Right: Team History Timeline */}
                <div className="lg:col-span-2">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-1 h-6 bg-indigo-500 rounded-full"></div>
                        <h2 className="text-lg font-bold text-gray-800">Team Timeline</h2>
                    </div>

                    <div className="space-y-4">
                        {logs.length === 0 ? (
                            <div className="p-12 text-center text-gray-400 bg-white rounded-3xl border border-dashed border-gray-200">
                                <span className="block mb-2">🍃</span>
                                No leave records found.
                            </div>
                        ) : (
                            logs.map(log => (
                                <div
                                    key={log.id}
                                    onClick={() => handleLogClick(log)}
                                    className="group bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-100 transition-all cursor-pointer flex gap-4 items-start"
                                >
                                    {/* Date Box */}
                                    <div className="hidden sm:flex flex-col items-center justify-center w-16 h-16 bg-gray-50 rounded-xl border border-gray-100 flex-shrink-0">
                                        <span className="text-xs font-bold text-gray-400 uppercase">{log.startDate.toDate().toLocaleString('default', { month: 'short' })}</span>
                                        <span className="text-xl font-bold text-gray-800">{log.startDate.toDate().getDate()}</span>
                                    </div>

                                    {/* Main Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <div className="flex items-center gap-2">
                                                {(log.userAvatarUrl || log.userAvatarId) ? (
                                                    log.userAvatarUrl ? (
                                                        <img
                                                            src={log.userAvatarUrl}
                                                            alt={log.userName}
                                                            className="w-6 h-6 rounded-full object-cover ring-2 ring-white"
                                                        />
                                                    ) : (
                                                        <AsyncImage
                                                            imageId={log.userAvatarId!}
                                                            alt={log.userName}
                                                            className="w-6 h-6 rounded-full object-cover ring-2 ring-white"
                                                        />
                                                    )
                                                ) : (
                                                    <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-[10px] font-bold ring-2 ring-white">
                                                        {log.userName.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <span className="text-sm font-semibold text-gray-700">{log.userName}</span>
                                            </div>

                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${log.status === 'approved' ? 'bg-matcha-100 text-matcha-600' :
                                                log.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-butter-100 text-butter-600'
                                                }`}>
                                                {log.status}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 mb-2">
                                            <div className={`p-1.5 rounded-full ${getLeaveColor(log.type)}`}>
                                                {getLeaveIcon(log.type)}
                                            </div>
                                            <span className="font-bold text-gray-800 capitalize text-lg">{log.type} Leave</span>
                                        </div>

                                        <div className="flex items-center gap-4 text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Calendar size={12} />
                                                {log.startDate.toDate().toLocaleDateString()} - {log.endDate.toDate().toLocaleDateString()}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock size={12} />
                                                {Math.ceil((log.endDate.toDate().getTime() - log.startDate.toDate().getTime()) / (1000 * 60 * 60 * 24)) + 1} Days
                                            </span>
                                        </div>
                                    </div>

                                    {/* Arrow hint */}
                                    <div className="self-center text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
                                        →
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>

            {selectedLog && (
                <AttendanceDetailModal
                    log={selectedLog}
                    isOpen={detailOpen}
                    onClose={() => setDetailOpen(false)}
                />
            )}
        </div>
    );
}
