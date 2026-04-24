import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

interface User {
  id: number;
  email: string | null;
  phone: string | null;
  role: string;
  fullName: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User, tokens: { accessToken: string; refreshToken: string }) => void;
  logout: () => void;
  updateUser: (userData: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await apiClient.get('/auth/me');
        if (response.data.success) {
          setUser(response.data.data.user);
          localStorage.setItem('user', JSON.stringify(response.data.data.user));
        }
      } catch (error) {
        console.error('Session verification failed:', error);
        // Error interceptor in apiClient will handle 401s and refresh
      } finally {
        setIsLoading(false);
      }
    };

    verifySession();
  }, []);

  const login = (userData: User, tokens: { accessToken: string; refreshToken: string }) => {
    setUser(userData);

    // For MVP, we'll stick to localStorage as per simplified PRD "Remember Me"
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
  };

  const logout = () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      apiClient.post('/auth/logout', { refreshToken }).catch(console.error);
    }

    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  const updateUser = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        updateUser,
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
