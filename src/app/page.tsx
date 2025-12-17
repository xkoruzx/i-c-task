"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    addDoc,
    updateDoc,
    doc,
    serverTimestamp
} from 'firebase/firestore';
import { Task, TaskPriority } from '@/types';
import { TaskBoard } from '@/components/TaskBoard';
import { AddTaskModal } from '@/components/AddTaskModal';
import { TaskFinishModal } from '@/components/TaskFinishModal';
import { TaskDetailModal } from '@/components/TaskDetailModal';
import { AsyncImage } from '@/components/AsyncImage';
import Link from 'next/link';
import { LogOut, Plus, Calendar, CheckCircle2, LayoutGrid, Clock, Sun } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Home() {
    const { user, userProfile, loading } = useAuth();
    const router = useRouter();

    const [tasks, setTasks] = useState<Task[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [finishModalOpen, setFinishModalOpen] = useState(false);
    const [selectedTaskToFinish, setSelectedTaskToFinish] = useState<Task | null>(null);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedTaskToView, setSelectedTaskToView] = useState<Task | null>(null);

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/login');
            } else if (!userProfile) {
                router.push('/onboarding');
            }
        }
    }, [user, userProfile, loading, router]);

    useEffect(() => {
        if (!user) return;
        const q = query(collection(db, "tasks"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const tasksData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Task[];
            setTasks(tasksData);
        });
        return () => unsubscribe();
    }, [user]);

    const handleLogout = async () => {
        await signOut(auth);
        router.push('/login');
    };

    const handleAddTask = async (title: string, description: string, priority: TaskPriority) => {
        if (!user) return;
        await addDoc(collection(db, "tasks"), {
            title,
            description,
            priority,
            status: 'available',
            createdAt: serverTimestamp(),
            createdBy: user.uid,
        });
    };

    const handleClaimTask = async (task: Task) => {
        if (!user) return;
        const snapshot = {
            displayName: userProfile?.name || user.displayName || 'Unknown',
            avatarUrl: userProfile?.avatarUrl,
            avatarId: userProfile?.avatarId
        };
        await updateDoc(doc(db, "tasks", task.id), {
            status: 'in_progress',
            assignedTo: user.uid,
            assignedToName: snapshot.displayName,
            assigneeSnapshot: snapshot
        });
    };

    const handleReleaseTask = async (task: Task) => {
        if (!user) return;
        if (confirm(`Release "${task.title}" back to available?`)) {
            await updateDoc(doc(db, "tasks", task.id), {
                status: 'available',
                assignedTo: null,
                assignedToName: null,
                assigneeSnapshot: null
            });
        }
    };

    const handleOpenFinishModal = (task: Task) => {
        setSelectedTaskToFinish(task);
        setFinishModalOpen(true);
    };

    const handleConfirmFinish = async (taskId: string, proofUrl: string, comment: string) => {
        if (!taskId) return;
        await updateDoc(doc(db, "tasks", taskId), {
            status: 'finished',
            completedAt: serverTimestamp(),
            proofImageUrl: proofUrl, // Cloudinary URL
            proofId: null, // Clear legacy ID if any
            completionComment: comment
        });
        setSelectedTaskToFinish(null);
    };

    const handleViewTask = (task: Task) => {
        setSelectedTaskToView(task);
        setViewModalOpen(true);
    };

    if (loading || !user || !userProfile) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500 font-medium animate-pulse">
            <Sun className="animate-spin text-orange-400 mr-2" />
            Waking up TeamFlow...
        </div>;
    }

    // Statistics for Bento Grid
    const tasksDone = tasks.filter(t => t.status === 'finished').length;
    const tasksInProgress = tasks.filter(t => t.status === 'in_progress' && t.assignedTo === user.uid).length;
    const tasksAvailable = tasks.filter(t => t.status === 'available').length;

    return (
        <div className="min-h-screen bg-cozy-bg font-sans pb-10 flex flex-col">
            {/* 1. Floating Island Navbar */}
            <div className="sticky top-4 z-50 px-4 mb-6">
                <nav className="max-w-5xl mx-auto bg-white/90 backdrop-blur-md shadow-lg rounded-full px-6 py-3 flex justify-between items-center border border-white/50">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 bg-gradient-to-tr from-sky-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                            IC
                        </div>
                        <span className="font-bold text-gray-700 hidden sm:block">I/C TASK</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 sm:gap-6">
                        {/* Navigation Links */}
                        <div className="flex items-center gap-2">
                            <Link href="/attendance" className="p-2 rounded-full text-gray-400 hover:text-sky-600 hover:bg-sky-50 transition-colors" title="Attendance">
                                <Calendar size={20} />
                            </Link>
                            <Link href="/admin" className="p-2 rounded-full text-gray-400 hover:text-coral-600 hover:bg-coral-50 transition-colors" title="Admin">
                                <LayoutGrid size={20} />
                            </Link>
                        </div>

                        <div className="h-6 w-px bg-gray-200"></div>

                        {/* User Profile */}
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                {(userProfile?.avatarUrl || userProfile?.avatarId) ? (
                                    userProfile.avatarUrl ? (
                                        <img
                                            src={userProfile.avatarUrl}
                                            alt={userProfile.name}
                                            className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-sm"
                                        />
                                    ) : (
                                        <AsyncImage
                                            imageId={userProfile.avatarId!}
                                            alt={userProfile.name}
                                            className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-sm"
                                        />
                                    )
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-butter-100 flex items-center justify-center text-butter-600 font-bold border border-white shadow-sm">
                                        {userProfile.name?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <span className="text-sm font-semibold text-gray-700 hidden md:block">
                                    {userProfile.name}
                                </span>
                            </div>
                        </div>

                        {/* Logout */}
                        <button
                            onClick={handleLogout}
                            className="p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </nav>
            </div>

            {/* 2. Welcome & Bento Stats */}
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2 mb-1">
                        Good Morning, {userProfile.name?.split(' ')[0]} <Sun className="text-orange-400 fill-orange-400" />
                    </h1>
                    <p className="text-gray-500">Here's what's happening today.</p>
                </div>

                {/* Bento Grid Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    {/* New Task Button - Big Card */}
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="md:col-span-1 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white text-left hover:scale-[1.02] transition-transform shadow-lg flex flex-col justify-between h-32 md:h-auto group"
                    >
                        <div className="bg-white/20 w-10 h-10 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                            <Plus size={24} />
                        </div>
                        <div>
                            <span className="block font-bold text-lg">New Task</span>
                            <span className="text-indigo-100 text-sm">Create something new</span>
                        </div>
                    </button>

                    {/* In Progress Stats */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-50 flex flex-col justify-between h-32 md:h-auto">
                        <div className="flex justify-between items-start">
                            <span className="text-gray-400 font-medium text-sm">My Active Tasks</span>
                            <Clock size={20} className="text-indigo-400" />
                        </div>
                        <span className="text-3xl font-bold text-gray-800">{tasksInProgress}</span>
                    </div>

                    {/* Done Stats */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-50 flex flex-col justify-between h-32 md:h-auto">
                        <div className="flex justify-between items-start">
                            <span className="text-gray-400 font-medium text-sm">Completed</span>
                            <CheckCircle2 size={20} className="text-matcha-600" />
                        </div>
                        <span className="text-3xl font-bold text-gray-800">{tasksDone}</span>
                    </div>

                    {/* Team Load */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-50 flex flex-col justify-between h-32 md:h-auto">
                        <div className="flex justify-between items-start">
                            <span className="text-gray-400 font-medium text-sm">To Do Pool</span>
                            <LayoutGrid size={20} className="text-gray-400" />
                        </div>
                        <span className="text-3xl font-bold text-gray-800">{tasksAvailable}</span>
                    </div>
                </div>

                {/* 3. Task Board */}
                <div className="h-[600px] bg-white/50 backdrop-blur-sm rounded-[40px] border border-white shadow-sm p-2 md:p-6 mb-8">
                    <TaskBoard
                        tasks={tasks}
                        onClaimTask={handleClaimTask}
                        onFinishTask={handleOpenFinishModal}
                        onReleaseTask={handleReleaseTask}
                        onClick={(task) => handleViewTask(task)}
                    />
                </div>
            </main>

            {/* Modals */}
            <AddTaskModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddTask}
            />

            {selectedTaskToFinish && (
                <TaskFinishModal
                    task={selectedTaskToFinish}
                    isOpen={finishModalOpen}
                    onClose={() => setFinishModalOpen(false)}
                    onConfirm={handleConfirmFinish}
                />
            )}

            {selectedTaskToView && (
                <TaskDetailModal
                    task={selectedTaskToView}
                    isOpen={viewModalOpen}
                    onClose={() => setViewModalOpen(false)}
                />
            )}
        </div>
    );
}
