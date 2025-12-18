import React from 'react';
import { motion } from 'framer-motion';

export default function Reels() {
    // Dummy reel data – replace with real video URLs later
    const reels = [
        { id: 1, src: 'https://picsum.photos/seed/reel1/600/800', title: 'Reel 1' },
        { id: 2, src: 'https://picsum.photos/seed/reel2/600/800', title: 'Reel 2' },
        { id: 3, src: 'https://picsum.photos/seed/reel3/600/800', title: 'Reel 3' },
    ];

    return (
        <div className="min-h-screen bg-eugenia-grey flex flex-col items-center pt-4">
            <h1 className="text-2xl font-bold mb-4 text-eugenia-dark">Reels</h1>
            <div className="w-full max-w-md space-y-6">
                {reels.map((r) => (
                    <motion.div
                        key={r.id}
                        whileHover={{ scale: 1.05 }}
                        className="relative rounded-lg overflow-hidden shadow-instagram"
                    >
                        <img src={r.src} alt={r.title} className="w-full h-auto" />
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-30 p-2 text-white text-sm">
                            {r.title}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
