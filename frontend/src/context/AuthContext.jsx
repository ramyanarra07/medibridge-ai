import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('medibridge_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      const token = api.getToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.getCurrentUser();
        if (res.user) {
          setUser(res.user);
          localStorage.setItem('medibridge_user', JSON.stringify(res.user));
        }
      } catch (err) {
        console.warn('Session expired or invalid token:', err);
        api.logout();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    verifyUser();
  }, []);

  const login = async (username, password) => {
    const res = await api.login(username, password);
    if (res.user) {
      setUser(res.user);
      localStorage.setItem('medibridge_user', JSON.stringify(res.user));
    }
    return res;
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    if (res.user) {
      setUser(res.user);
      localStorage.setItem('medibridge_user', JSON.stringify(res.user));
    }
    return res;
  };

  const logout = () => {
    api.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
