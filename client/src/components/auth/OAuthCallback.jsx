import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import LoadingSpinner from '../common/LoadingSpinner';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState(null);
  const { loginWithOAuthToken } = useAuthStore();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Get token and provider from URL
        const token = searchParams.get('token');
        const provider = searchParams.get('provider');
        const errorParam = searchParams.get('error');

        if (errorParam) {
          setError(`Authentication failed: ${errorParam.replace(/_/g, ' ')}`);
          setTimeout(() => navigate('/auth'), 3000);
          return;
        }

        if (!token) {
          setError('No authentication token received');
          setTimeout(() => navigate('/auth'), 3000);
          return;
        }

        // Login with OAuth token
        const result = await loginWithOAuthToken(token);

        if (!result.success) {
          setError(result.error || 'Authentication failed. Please try again.');
          setTimeout(() => navigate('/auth'), 3000);
          return;
        }

        // Show success message
        console.log(`✅ Successfully authenticated with ${provider}`);

        // Redirect to dashboard
        setTimeout(() => navigate('/dashboard'), 1000);
      } catch (err) {
        console.error('OAuth callback error:', err);
        setError('Authentication failed. Please try again.');
        setTimeout(() => navigate('/auth'), 3000);
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate, loginWithOAuthToken]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="card max-w-md mx-auto text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Authentication Failed
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Redirecting to login page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="card max-w-md mx-auto text-center">
        <LoadingSpinner size="large" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-6 mb-2">
          Completing Sign In
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Please wait while we set up your account...
        </p>
      </div>
    </div>
  );
};

export default OAuthCallback;
