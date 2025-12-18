import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Projects from './pages/Projects';
import Stage from './pages/Stage';
import StudentProfile from './pages/StudentProfile';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import MapPage from './pages/MapPage';
import SupportAI from './components/SupportAI';
import OnboardingTour from './components/OnboardingTour';
import { AuthProvider, useAuth } from './context/AuthContext';

const AppContent = () => {
    const { isStudentMode, login, logout } = useAuth();

    // Protected Route Wrapper
    const ProtectedRoute = ({ children }) => {
        if (!isStudentMode) {
            return <Navigate to="/" replace />;
        }
        return children;
    };

    return (
        <div className="font-body text-eugenia-dark bg-eugenia-grey min-h-screen flex flex-col">
            <Navbar isStudentMode={isStudentMode} toggleStudentMode={isStudentMode ? logout : login} />
            <OnboardingTour />
            <main className="flex-grow">
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/projects" element={<Projects />} />
                    <Route path="/stage" element={<Stage />} />
                    <Route path="/profile" element={<StudentProfile />} />

                    {/* Protected Routes */}
                    <Route path="/dashboard" element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/map" element={
                        <ProtectedRoute>
                            <MapPage />
                        </ProtectedRoute>
                    } />
                    <Route path="/chat" element={
                        <ProtectedRoute>
                            <Chat />
                        </ProtectedRoute>
                    } />
                </Routes>
            </main>

            {!isStudentMode && <SupportAI />}

            <footer className="bg-eugenia-dark text-white py-8 text-center">
                <p>&copy; 2025 Eugenia School. All rights reserved.</p>
            </footer>
        </div>
    );
};

const App = () => {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
};

export default App;
