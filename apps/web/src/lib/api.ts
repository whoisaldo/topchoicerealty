import axios from 'axios';
import type { User, Listing, Customer, PaginatedListings, ListingsQuery } from './types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add timestamp to prevent caching issues
    if (config.method === 'get') {
      config.params = { ...config.params, _t: Date.now() };
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log errors in development
    if (import.meta.env.DEV) {
      console.error('API Error:', error);
    }
    return Promise.reject(error);
  }
);

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ user: User }>('/auth/login', { email, password }),

  logout: () => api.post('/auth/logout'),

  me: () => api.get<{ user: User }>('/auth/me'),

  updateProfile: (data: Partial<User>) =>
    api.put<{ user: User }>('/auth/profile', data),
};

// Public listings
export const listingsApi = {
  getAll: (query: ListingsQuery) =>
    api.get<PaginatedListings>('/listings', { params: query }),

  getById: (id: string) => api.get<{ listing: Listing }>(`/listings/${id}`),

  getNeighborhoods: () => api.get<{ neighborhoods: string[] }>('/listings/neighborhoods'),
};

// Agent listings
export const agentListingsApi = {
  getAll: () => api.get<{ listings: Listing[] }>('/agent/listings'),

  create: (data: Partial<Listing>) =>
    api.post<{ listing: Listing }>('/agent/listings', data),

  update: (id: string, data: Partial<Listing>) =>
    api.put<{ listing: Listing }>(`/agent/listings/${id}`, data),

  updateStatus: (id: string, status: 'active' | 'pending' | 'sold') =>
    api.patch<{ listing: Listing }>(`/agent/listings/${id}/status`, { status }),

  delete: (id: string) => api.delete(`/agent/listings/${id}`),
};

// Inquiries
export const inquiriesApi = {
  create: (data: {
    listingId: string;
    name: string;
    email: string;
    phone?: string;
    message: string;
  }) => api.post<{ ok: boolean; inquiry: { id: string } }>('/inquiries', data),
};

// Agents (public)
export const agentsApi = {
  getAll: () => api.get<{ agents: User[] }>('/agents'),
};

// Customers
export const customersApi = {
  getAll: (query?: { q?: string }) =>
    api.get<{ customers: Customer[] }>('/agent/customers', { params: query }),

  create: (data: Partial<Customer>) =>
    api.post<{ customer: Customer }>('/agent/customers', data),

  update: (id: string, data: Partial<Customer>) =>
    api.put<{ customer: Customer }>(`/agent/customers/${id}`, data),

  delete: (id: string) => api.delete(`/agent/customers/${id}`),
};

export default api;

