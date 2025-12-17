import axios from 'axios';

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

if (!CLOUD_NAME || !UPLOAD_PRESET) {
    console.warn("Cloudinary environment variables are missing. Image uploads will fail.");
}

export const uploadToCloudinary = async (file: File): Promise<string> => {
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
        throw new Error("Missing Cloudinary configuration. Please check your environment variables.");
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    try {
        const response = await axios.post(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
            formData
        );

        if (response.data && response.data.secure_url) {
            return response.data.secure_url;
        } else {
            throw new Error("Invalid response from Cloudinary");
        }
    } catch (error) {
        console.error("Cloudinary upload failed:", error);
        throw new Error("Failed to upload image. Please try again.");
    }
};

export const getOptimizedUrl = (url: string, width?: number): string => {
    if (!url || !url.includes('cloudinary.com')) return url;

    // Simple transformation insertion
    // e.g. .../upload/v1234/... -> .../upload/f_auto,q_auto,w_{width}/v1234/...
    const params = ['f_auto', 'q_auto'];
    if (width) params.push(`w_${width}`);

    const transformation = params.join(',');

    return url.replace('/upload/', `/upload/${transformation}/`);
};
