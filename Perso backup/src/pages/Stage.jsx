import React, { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Play, Pause } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const reels = [
    {
        id: 1,
        student: "Alice M.",
        description: "Presenting my final year project on AI! 🤖 #AI #Tech",
        videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-1232-large.mp4", // Placeholder
        likes: 124,
        comments: 45
    },
    {
        id: 2,
        student: "Bob D.",
        description: "Hackathon weekend vibes at Station F 🚀 #Startup #Coding",
        videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-man-working-on-his-laptop-308-large.mp4", // Placeholder
        likes: 89,
        comments: 12
    },
    {
        id: 3,
        student: "Charlie T.",
        description: "Data Viz workshop was amazing today! 📊 #DataScience",
        videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-people-working-in-a-call-center-4842-large.mp4", // Placeholder
        likes: 256,
        comments: 67
    }
];

const VideoCard = ({ reel, isActive }) => {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        if (isActive) {
            videoRef.current.play();
            setIsPlaying(true);
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    }, [isActive]);

    const togglePlay = () => {
        if (isPlaying) {
            videoRef.current.pause();
        } else {
            videoRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    return (
        <div className="relative w-full h-[calc(100vh-4rem)] md:h-[600px] md:w-[350px] bg-black md:rounded-2xl overflow-hidden shadow-2xl snap-start shrink-0">
            {/* Video Element */}
            <video
                ref={videoRef}
                src={reel.videoUrl}
                className="w-full h-full object-cover cursor-pointer"
                loop
                muted // Muted for autoplay policy
                playsInline
                onClick={togglePlay}
            />

            {/* Play/Pause Overlay */}
            {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/20">
                    <Play size={64} className="text-white opacity-80" />
                </div>
            )}

            {/* Overlay Content */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white">
                <div className="flex items-end justify-between">
                    <div className="flex-1 mr-4">
                        <h3 className="font-bold text-lg mb-1">@{reel.student}</h3>
                        <p className="text-sm text-gray-200 mb-4 line-clamp-2">{reel.description}</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col items-center space-y-4 pb-2">
                        <button className="flex flex-col items-center group">
                            <div className="p-2 bg-white/10 rounded-full group-hover:bg-eugenia-red/20 transition-colors">
                                <Heart size={28} className="group-hover:text-eugenia-red transition-colors" />
                            </div>
                            <span className="text-xs mt-1">{reel.likes}</span>
                        </button>
                        <button className="flex flex-col items-center group">
                            <div className="p-2 bg-white/10 rounded-full group-hover:bg-white/20 transition-colors">
                                <MessageCircle size={28} />
                            </div>
                            <span className="text-xs mt-1">{reel.comments}</span>
                        </button>
                        <button className="flex flex-col items-center group">
                            <div className="p-2 bg-white/10 rounded-full group-hover:bg-white/20 transition-colors">
                                <Share2 size={28} />
                            </div>
                            <span className="text-xs mt-1">Share</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Stage = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const containerRef = useRef(null);

    const handleScroll = () => {
        if (containerRef.current) {
            const scrollPosition = containerRef.current.scrollTop;
            const itemHeight = containerRef.current.clientHeight;
            const index = Math.round(scrollPosition / itemHeight);
            setActiveIndex(index);
        }
    };

    return (
        <div className="bg-eugenia-dark min-h-screen flex justify-center items-center py-4 md:py-8">
            <div
                ref={containerRef}
                onScroll={handleScroll}
                className="w-full h-[calc(100vh-4rem)] md:h-[600px] md:w-[350px] overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
                style={{ scrollBehavior: 'smooth' }}
            >
                {reels.map((reel, index) => (
                    <VideoCard key={reel.id} reel={reel} isActive={index === activeIndex} />
                ))}
            </div>
        </div>
    );
};

export default Stage;
