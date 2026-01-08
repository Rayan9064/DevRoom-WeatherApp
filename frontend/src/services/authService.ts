import axios from 'axios';
import type { AuthResponse, User, ApiResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle session expiry
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export const authService = {
    async sendRegistrationOTP(email: string): Promise<ApiResponse<{ message: string }>> {
        const response = await api.post<ApiResponse<{ message: string }>>('/auth/send-otp', {
            email,
            type: 'registration',
        });
        return response.data;
    },

    async verifyRegistrationOTP(email: string, otp: string, username: string, password: string): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/auth/verify-otp', {
            email,
            otp,
            type: 'registration',
            username,
            password,
        });
        if (response.data.data?.token) {
            localStorage.setItem('token', response.data.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.data.user));
        }
        return response.data;
    },

    async sendPasswordResetOTP(email: string): Promise<ApiResponse<{ message: string }>> {
        const response = await api.post<ApiResponse<{ message: string }>>('/auth/send-otp', {
            email,
            type: 'password_reset',
        });
        return response.data;
    },

    async verifyPasswordResetOTP(email: string, otp: string, newPassword?: string): Promise<ApiResponse<{ verified?: boolean; message: string }>> {
        const response = await api.post<ApiResponse<{ verified?: boolean; message: string }>>('/auth/verify-otp', {
            email,
            otp,
            type: 'password_reset',
            newPassword,
        });
        return response.data;
    },

    async resetPasswordWithToken(resetToken: string, password: string): Promise<ApiResponse<void>> {
        const response = await api.post<ApiResponse<void>>('/auth/reset-password', {
            resetToken,
            password,
        });
        return response.data;
    },

    async register(username: string, email: string, password: string): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/auth/register', {
            username,
            email,
            password,
        });
        if (response.data.data?.token) {
            localStorage.setItem('token', response.data.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.data.user));
        }
        return response.data;
    },

    async login(email: string, password: string): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/auth/login', {
            email,
            password,
        });
        if (response.data.data?.token) {
            localStorage.setItem('token', response.data.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.data.user));
        }
        return response.data;
    },

    async getProfile(): Promise<ApiResponse<{ user: User }>> {
        const response = await api.get<ApiResponse<{ user: User }>>('/auth/profile');
        return response.data;
    },

    async refreshToken(): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/auth/refresh');
        if (response.data.data?.token) {
            localStorage.setItem('token', response.data.data.token);
            if (response.data.data.user) {
                localStorage.setItem('user', JSON.stringify(response.data.data.user));
            }
        }
        return response.data;
    },

    async logout(): Promise<void> {
        try {
            await api.post('/auth/logout');
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    },

    async verifyEmail(token: string): Promise<ApiResponse<void>> {
        const response = await api.get<ApiResponse<void>>(`/auth/verify-email/${token}`);
        return response.data;
    },

    async resendVerification(): Promise<ApiResponse<void>> {
        const response = await api.post<ApiResponse<void>>('/auth/resend-verification');
        return response.data;
    },

    async forgotPassword(email: string): Promise<ApiResponse<void>> {
        const response = await api.post<ApiResponse<void>>('/auth/forgot-password', { email });
        return response.data;
    },

    async resetPassword(token: string, password: string): Promise<ApiResponse<void>> {
        const response = await api.post<ApiResponse<void>>('/auth/reset-password', { token, password });
        return response.data;
    },

    getCurrentUser(): User | null {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    isAuthenticated(): boolean {
        return !!localStorage.getItem('token');
    },
};

export default api;
