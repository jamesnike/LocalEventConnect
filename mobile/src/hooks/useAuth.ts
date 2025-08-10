import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  animeAvatarSeed?: string;
  aiSignature?: string;
  location?: string;
  customAvatarUrl?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

import { API_CONFIG } from '../config/api';

const API_BASE_URL = API_CONFIG.BASE_URL;

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  // Check if user is already authenticated using JWT
  const checkAuthStatus = async () => {
    try {
      // Get stored JWT token
      const token = await AsyncStorage.getItem('jwt_token');
      
      if (!token) {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: null,
        });
        return;
      }

      // Validate token with backend
      const response = await fetch(`${API_BASE_URL}/api/auth/validate`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const user = await response.json();
        setAuthState({
          user,
          isLoading: false,
          isAuthenticated: true,
          error: null,
        });
        console.log('Authenticated with JWT token:', user);
      } else if (response.status === 401) {
        // Token expired or invalid, try to refresh
        await refreshToken();
      } else {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: null,
        });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // For development/testing, provide a mock user when backend is not available
      const mockUser: User = {
        id: 'user-1',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        profileImageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        animeAvatarSeed: 'john-doe-123',
        aiSignature: 'Pogo-stick Picasso, rolling dice with curious kangaroos.',
        location: 'Redwood City, California',
        customAvatarUrl: null,
      };
      
      setAuthState({
        user: mockUser,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      });
      
      console.log('Using mock user for development');
    }
  };

  // Refresh JWT token
  const refreshToken = async () => {
    try {
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      
      if (!refreshToken) {
        await logout();
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const { token, refreshToken: newRefreshToken } = await response.json();
        
        // Store new tokens
        await AsyncStorage.setItem('jwt_token', token);
        await AsyncStorage.setItem('refresh_token', newRefreshToken);
        
        // Retry auth check
        await checkAuthStatus();
      } else {
        await logout();
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      await logout();
    }
  };

  // Login function using JWT
  const login = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const { token, refreshToken, user } = await response.json();
        
        // Store tokens securely
        await AsyncStorage.setItem('jwt_token', token);
        await AsyncStorage.setItem('refresh_token', refreshToken);
        
        setAuthState({
          user,
          isLoading: false,
          isAuthenticated: true,
          error: null,
        });
        
        console.log('Successfully logged in with JWT');
      } else {
        const errorData = await response.json();
        setAuthState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: errorData.message || 'Login failed' 
        }));
      }
    } catch (error) {
      console.error('Login failed:', error);
      setAuthState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Network error - please try again' 
      }));
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Clear stored tokens
      await AsyncStorage.removeItem('jwt_token');
      await AsyncStorage.removeItem('refresh_token');
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
    
    // Clear local state
    setAuthState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
    });
  };

  // Handle deep linking for auth callback
  useEffect(() => {
    const handleDeepLink = (url: string) => {
      if (url.includes('auth=success')) {
        checkAuthStatus();
      }
    };

    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    return () => subscription?.remove();
  }, []);

  // Check auth status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  return {
    ...authState,
    login,
    logout,
    refetch: checkAuthStatus,
  };
} 