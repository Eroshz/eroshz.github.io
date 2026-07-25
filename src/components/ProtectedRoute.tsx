import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getCurrentSession } from '../supabaseClient';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const session = getCurrentSession();
  const location = useLocation();

  if (!session || !session.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
