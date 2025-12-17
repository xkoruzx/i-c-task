"use client";

import Header from "@/components/Header";
import LeaveRequestForm from "@/components/LeaveRequestForm";
import LeaveHistory from "@/components/LeaveHistory";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function LeavePage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [awayUsers, setAwayUsers] = useState<any[]>([]);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    // Fetch "Who is away today"
    useEffect(() => {
        const fetchAwayUsers = async () => {
            const today = new Date();
            const startOfDay = new Date(today.setHours(0, 0, 0, 0));
            const endOfDay = new Date(today.setHours(23, 59, 59, 999));

            // This is a simplified query. Ideally we check ranges overlaps.
            // Firestore simple query limitation: we check if startDateTime is today, or endDateTime is today.
            // A more robust solution requires multiple queries or a specialized structure.
            // For prototype, we'll just check if startDateTime is <= today and endDateTime >= today (client side filter)
            // Or just fetch logs from last 30 days and filter.

            // Let's implement a simple "Created recently" or similar for now, 
            // OR better: query attendance_logs where endDateTime >= now. 

            try {
                const q = query(
                    collection(db, "attendance_logs"),
                    where("endDateTime", ">=", Timestamp.fromDate(new Date()))
                );

                const snapshot = await getDocs(q);
                const activeLeaves = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter((log: any) => {
                        const start = log.startDateTime.toDate();
                        const end = log.endDateTime.toDate();
                        const now = new Date();
                        return start <= now && end >= now;
                    });

                setAwayUsers(activeLeaves);

            } catch (e) {
                console.error("Error fetching away users", e);
            }
        }
        fetchAwayUsers();
    }, [refreshTrigger]);


    if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="max-w-7xl mx-auto px-6 py-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-8">Leave & Attendance Management</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Form */}
                    <div className="lg:col-span-1">
                        <LeaveRequestForm onSuccess={() => setRefreshTrigger(prev => prev + 1)} />
                    </div>

                    {/* Right Column: History & Status */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Who is away Status */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Who is away today?</h3>
                            {awayUsers.length === 0 ? (
                                <p className="text-gray-500 text-sm">Everyone is present!</p>
                            ) : (
                                <div className="flex -space-x-2 overflow-hidden">
                                    {awayUsers.map(u => (
                                        <img
                                            key={u.userId}
                                            className="inline-block h-10 w-10 rounded-full ring-2 ring-white"
                                            src={u.userAvatar || `https://ui-avatars.com/api/?name=${u.userName}`}
                                            alt={u.userName}
                                            title={`${u.userName} is away (${u.type})`}
                                        />
                                    ))}
                                    <div className="ml-4 flex items-center text-sm text-gray-600">
                                        {awayUsers.map(u => u.userName).join(", ")}
                                    </div>
                                </div>
                            )}
                        </div>

                        <LeaveHistory refreshTrigger={refreshTrigger} />
                    </div>
                </div>
            </main>
        </div>
    );
}
