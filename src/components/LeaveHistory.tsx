"use client";

import { useEffect, useState } from "react";
import { collection, query, where, orderBy, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Clock } from "lucide-react";

interface LeaveLog {
    id: string;
    type: string;
    startDateTime: Timestamp;
    endDateTime: Timestamp;
    reason: string;
    proofImageUrl: string;
    createdAt: Timestamp;
}

export default function LeaveHistory({ refreshTrigger }: { refreshTrigger: number }) {
    const { user } = useAuth();
    const [logs, setLogs] = useState<LeaveLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            if (!user) return;
            try {
                const q = query(
                    collection(db, "attendance_logs"),
                    where("userId", "==", user.uid),
                    orderBy("createdAt", "desc")
                );
                const snapshot = await getDocs(q);
                const data = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as LeaveLog[];
                setLogs(data);
            } catch (error) {
                console.error("Error fetching leave logs:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, [user, refreshTrigger]);

    if (loading) return <div className="text-center text-gray-500 py-4">Loading history...</div>;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-indigo-600" />
                Your Leave History
            </h3>

            <div className="space-y-4">
                {logs.length === 0 ? (
                    <p className="text-gray-500 text-sm">No leave records found.</p>
                ) : (
                    logs.map((log) => (
                        <div key={log.id} className="border-b border-gray-100 last:border-0 pb-3 last:pb-0">
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-indigo-100 text-indigo-700 capitalize mb-1">
                                        {log.type.replace("_", " ")}
                                    </span>
                                    <p className="text-sm text-gray-600">
                                        {log.startDateTime.toDate().toLocaleDateString()} - {log.endDateTime.toDate().toLocaleDateString()}
                                    </p>
                                </div>
                                <a href={log.proofImageUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">
                                    View Proof
                                </a>
                            </div>
                            <p className="text-sm text-gray-500 mt-1 italic">"{log.reason}"</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
