import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';
import apiClient, { setTokenProvider } from '../api/apiClient';
import type { User } from '@/types/User';


interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User) => void;

  logout: () => void;
  updateUser: (userData: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoaded: isClerkLoaded, isSignedIn } = useUser();
  const { getToken, signOut } = useClerkAuth();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTokenProvider(() => getToken());
  }, [getToken]);

  useEffect(() => {
    const syncUser = async () => {
      if (!isClerkLoaded) return;

      if (!isSignedIn) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        // Give the interceptor a moment to get the token provider
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Fetch/Sync user with local DB
        const response = await apiClient.get('/auth/me');
        if (response.data.success) {
          setUser(response.data.data.user);
        }
      } catch (error) {
        console.error('Failed to sync user with local DB:', error);
        // If it's a 404/500, we might want to sign out or show an error
      } finally {
        setIsLoading(false);
      }
    };

    syncUser();
  }, [isClerkLoaded, isSignedIn]);


  const login = (userData: User) => {
    // This will be handled by Clerk components now, but we keep the signature for compatibility
    setUser(userData);
  };


  const logout = async () => {
    await signOut();
    setUser(null);
  };

  const updateUser = (userData: User) => {
    setUser(userData);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!isSignedIn && !!user,
        isLoading: !isClerkLoaded || isLoading,
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

