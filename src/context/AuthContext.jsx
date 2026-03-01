// context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check for existing token on mount
    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (token && userData) {
            setUser(JSON.parse(userData));
        }
        setLoading(false);
    }, []);

    const register = async (name, email, password) => {
        const response = await api.post('/auth/register', { name, email, password });
        return response.data;
    };

    const login = async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        const data = response.data;

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);

        return data;
    };

    const sendOTP = async (email) => {
        const response = await api.post('/auth/send-otp', { email });
        return response.data;
    };

    const verifyOTP = async (email, otp) => {
        const response = await api.post('/auth/verify-otp', { email, otp });
        const data = response.data;

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);

        return data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const updateUser = (updatedData) => {
        const newUser = { ...user, ...updatedData };
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
    };

    return (
        <AuthContext.Provider value={{ user, loading, register, login, sendOTP, verifyOTP, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};
