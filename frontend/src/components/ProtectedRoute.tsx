import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import { Loader2 } from 'lucide-react';

import { useUser } from '@clerk/clerk-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isLoading, user } = useAuth();
  const { user: clerkUser, isLoaded: isClerkLoaded, isSignedIn } = useUser();
  const location = useLocation();

  if (isLoading || !isClerkLoaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium">Verifying session...</p>
      </div>
    );
  }

  // If not signed in to Clerk, definitely not authenticated
  if (!isSignedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Determine role (local DB first, then Clerk metadata)
  const userRole = user?.role || (clerkUser?.publicMetadata?.role as string);

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Role not authorized, redirect to home
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
