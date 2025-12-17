import { Timestamp } from 'firebase/firestore';

export type UserRole = 'admin' | 'user';

export interface UserProfile {
    uid: string;
    name: string;
    email: string;
    avatarId?: string; // Reference to image_store (Legacy)
    avatarUrl?: string; // Cloudinary URL
    role: UserRole;
}

export type TaskStatus = 'available' | 'in_progress' | 'finished';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface AssigneeSnapshot {
    displayName: string;
    avatarId?: string; // Legacy
    avatarUrl?: string;
}

export interface Task {
    id: string;
    title: string;
    description: string;
    priority: TaskPriority;
    status: TaskStatus;
    assignedTo?: string; // User UID
    assignedToName?: string; // Legacy/Fallback
    assigneeSnapshot?: AssigneeSnapshot; // For consistent UI rendering
    createdAt: Timestamp;
    completedAt?: Timestamp;
    proofId?: string; // Reference to image_store (Legacy)
    proofImageUrl?: string; // Cloudinary URL
    completionComment?: string;
}

export type LeaveType = 'sick' | 'vacation' | 'personal' | 'other';
export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface AttendanceLog {
    id: string;
    userId: string;
    userName: string;
    userAvatarId?: string; // Snapshot for UI (Legacy)
    userAvatarUrl?: string; // Snapshot
    type: LeaveType;
    startDate: Timestamp;
    endDate: Timestamp;
    reason: string;
    proofId?: string; // Reference to image_store (Legacy)
    proofImageUrl?: string; // Cloudinary URL
    status: LeaveStatus;
    createdAt: Timestamp;
}

export type ImageRefType = 'profile' | 'task_proof' | 'attendance_proof';

export interface ImageDocument {
    id: string;
    base64: string;
    refType: ImageRefType;
    relatedId: string; // taskId or userId
    createdAt: Timestamp;
}
