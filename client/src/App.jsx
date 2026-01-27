import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';
import AuthPage from './components/auth/AuthPage';
import OAuthCallback from './components/auth/OAuthCallback';
import OnboardingWrapper from './components/auth/OnboardingWrapper';
import MainApp from './components/layout/MainApp';
import GuestMainApp from './components/layout/GuestMainApp';
import GuestMode from './components/auth/GuestMode';
import LandingPage from './components/landing/LandingPage';
import ProfilePage from './components/profile/ProfilePage';
import EnhancedProfilePage from './components/profile/EnhancedProfilePage';

function App() {
  const { isAuthenticated, checkAuth, isLoading } = useAuthStore();
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      await checkAuth();
      setInitializing(false);
    };
    initAuth();
  }, [checkAuth]);

  // Only show loading screen during initial authentication check, not on subsequent operations
  if (initializing) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading SpeakWise...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Landing Page - Public Route */}
          <Route 
            path="/" 
            element={!isAuthenticated ? <LandingPage /> : <Navigate to="/dashboard" replace />} 
          />
          
          {/* Guest Mode Routes */}
          <Route 
            path="/guest" 
            element={<GuestMainApp />} 
          />
          
          {/* Auth Routes */}
          <Route 
            path="/auth" 
            element={!isAuthenticated ? <AuthPage /> : <Navigate to="/dashboard" replace />} 
          />
          <Route 
            path="/auth/callback" 
            element={<OAuthCallback />} 
          />
          <Route 
            path="/login" 
            element={!isAuthenticated ? <AuthPage /> : <Navigate to="/dashboard" replace />} 
          />
          <Route 
            path="/register" 
            element={!isAuthenticated ? <AuthPage /> : <Navigate to="/dashboard" replace />} 
          />
          
          {/* Dashboard Route - Protected with Onboarding */}
          <Route 
            path="/dashboard/*" 
            element={
              isAuthenticated ? (
                <OnboardingWrapper>
                  <MainApp />
                </OnboardingWrapper>
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />

          {/* Profile Route - Protected with Onboarding */}
          <Route 
            path="/profile" 
            element={
              isAuthenticated ? (
                <OnboardingWrapper>
                  <EnhancedProfilePage />
                </OnboardingWrapper>
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          
          {/* Catch all route */}
          <Route 
            path="*" 
            element={<Navigate to="/" replace />} 
          />
        </Routes>
        
        {/* Toast Notifications */}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
        
        {/* Vercel Analytics & Speed Insights */}
        <Analytics />
        <SpeedInsights />
      </div>
    </Router>
  );
}

export default App;
