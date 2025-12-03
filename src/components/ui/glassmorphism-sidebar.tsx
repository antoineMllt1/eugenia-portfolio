"use client";

import React, { useState } from 'react';
import { LayoutDashboard, BarChart2, Users, Folder, CheckSquare, Hexagon } from 'lucide-react';

// --- Data for each page ---
interface PageContentData {
    title: string;
    description: string;
    content: React.ReactNode;
}

const pageContent: Record<string, PageContentData> = {
    Dashboard: {
        title: 'Dashboard',
        description: "Welcome back, Serafim. Here's what's happening today.",
        content: (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="content-card">
                    <h2 className="text-lg font-semibold text-white">Active Projects</h2>
                    <p className="text-4xl font-bold mt-2 text-indigo-400">12</p>
                </div>
                <div className="content-card">
                    <h2 className="text-lg font-semibold text-white">Tasks Due</h2>
                    <p className="text-4xl font-bold mt-2 text-pink-400">5</p>
                </div>
                <div className="content-card">
                    <h2 className="text-lg font-semibold text-white">New Users</h2>
                    <p className="text-4xl font-bold mt-2 text-emerald-400">28</p>
                </div>
            </div>
        )
    },
    Analytics: {
        title: 'Analytics',
        description: 'Detailed insights and metrics for your projects.',
        content: (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="content-card lg:col-span-2 h-64 flex items-center justify-center">
                    <p className="text-gray-400">Chart placeholder for User Growth</p>
                </div>
                <div className="content-card">
                    <h2 className="text-lg font-semibold text-white">Bounce Rate</h2>
                    <p className="text-4xl font-bold mt-2 text-indigo-400">24.5%</p>
                </div>
                <div className="content-card">
                    <h2 className="text-lg font-semibold text-white">Session Duration</h2>
                    <p className="text-4xl font-bold mt-2 text-pink-400">8m 12s</p>
                </div>
            </div>
        )
    },
    Users: {
        title: 'Users',
        description: 'Manage all the users in your organization.',
        content: (
            <div className="content-card">
                <table className="custom-table w-full text-left">
                    <thead>
                        <tr><th className="p-2">Name</th><th className="p-2">Email</th><th className="p-2">Role</th></tr>
                    </thead>
                    <tbody>
                        <tr><td className="p-2">Jane Doe</td><td className="p-2">jane.doe@example.com</td><td className="p-2">Admin</td></tr>
                        <tr><td className="p-2">John Smith</td><td className="p-2">john.smith@example.com</td><td className="p-2">Developer</td></tr>
                        <tr><td className="p-2">Sam Wilson</td><td className="p-2">sam.wilson@example.com</td><td className="p-2">Designer</td></tr>
                    </tbody>
                </table>
            </div>
        )
    },
    Projects: {
        title: 'Projects',
        description: 'An overview of all your ongoing and completed projects.',
        content: (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="content-card">
                    <h2 className="text-lg font-semibold text-white">Project Alpha</h2>
                    <p className="text-sm text-gray-400 mt-1">Status: In Progress</p>
                </div>
                <div className="content-card">
                    <h2 className="text-lg font-semibold text-white">Project Beta</h2>
                    <p className="text-sm text-gray-400 mt-1">Status: Completed</p>
                </div>
            </div>
        )
    },
    Tasks: {
        title: 'Tasks',
        description: 'Track and manage all your tasks and to-dos.',
        content: (
            <div className="content-card">
                <ul className="space-y-2">
                    <li className="task-list-item flex justify-between items-center p-2 border-b border-white/10">
                        <span>Finalize Q3 report</span>
                        <span className="text-xs text-pink-400">Due Tomorrow</span>
                    </li>
                    <li className="task-list-item flex justify-between items-center p-2 border-b border-white/10">
                        <span>Design new landing page mockups</span>
                        <span className="text-xs text-gray-400">In Progress</span>
                    </li>
                    <li className="task-list-item flex justify-between items-center p-2">
                        <span>Deploy server updates</span>
                        <span className="text-xs text-emerald-400">Completed</span>
                    </li>
                </ul>
            </div>
        )
    }
};

const navItems = [
    { page: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { page: 'Analytics', icon: <BarChart2 className="w-5 h-5" /> },
    { page: 'Users', icon: <Users className="w-5 h-5" /> },
    { page: 'Projects', icon: <Folder className="w-5 h-5" /> },
    { page: 'Tasks', icon: <CheckSquare className="w-5 h-5" /> },
];

// Sidebar Component
const Sidebar = ({ activePage, setActivePage }: { activePage: string; setActivePage: (page: string) => void }) => (
    <aside className="glass-effect w-64 flex-shrink-0 flex flex-col z-10 h-screen sticky top-0">
        <div className="h-20 flex items-center justify-center border-b border-white/10">
            <div className="flex items-center gap-2">
                <Hexagon className="w-8 h-8 text-indigo-400" />
                <span className="text-xl font-bold text-white">AetherUI</span>
            </div>
        </div>
        <nav className="flex-grow p-4 space-y-2">
            {navItems.map(item => (
                <a
                    key={item.page}
                    href="#"
                    className={`nav-link flex items-center gap-3 px-4 py-2 rounded-lg text-gray-300 transition-colors hover:bg-white/5 ${activePage === item.page ? 'active bg-white/10 text-white' : ''}`}
                    onClick={(e) => {
                        e.preventDefault();
                        setActivePage(item.page);
                    }}
                >
                    {item.icon}
                    <span>{item.page}</span>
                </a>
            ))}
        </nav>
        <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3">
                <img src="https://i.pravatar.cc/150?u=serafim" alt="User Avatar" className="w-10 h-10 rounded-full border-2 border-indigo-400" />
                <div>
                    <p className="font-semibold text-white">Serafim P.</p>
                    <p className="text-xs text-gray-400">Admin</p>
                </div>
            </div>
        </div>
    </aside>
);

// Main Content Component
const MainContent = ({ activePage }: { activePage: string }) => {
    const { title, description, content } = pageContent[activePage];
    return (
        <main className="flex-grow p-8 overflow-y-auto h-screen">
            <h1 className="text-3xl font-bold text-white">{title}</h1>
            <p className="text-gray-400 mt-2">{description}</p>
            <div className="mt-8">{content}</div>
        </main>
    );
};

// Main Dashboard Layout Component
export const DashboardLayout = () => {
    const [activePage, setActivePage] = useState('Dashboard');
    return (
        <div className="relative min-h-screen w-full flex bg-gray-900 text-gray-200 overflow-hidden">
            <div className="shape-1 absolute"></div>
            <div className="shape-2 absolute"></div>
            <Sidebar activePage={activePage} setActivePage={setActivePage} />
            <MainContent activePage={activePage} />
        </div>
    );
};
