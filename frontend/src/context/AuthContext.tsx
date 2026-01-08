import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authService } from '../services/authService';
import type { User } from '../types';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (username: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    loading: boolean;
    refreshToken: () => Promise<void>;
    verifyEmail: (token: string) => Promise<void>;
    resendVerification: () => Promise<void>;
    forgotPassword: (email: string) => Promise<void>;
    resetPassword: (token: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is already logged in
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
            setUser(currentUser);
        }
        setLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        const response = await authService.login(email, password);
        if (response.data?.user) {
            setUser(response.data.user);
        }
    };

    const register = async (username: string, email: string, password: string) => {
        const response = await authService.register(username, email, password);
        if (response.data?.user) {
            setUser(response.data.user);
        }
    };

    const logout = async () => {
        try {
            await authService.logout();
        } finally {
            setUser(null);
        }
    };

    const refreshToken = async () => {
        const response = await authService.refreshToken();
        if (response.data?.user) {
            setUser(response.data.user);
        }
    };

    const verifyEmail = async (token: string) => {
        await authService.verifyEmail(token);
    };

    const resendVerification = async () => {
        await authService.resendVerification();
    };

    const forgotPassword = async (email: string) => {
        await authService.forgotPassword(email);
    };

    const resetPassword = async (token: string, password: string) => {
        await authService.resetPassword(token, password);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                login,
                register,
                logout,
                loading,
                refreshToken,
                verifyEmail,
                resendVerification,
                forgotPassword,
                resetPassword,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
