"use client";

import React, { useState } from 'react';
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";

interface ImageWithZoomProps {
    src: string;
    alt: string;
    className?: string;
}

export const ImageWithZoom: React.FC<ImageWithZoomProps> = ({ src, alt, className }) => {
    const [open, setOpen] = useState(false);

    return (
        <>
            <div
                className={`cursor-zoom-in relative group overflow-hidden ${className}`}
                onClick={() => setOpen(true)}
            >
                <img
                    src={src}
                    alt={alt}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* Overlay Hint */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <span className="bg-black/60 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                        Click to Zoom
                    </span>
                </div>
            </div>

            styles={{ container: { zIndex: 9999 } }}
            />
        </>
    );
};
