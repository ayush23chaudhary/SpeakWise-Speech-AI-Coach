import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../utils/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/login', { email, password });
          const { token, user } = response.data;
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false
          });
          
          // Set token in axios headers
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return { 
            success: false, 
            error: error.response?.data?.message || 'Login failed' 
          };
        }
      },

      register: async (name, email, password) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/register', { name, email, password });
          const { token, user } = response.data;
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false
          });
          
          // Set token in axios headers
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return { 
            success: false, 
            error: error.response?.data?.message || 'Registration failed' 
          };
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false
        });
        
        // Remove token from axios headers
        delete api.defaults.headers.common['Authorization'];
      },

      checkAuth: async () => {
        const { token, user } = get();
        
        // If no token, user is not authenticated
        if (!token) {
          set({ isAuthenticated: false });
          return false;
        }

        // If we have both token and user from localStorage, set authenticated immediately
        if (token && user) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          set({ isAuthenticated: true });
          
          // Optionally verify token in background without blocking
          api.get('/auth/me').catch(() => {
            // If token is invalid, logout
            get().logout();
          });
          
          return true;
        }

        // If we have token but no user, fetch user data
        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await api.get('/auth/me');
          const { user: fetchedUser } = response.data;
          
          set({
            user: fetchedUser,
            isAuthenticated: true
          });
          
          return true;
        } catch (error) {
          get().logout();
          return false;
        }
      },

      // OAuth login method - handles login with existing token from OAuth provider
      loginWithOAuthToken: async (token) => {
        set({ isLoading: true });
        
        try {
          // Set token in state and API headers
          set({ token });
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Fetch user data with the token
          const response = await api.get('/auth/me');
          const { user } = response.data;
          
          set({
            user,
            isAuthenticated: true,
            isLoading: false
          });
          
          return { success: true };
        } catch (error) {
          set({
            token: null,
            user: null,
            isAuthenticated: false,
            isLoading: false
          });
          delete api.defaults.headers.common['Authorization'];
          return { 
            success: false, 
            error: error.response?.data?.message || 'OAuth authentication failed' 
          };
        }
      },

      // Update user information in store
      updateUser: (updatedUser) => {
        set({ user: updatedUser });
      },

      // Check if user needs onboarding
      needsOnboarding: () => {
        const { user } = get();
        // User needs onboarding if authenticated but onboarding not completed
        return user && (!user.onboarding || !user.onboarding.completed);
      },

      // Mark onboarding as complete
      completeOnboarding: (onboardingData) => {
        const { user } = get();
        if (user) {
          set({
            user: {
              ...user,
              onboarding: {
                ...onboardingData,
                completed: true,
                completedAt: new Date().toISOString()
              }
            }
          });
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        token: state.token,
        user: state.user 
      })
    }
  )
);

export default useAuthStore;
