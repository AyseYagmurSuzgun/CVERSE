import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F4F9FD] dark:bg-[#0B132B]">
        <div className="relative flex items-center justify-center">
          {/* Glassmorphic spinner outer ring */}
          <div className="w-16 h-16 border-4 border-[#5DADE2]/20 border-t-[#5DADE2] rounded-full animate-spin"></div>
          {/* Inner core */}
          <div className="absolute w-8 h-8 bg-white/60 dark:bg-[#1C2541]/60 backdrop-blur-md rounded-full shadow-inner"></div>
        </div>
        <p className="mt-4 text-[#2C3E50]/70 dark:text-[#F4F9FD]/70 text-sm font-medium tracking-wide animate-pulse">
          CVERSE yükleniyor...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Giriş yapmamış kullanıcıyı login sayfasına yönlendir, geldiği sayfayı hafızada tut
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
