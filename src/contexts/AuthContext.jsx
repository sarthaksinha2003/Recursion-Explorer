import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';

const AuthContext = createContext(undefined);

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  // API helper function
  const apiCall = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  };

  // Load user from token on app start
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const data = await apiCall('/auth/me');
          setUser(data.user);
        } catch (error) {
          console.error('Failed to load user:', error);
          // Clear invalid token
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    loadUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const data = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      toast.success('Login successful!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      toast.error(message);
      throw error;
    }
  };

  const register = async (name, email, password) => {
    try {
      const data = await apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      toast.success('Registration successful!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      toast.error(message);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    toast.success('Logged out successfully');
  };

  const updateSettings = async (settings) => {
    try {
      const data = await apiCall('/auth/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });

      if (user) {
        setUser({
          ...user,
          settings: { ...user.settings, ...data.settings }
        });
      }
      
      toast.success('Settings updated successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update settings';
      toast.error(message);
      throw error;
    }
  };

  const toggleBookmark = async (exampleId) => {
    try {
      const data = await apiCall(`/auth/bookmark/${exampleId}`, {
        method: 'POST',
      });

      if (user) {
        setUser({
          ...user,
          bookmarks: data.bookmarks
        });
      }

      toast.success(data.message);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update bookmark';
      toast.error(message);
      throw error;
    }
  };

  const refreshUser = async () => {
    if (token) {
      try {
        const data = await apiCall('/auth/me');
        setUser(data.user);
      } catch (error) {
        console.error('Failed to refresh user:', error);
      }
    }
  };

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateSettings,
    toggleBookmark,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 