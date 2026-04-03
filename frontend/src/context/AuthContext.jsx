import React, { createContext, useState, useEffect } from 'react';
import axios from '../api/axios';
import toast from 'react-hot-toast';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const res = await axios.get('/auth/dashboard');
                    setUser(res.data.user);
                } catch (error) {
                    console.error("Auth Error", error);
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };
        checkUser();
    }, []);

    const login = async (username, password) => {
        try {
            const res = await axios.post('/auth/login', { username, password });
            localStorage.setItem('token', res.data.token);
            setUser(res.data.user);
            toast.success('Logged in successfully!');
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
            return false;
        }
    };

    const signup = async (username, email, password) => {
        try {
            const res = await axios.post('/auth/signup', { username, email, password });
            toast.success('Signed up successfully! You can now login.');
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Signup failed');
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        toast.success('Logged out successfully!');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
