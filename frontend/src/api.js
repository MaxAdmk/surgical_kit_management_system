/**
 * API Client with JWT Authentication and Token Refresh
 *
 * Features:
 * - Automatic token refresh on 401 responses
 * - HTTPOnly cookie handling for secure auth
 * - Request/Response interceptors
 * - Axios-like interface (get, post, put, delete)
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const API_URL = import.meta.env.VITE_API_URL;
const AUTH_API_URL = `${API_URL}/auth`;

const REQUEST_HEADERS = {
  'Content-Type': 'application/json',
};

const REQUEST_OPTIONS = {
  credentials: 'include', // Send cookies with every request
};

// ============================================================================
// STATE MANAGEMENT FOR TOKEN REFRESH
// ============================================================================

let isRefreshing = false;
let refreshSubscribers = [];

/**
 * Subscribe to token refresh completion
 * @param {Function} callback - Called when token refresh completes
 */
const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

/**
 * Notify all subscribers that token has been refreshed
 */
const notifyTokenRefresh = () => {
  refreshSubscribers.forEach(callback => callback());
  refreshSubscribers = [];
};

// ============================================================================
// AUTHENTICATION ENDPOINTS
// ============================================================================

/**
 * Register a new user
 * @param {Object} userData - { email, name, password, role }
 * @returns {Promise<Object>} User data returned from server
 */
export const registerUser = async (userData) => {
  const response = await fetch(`${AUTH_API_URL}/register/`, {
    method: 'POST',
    headers: REQUEST_HEADERS,
    ...REQUEST_OPTIONS,
    body: JSON.stringify(userData),
  });
  return response.json();
};

/**
 * Login user with credentials
 * @param {Object} credentials - { email, password }
 * @returns {Promise<Object>} Authentication response with user data
 * @throws {Error} If login fails
 */
export const loginUser = async (credentials) => {
  const response = await fetch(`${AUTH_API_URL}/login/`, {
    method: 'POST',
    headers: REQUEST_HEADERS,
    ...REQUEST_OPTIONS,
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    throw new Error('Invalid email or password');
  }

  return response.json();
};

/**
 * Get current logged-in user profile
 * @returns {Promise<Object>} User profile data
 * @throws {Error} If user is not authenticated
 */
export const getCurrentUser = async () => {
  const response = await fetch(`${AUTH_API_URL}/profile/`, {
    method: 'GET',
    headers: REQUEST_HEADERS,
    ...REQUEST_OPTIONS,
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user profile');
  }

  return response.json();
};

/**
 * Logout user (clears auth cookies on backend)
 * @returns {Promise<Object>} Server response
 */
export const logoutUser = async () => {
  const response = await fetch(`${AUTH_API_URL}/logout/`, {
    method: 'POST',
    headers: REQUEST_HEADERS,
    ...REQUEST_OPTIONS,
  });
  return response.json();
};

// ============================================================================
// TOKEN REFRESH
// ============================================================================

/**
 * Refresh the access token using the refresh token
 * @returns {Promise<Object>} New token response
 * @throws {Error} If refresh fails
 */
const refreshAccessToken = async () => {
  try {
    const response = await fetch(`${AUTH_API_URL}/refresh/`, {
      method: 'POST',
      headers: REQUEST_HEADERS,
      ...REQUEST_OPTIONS,
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    return response.json();
  } catch (error) {
    console.error('Token refresh error:', error);
    throw error;
  }
};

/**
 * Handle 401 Unauthorized responses with automatic token refresh
 * @param {string} url - Original request URL
 * @param {Object} options - Original request options
 * @returns {Promise<Response>} Response after token refresh and retry
 */
const handleUnauthorized = async (url, options) => {
  if (!isRefreshing) {
    isRefreshing = true;
    try {
      await refreshAccessToken();
      notifyTokenRefresh();
      isRefreshing = false;
    } catch (error) {
      isRefreshing = false;
      refreshSubscribers = [];
      // Redirect to login on refresh failure
      window.location.href = '/';
      throw error;
    }
  }

  // Wait for token refresh to complete, then retry request
  return new Promise((resolve, reject) => {
    subscribeTokenRefresh(async () => {
      try {
        const retryResponse = await makeRequest(url, options);
        resolve(retryResponse);
      } catch (err) {
        reject(err);
      }
    });
  });
};

// ============================================================================
// CORE HTTP REQUEST FUNCTION
// ============================================================================

/**
 * Core HTTP request with automatic token refresh on 401
 * @param {string} url - API endpoint (without base URL)
 * @param {Object} options - Fetch options (method, headers, body, etc.)
 * @returns {Promise<Response>} Fetch response object
 */
const makeRequest = async (url, options = {}) => {
  const fullUrl = `${API_URL}${url}`;
  const method = options.method || 'GET';

  const fetchOptions = {
    method,
    headers: {
      ...REQUEST_HEADERS,
      ...options.headers,
    },
    ...REQUEST_OPTIONS,
    ...options,
  };

  try {
    const response = await fetch(fullUrl, fetchOptions);

    // Handle 401 Unauthorized - attempt token refresh
    if (response.status === 401) {
      try {
        await handleUnauthorized(url, options);
        // After refresh, original request will be retried automatically
        return response;
      } catch (refreshError) {
        throw new Error('Authentication failed - session expired');
      }
    }

    return response;
  } catch (error) {
    console.error('Request failed:', error);
    throw error;
  }
};

// ============================================================================
// HELPER: PARSE RESPONSE
// ============================================================================

/**
 * Parse response JSON, handling empty responses (e.g., 204 No Content)
 * @param {Response} response - Fetch response object
 * @returns {Promise<Object|null>} Parsed JSON or null if no content
 */
const parseResponse = async (response) => {
  const contentType = response.headers.get('content-type');

  // Check if response has JSON content
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }

  // No content (e.g., DELETE returns 204)
  return null;
};

// ============================================================================
// API CLIENT (Axios-like interface)
// ============================================================================

/**
 * Main API client with axios-like interface
 * Usage: api.get('/path'), api.post('/path', data), etc.
 */
const api = {
  /**
   * GET request
   * @param {string} url - API endpoint
   * @param {Object} options - Request options
   * @returns {Promise<Object>} { data: response }
   */
  get: async (url, options = {}) => {
    const response = await makeRequest(url, { method: 'GET', ...options });
    if (!response.ok) throw new Error(`API Error: ${response.status} ${response.statusText}`);
    return { data: await parseResponse(response) };
  },

  /**
   * POST request
   * @param {string} url - API endpoint
   * @param {Object} data - Request body
   * @param {Object} options - Request options
   * @returns {Promise<Object>} { data: response }
   */
  post: async (url, data, options = {}) => {
    const response = await makeRequest(url, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    });
    if (!response.ok) throw new Error(`API Error: ${response.status} ${response.statusText}`);
    return { data: await parseResponse(response) };
  },

  /**
   * PUT request
   * @param {string} url - API endpoint
   * @param {Object} data - Request body
   * @param {Object} options - Request options
   * @returns {Promise<Object>} { data: response }
   */
  put: async (url, data, options = {}) => {
    const response = await makeRequest(url, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options,
    });
    if (!response.ok) throw new Error(`API Error: ${response.status} ${response.statusText}`);
    return { data: await parseResponse(response) };
  },

  /**
   * DELETE request
   * @param {string} url - API endpoint
   * @param {Object} options - Request options
   * @returns {Promise<Object>} { data: response or null }
   */
  delete: async (url, options = {}) => {
    const response = await makeRequest(url, { method: 'DELETE', ...options });
    if (!response.ok) throw new Error(`API Error: ${response.status} ${response.statusText}`);
    return { data: await parseResponse(response) };
  },
};

export default api;