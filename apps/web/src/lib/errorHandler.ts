import toast from 'react-hot-toast';

export interface ApiError {
  response?: {
    data?: {
      error?: string;
      message?: string;
      details?: Array<{
        field: string;
        message: string;
      }>;
    };
    status?: number;
  };
  message?: string;
}

export function handleApiError(error: ApiError, fallbackMessage = 'An error occurred') {
  console.error('API Error:', error);

  // Network errors
  if (!error.response) {
    toast.error('Network error. Please check your connection.');
    return;
  }

  const { status, data } = error.response;

  // Handle different error types
  if (data?.details && Array.isArray(data.details)) {
    // Validation errors
    const firstError = data.details[0];
    toast.error(firstError.message || 'Validation error');
  } else if (data?.error) {
    // Server error messages
    toast.error(data.error);
  } else if (data?.message) {
    // Generic server messages
    toast.error(data.message);
  } else {
    // Status-based error messages
    switch (status) {
      case 401:
        toast.error('Authentication required');
        break;
      case 403:
        toast.error('Access denied');
        break;
      case 404:
        toast.error('Resource not found');
        break;
      case 429:
        toast.error('Too many requests. Please try again later.');
        break;
      case 500:
        toast.error('Server error. Please try again later.');
        break;
      default:
        toast.error(fallbackMessage);
    }
  }
}

export function isNetworkError(error: ApiError): boolean {
  return !error.response && error.message?.includes('Network Error') === true;
}

export function isAuthError(error: ApiError): boolean {
  return error.response?.status === 401;
}
