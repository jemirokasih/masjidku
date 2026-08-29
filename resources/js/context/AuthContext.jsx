import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('mbs_user');
        return saved ? JSON.parse(saved) : null;
    });
    const [token, setToken] = useState(() => localStorage.getItem('mbs_token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyAuth = async () => {
            if (token) {
                try {
                    const res = await api.get('/auth/me');
                    setUser(res.data.data.user);
                    localStorage.setItem('mbs_user', JSON.stringify(res.data.data.user));
                } catch (err) {
                    console.error('Session expired or invalid token');
                    setUser(null);
                    setToken(null);
                    localStorage.removeItem('mbs_token');
                    localStorage.removeItem('mbs_user');
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        };

        verifyAuth();
    }, [token]);

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        const { user: userData, token: tokenData } = res.data.data;
        setUser(userData);
        setToken(tokenData);
        localStorage.setItem('mbs_token', tokenData);
        localStorage.setItem('mbs_user', JSON.stringify(userData));
        return res.data;
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (err) {
            console.error('Logout error', err);
        } finally {
            setUser(null);
            setToken(null);
            localStorage.removeItem('mbs_token');
            localStorage.removeItem('mbs_user');
            window.location.href = '/login';
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
