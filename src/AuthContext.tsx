import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { User, AuthContextType } from './types';
import { authAPI } from './api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('crew-user');
    
    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('crew-user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (identifier: string, password: string): Promise<boolean> => {
    try {
      const response = await authAPI.login(identifier, password);
      const { token, user: userData } = response;
      
      localStorage.setItem('token', token);
      localStorage.setItem('crew-user', JSON.stringify(userData));
      setUser(userData);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  }, []);

  const register = useCallback(async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      const response = await authAPI.register(username, email, password);
      const { token, user: userData } = response;
      
      localStorage.setItem('token', token);
      localStorage.setItem('crew-user', JSON.stringify(userData));
      setUser(userData);
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('crew-user');
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    if (user) {
      try {
        const updatedUser = await authAPI.updateProfile(updates);
        setUser(updatedUser);
        localStorage.setItem('crew-user', JSON.stringify(updatedUser));
      } catch (error) {
        console.error('Profile update failed:', error);
        throw error;
      }
    }
  }, [user]);

  const deleteAccount = useCallback(async () => {
    if (user) {
      try {
        await authAPI.deleteAccount();
        localStorage.removeItem('token');
        localStorage.removeItem('crew-user');
        setUser(null);
      } catch (error) {
        console.error('Account deletion failed:', error);
        throw error;
      }
    }
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      logout, 
      isAuthenticated: !!user,
      updateProfile,
      deleteAccount
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}