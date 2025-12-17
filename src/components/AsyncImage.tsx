"use client";

import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ImageDocument } from '@/types';
import { Loader2 } from 'lucide-react';

interface AsyncImageProps {
    imageId: string | undefined;
    alt: string;
    className?: string;
    placeholder?: React.ReactNode;
}

export const AsyncImage: React.FC<AsyncImageProps> = ({ imageId, alt, className, placeholder }) => {
    const [src, setSrc] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!imageId) {
            setSrc(null);
            return;
        }

        const fetchImage = async () => {
            setLoading(true);
            setError(false);
            try {
                // Check if we have it in memory/cache? For now direct fetch
                const docRef = doc(db, "image_store", imageId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data() as ImageDocument;
                    setSrc(data.base64);
                } else {
                    console.error("Image document not found:", imageId);
                    setError(true);
                }
            } catch (err) {
                console.error("Failed to load image:", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchImage();
    }, [imageId]);

    if (!imageId) {
        return <>{placeholder || <div className={`bg-gray-200 ${className}`} />}</>;
    }

    if (loading) {
        return (
            <div className={`flex items-center justify-center bg-gray-50 ${className}`}>
                <Loader2 className="animate-spin text-gray-300" size={16} />
            </div>
        );
    }

    if (error || !src) {
        return (
            <div className={`flex items-center justify-center bg-gray-100 text-gray-400 text-xs ${className}`}>
                !
            </div>
        );
    }

    return <img src={src} alt={alt} className={className} />;
};
