import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration
export const API_CONFIG = {
  // Backend Configuration
  BACKENDS: {
    LOCAL: {
      name: 'Local Development',
      url: 'http://localhost:3001',
      status: 'active' // 'active', 'inactive', 'error'
    },
    REPLIT: {
      name: 'Replit Production',
      url: 'https://local-event-connect.replit.app',
      status: 'active' // 'active', 'inactive', 'error'
    }
  },
  
  // Current active backend - Always use Replit if available
  get ACTIVE_BACKEND() {
    // Always prefer Replit backend
    return this.BACKENDS.REPLIT;
  },
  
  get BASE_URL() {
    return this.ACTIVE_BACKEND.url;
  },
  
  // API Endpoints
  ENDPOINTS: {
    EVENTS: '/api/events',
    EVENT_DETAIL: (id: string) => `/api/events/${id}`,
    EVENT_RSVP: (id: string) => `/api/events/${id}/rsvp`,
    EVENT_RSVP_STATUS: (id: string) => `/api/events/${id}/rsvp/status`,
    USER_PROFILE: '/api/users/profile',
    USER_AVATAR: '/api/users/avatar',
    USER_EVENTS: '/api/users/me/events/attending',
    LOGIN: '/api/login',
    LOGOUT: '/api/logout',
  },
  
  // Headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
};

// Backend health check function
export const checkBackendHealth = async (backend: 'LOCAL' | 'REPLIT') => {
  const backendConfig = API_CONFIG.BACKENDS[backend];
  const testUrl = `${backendConfig.url}/api/events`;
  
  try {
    console.log(`Checking ${backend} backend health: ${testUrl}`);
    const response = await fetch(testUrl, { 
      method: 'GET',
      headers: API_CONFIG.DEFAULT_HEADERS,
      // Add timeout for Replit
      signal: AbortSignal.timeout(5000)
    });
    
    if (response.ok) {
      API_CONFIG.BACKENDS[backend].status = 'active';
      console.log(`✅ ${backend} backend is healthy`);
      return true;
    } else {
      API_CONFIG.BACKENDS[backend].status = 'error';
      console.log(`❌ ${backend} backend returned status: ${response.status}`);
      return false;
    }
  } catch (error) {
    API_CONFIG.BACKENDS[backend].status = 'error';
    console.log(`❌ ${backend} backend health check failed:`, error);
    return false;
  }
};

// Initialize backend health status
export const initializeBackendHealth = async () => {
  console.log('🔍 Checking backend health...');
  
  // Check both backends
  await Promise.all([
    checkBackendHealth('LOCAL'),
    checkBackendHealth('REPLIT')
  ]);
  
  console.log(`🎯 Active backend: ${API_CONFIG.ACTIVE_BACKEND.name} (${API_CONFIG.ACTIVE_BACKEND.url})`);
  
  return API_CONFIG.ACTIVE_BACKEND;
};

// Helper function to make API calls with JWT authentication
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {},
  requireAuth: boolean = false
) => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  // Get JWT token if authentication is required
  let authHeaders = {};
  if (requireAuth) {
    try {
      const token = await AsyncStorage.getItem('jwt_token');
      if (token) {
        authHeaders = { 'Authorization': `Bearer ${token}` };
      }
    } catch (error) {
      console.error('Failed to get JWT token:', error);
    }
  }
  
  const config: RequestInit = {
    headers: {
      ...API_CONFIG.DEFAULT_HEADERS,
      ...authHeaders,
      ...options.headers,
    },
    ...options,
  };

  try {
    console.log(`Making API request to: ${url}`);
    const response = await fetch(url, config);
    
    if (!response.ok) {
      if (response.status === 401 && requireAuth) {
        // Token expired, trigger refresh or logout
        throw new Error('Authentication required');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};
