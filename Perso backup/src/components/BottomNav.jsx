import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Play, Heart, User } from 'lucide-react';

export default function BottomNav() {
    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center py-2 shadow-instagram md:hidden">
            <NavLink
                to="/"
                className={({ isActive }) =>
                    `flex flex-col items-center text-sm ${isActive ? 'text-primary' : 'text-muted'} hover:scale-105 transition-transform`
                }
            >
                <Home className="w-6 h-6" />
                <span>Home</span>
            </NavLink>
            <NavLink
                to="/search"
                className={({ isActive }) =>
                    `flex flex-col items-center text-sm ${isActive ? 'text-primary' : 'text-muted'} hover:scale-105 transition-transform`
                }
            >
                <Search className="w-6 h-6" />
                <span>Search</span>
            </NavLink>
            <NavLink
                to="/reels"
                className={({ isActive }) =>
                    `flex flex-col items-center text-sm ${isActive ? 'text-primary' : 'text-muted'} hover:scale-105 transition-transform`
                }
            >
                <Play className="w-6 h-6" />
                <span>Reels</span>
            </NavLink>
            <NavLink
                to="/activity"
                className={({ isActive }) =>
                    `flex flex-col items-center text-sm ${isActive ? 'text-primary' : 'text-muted'} hover:scale-105 transition-transform`
                }
            >
                <Heart className="w-6 h-6" />
                <span>Activity</span>
            </NavLink>
            <NavLink
                to="/profile"
                className={({ isActive }) =>
                    `flex flex-col items-center text-sm ${isActive ? 'text-primary' : 'text-muted'} hover:scale-105 transition-transform`
                }
            >
                <User className="w-6 h-6" />
                <span>Profile</span>
            </NavLink>
        </nav>
    );
}
