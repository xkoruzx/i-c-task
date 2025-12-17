import imageCompression from 'browser-image-compression';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ImageRefType } from '@/types';

export const compressAndConvertToBase64 = async (file: File): Promise<string> => {
    try {
        const options = {
            maxSizeMB: 0.5,
            maxWidthOrHeight: 1280,
            useWebWorker: true,
            initialQuality: 0.8
        };

        const compressedFile = await imageCompression(file, options);

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(compressedFile);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });
    } catch (error) {
        console.error("Image compression failed:", error);
        throw error;
    }
};

export async function saveImageToStore(file: File, refType: ImageRefType, relatedId: string): Promise<string> {
    const base64 = await compressAndConvertToBase64(file);

    // Save to separate collection
    const docRef = await addDoc(collection(db, "image_store"), {
        base64,
        refType,
        relatedId,
        createdAt: serverTimestamp()
    });

    return docRef.id;
}
