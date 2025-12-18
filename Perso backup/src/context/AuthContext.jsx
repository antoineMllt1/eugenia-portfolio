import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isStudentMode, setIsStudentMode] = useState(false);

    const login = () => setIsStudentMode(true);
    const logout = () => setIsStudentMode(false);

    return (
        <AuthContext.Provider value={{ isStudentMode, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
