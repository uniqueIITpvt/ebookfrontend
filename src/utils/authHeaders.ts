/**
 * Utility function to get authentication headers
 * Retrieves the access token from localStorage and formats it for API requests
 */
export function getAuthHeaders(): HeadersInit {
  if (typeof window === 'undefined') {
    return {
      'Content-Type': 'application/json',
    };
  }

  const token = localStorage.getItem('accessToken');
  
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

/**
 * Get auth headers for multipart/form-data requests (file uploads)
 * Note: Don't set Content-Type for FormData, browser will set it automatically with boundary
 */
export function getAuthHeadersForFormData(): HeadersInit {
  if (typeof window === 'undefined') {
    return {};
  }

  const token = localStorage.getItem('accessToken');
  
  return {
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('accessToken');
}

/**
 * Get stored access token
 */
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}
