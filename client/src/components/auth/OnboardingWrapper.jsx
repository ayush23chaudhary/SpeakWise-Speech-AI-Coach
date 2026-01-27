import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import OnboardingFlow from './OnboardingFlow';
import api from '../../utils/api';

/**
 * Wrapper component that checks if user needs onboarding
 * If yes, shows onboarding flow
 * If no, renders children (protected routes)
 */
const OnboardingWrapper = ({ children }) => {
  const { user, isAuthenticated, updateUser } = useAuthStore();
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const hasChecked = useRef(false); // Prevent re-checking
  const navigate = useNavigate();

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      // Only check once per session
      if (hasChecked.current || !isAuthenticated || !user) {
        setCheckingOnboarding(false);
        return;
      }

      hasChecked.current = true;

      // Check session storage to avoid re-showing after completion in same session
      const onboardingShown = sessionStorage.getItem('onboarding_shown');
      if (onboardingShown === 'true') {
        console.log('✅ Onboarding already shown this session');
        setCheckingOnboarding(false);
        setShowOnboarding(false);
        return;
      }

      // Check if user already completed onboarding
      if (user.onboarding?.completed) {
        console.log('✅ User already completed onboarding');
        setCheckingOnboarding(false);
        setShowOnboarding(false);
        return;
      }

      try {
        // Check onboarding status from server
        const response = await api.get('/onboarding/status');
        const { completed } = response.data;

        console.log('📋 Onboarding status from server:', { completed });

        if (!completed) {
          console.log('🎯 Showing onboarding flow');
          setShowOnboarding(true);
          // Mark that we've shown onboarding this session
          sessionStorage.setItem('onboarding_shown', 'true');
        } else {
          setShowOnboarding(false);
        }
      } catch (error) {
        console.error('❌ Failed to check onboarding status:', error);
        // Fallback: check user object
        const needsOnboarding = !user.onboarding || !user.onboarding.completed;
        
        if (needsOnboarding) {
          setShowOnboarding(true);
          sessionStorage.setItem('onboarding_shown', 'true');
        } else {
          setShowOnboarding(false);
        }
      } finally {
        setCheckingOnboarding(false);
      }
    };

    checkOnboardingStatus();
  }, [isAuthenticated]); // Only depend on authentication status

  const handleOnboardingComplete = async () => {
    try {
      console.log('✅ Onboarding completed, updating user data...');
      
      // Fetch updated user data to get onboarding info
      const response = await api.get('/auth/me');
      const { user: updatedUser } = response.data;
      
      console.log('✅ Updated user data:', updatedUser.onboarding);
      
      // Update user in store
      updateUser(updatedUser);
      
      // Hide onboarding
      setShowOnboarding(false);
      
      // Don't navigate - just render children (already on dashboard route)
      console.log('✅ Onboarding flow complete, showing dashboard');
    } catch (error) {
      console.error('❌ Failed to refresh user data:', error);
      // Even if fetch fails, hide onboarding to prevent blocking
      setShowOnboarding(false);
    }
  };

  // Show loading state while checking
  if (checkingOnboarding) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Preparing your experience...</p>
        </div>
      </div>
    );
  }

  // Show onboarding if needed
  if (showOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  // Render protected content
  return <>{children}</>;
};

export default OnboardingWrapper;
