import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const API_URL = 'http://localhost:8000';

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await fetch(`${API_URL}/users/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const userData = await res.json();
            setUser(userData);
          } else {
            logout();
          }
        } catch (e) {
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Login failed');
    }

    const data = await res.json();
    setToken(data.access_token);
    localStorage.setItem('token', data.access_token);
    // User will be fetched by useEffect
  };

  const register = async (email, password) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, full_name: email.split('@')[0] }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Registration failed');
    }

    const data = await res.json();
    setToken(data.access_token);
    localStorage.setItem('token', data.access_token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  const forgotPassword = async (email) => {
    // Still mock for now as backend doesn't implement email sending
    return new Promise((resolve) => setTimeout(resolve, 1000));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, forgotPassword }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
