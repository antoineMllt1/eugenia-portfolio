import React from 'react';

export default function PostCard({ post }) {
    return (
        <article className="bg-white rounded-lg mb-4 shadow-instagram overflow-hidden">
            <header className="flex items-center p-2">
                <img
                    src={post.authorAvatar}
                    alt={post.author}
                    className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                    <p className="font-semibold text-sm">{post.author}</p>
                    <p className="text-xs text-muted">{post.location}</p>
                </div>
            </header>

            <img
                src={post.image}
                alt={post.caption}
                className="w-full object-cover cursor-pointer hover:scale-105 transition-transform"
            />

            <section className="p-2">
                <div className="flex items-center mb-2">
                    <button className="mr-2 transform hover:scale-110 transition-transform">
                        {/* Heart icon placeholder */}
                    </button>
                    <span className="font-semibold text-sm">{post.likes} likes</span>
                </div>
                <p className="text-sm">
                    <span className="font-semibold mr-1">{post.author}</span>
                    {post.caption}
                </p>
            </section>
        </article>
    );
}
