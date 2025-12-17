"use client";

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import { uploadToCloudinary } from '@/utils/cloudinary';
import { Loader2, UploadCloud, User, Camera } from 'lucide-react';

export default function OnboardingPage() {
    const { user } = useAuth();
    const router = useRouter();

    const [name, setName] = useState(user?.displayName || '');
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selected = e.target.files[0];
            setFile(selected);
            setPreviewUrl(URL.createObjectURL(selected));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);

        try {
            let avatarUrl = '';

            if (file) {
                // Upload to Cloudinary
                avatarUrl = await uploadToCloudinary(file);
            } else if (user.photoURL) {
                avatarUrl = user.photoURL;
            }

            // Update Auth Profile
            await updateProfile(user, {
                displayName: name,
                photoURL: avatarUrl
            });

            // Create User Document in Firestore
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                name: name,
                email: user.email,
                avatarUrl: avatarUrl, // Cloudinary URL
                role: 'user',
                createdAt: serverTimestamp()
            });

            // Redirect
            router.refresh(); // Refresh to update AuthContext?
            router.push('/');
        } catch (error) {
            console.error("Onboarding failed", error);
            alert("Failed to setup profile.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden p-8">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome to TeamFlow</h1>
                    <p className="text-gray-500">Let's set up your profile.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Avatar Upload */}
                    <div className="flex flex-col items-center">
                        <div className="relative w-24 h-24 mb-4 group cursor-pointer">
                            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center">
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={40} className="text-gray-300" />
                                )}
                            </div>
                            <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-md hover:bg-blue-700 transition-colors cursor-pointer">
                                <Camera size={16} />
                                <input
                                    id="avatar-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </label>
                        </div>
                        <span className="text-sm text-gray-500">Upload a profile picture</span>
                    </div>

                    {/* Name Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                            placeholder="e.g. John Doe"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : 'Get Started'}
                    </button>
                </form>
            </div>
        </div>
    );
}
