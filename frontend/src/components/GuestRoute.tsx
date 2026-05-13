import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUser } from '@clerk/clerk-react';
import { Loader2 } from 'lucide-react';

interface GuestRouteProps {
  children: React.ReactNode;
}

const GuestRoute: React.FC<GuestRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { isSignedIn, isLoaded: isClerkLoaded } = useUser();

  if (isLoading || !isClerkLoaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium">Checking session...</p>
      </div>
    );
  }

  // If Clerk says signed in, redirect even if local sync is pending
  if (isSignedIn) {
    // If local sync finished, use role-based redirect
    if (user?.role === 'manager') return <Navigate to="/manager" replace />;
    if (user?.role === 'staff') return <Navigate to="/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default GuestRoute;
