import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, Map, MessageSquare, Upload, Home, Grid, Play } from 'lucide-react';

const Navbar = ({ isStudentMode, toggleStudentMode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    const navLinks = [
        { name: 'Home', path: '/', icon: <Home size={20} />, public: true },
        { name: 'Projects', path: '/projects', icon: <Grid size={20} />, public: true },
        { name: 'The Stage', path: '/stage', icon: <Play size={20} />, public: true },
        { name: 'Dashboard', path: '/dashboard', icon: <Upload size={20} />, public: false },
        { name: 'Map', path: '/map', icon: <Map size={20} />, public: false },
        { name: 'Chat', path: '/chat', icon: <MessageSquare size={20} />, public: false },
    ];

    const filteredLinks = navLinks.filter(link => link.public || isStudentMode);

    return (
        <nav className="bg-eugenia-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center">
                            <span className="font-sans font-bold text-xl text-eugenia-red-dark">Eugenia Student Hub</span>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-4">
                        {filteredLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-transform transform hover:scale-105 ${location.pathname === link.path
                                        ? 'text-eugenia-red-dark bg-eugenia-grey-30'
                                        : 'text-eugenia-dark hover:text-eugenia-red'
                                    }`}
                            >
                                <div className="flex items-center space-x-1">
                                    {link.icon}
                                    <span>{link.name}</span>
                                </div>
                            </Link>
                        ))}

                        <button
                            onClick={toggleStudentMode}
                            className={`ml-4 px-4 py-2 rounded-full text-sm font-bold transition-transform transform hover:scale-105 ${isStudentMode
                                    ? 'bg-eugenia-dark text-white'
                                    : 'bg-eugenia-red text-white'
                                }`}
                        >
                            {isStudentMode ? 'Student Mode: ON' : 'Visitor Mode'}
                        </button>
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex items-center md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-eugenia-dark hover:text-eugenia-red focus:outline-none"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {filteredLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                onClick={() => setIsOpen(false)}
                                className={`block px-3 py-2 rounded-md text-base font-medium ${location.pathname === link.path
                                        ? 'text-eugenia-red-dark bg-eugenia-grey-30'
                                        : 'text-eugenia-dark hover:text-eugenia-red'
                                    }`}
                            >
                                <div className="flex items-center space-x-2">
                                    {link.icon}
                                    <span>{link.name}</span>
                                </div>
                            </Link>
                        ))}
                        <button
                            onClick={() => {
                                toggleStudentMode();
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-md text-base font-medium ${isStudentMode
                                    ? 'bg-eugenia-dark text-white'
                                    : 'bg-eugenia-red text-white'
                                }`}
                        >
                            {isStudentMode ? 'Student Mode: ON' : 'Switch to Student Mode'}
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
