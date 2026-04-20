import { BlogListResponse, BlogPost } from '@/types/blog';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add auth token if available
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      throw new ApiError(response.status, errorData.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(0, 'Network error occurred');
  }
}

// Devotion API
export const devotionApi = {
  getCurrent: () => apiRequest<ApiResponse>('/api/devotions/current'),
  getPrevious: (page = 1, limit = 6) => 
    apiRequest<ApiResponse>(`/api/devotions/previous?page=${page}&limit=${limit}`),
  getById: (id: string) => apiRequest<ApiResponse>(`/api/devotions/${id}`),
  create: (data: FormData) => apiRequest<ApiResponse>('/api/devotions', {
    method: 'POST',
    headers: {}, // Remove Content-Type for FormData
    body: data,
  }),
  update: (id: string, data: FormData) => apiRequest<ApiResponse>(`/api/devotions/${id}`, {
    method: 'PUT',
    headers: {}, // Remove Content-Type for FormData
    body: data,
  }),
  delete: (id: string) => apiRequest<ApiResponse>(`/api/devotions/${id}`, {
    method: 'DELETE',
  }),
  activate: (id: string) => apiRequest<ApiResponse>(`/api/devotions/${id}/activate`, {
    method: 'PUT',
  }),
};

// Blog API
export const blogApi = {
  getPublished: (page = 1, limit = 6, search = '') =>
      apiRequest<ApiResponse<BlogListResponse>>(`/api/blogs?page=${page}&limit=${limit}&search=${search}`),

  getById: (id: string) =>
      apiRequest<ApiResponse<BlogPost>>(`/api/blogs/${id}`),

  getLatest: (limit = 3) =>
      apiRequest<ApiResponse<BlogPost[]>>(`/api/blogs/latest?limit=${limit}`),

  create: (data: FormData) =>
      apiRequest<ApiResponse<BlogPost>>('/api/blogs', {
        method: 'POST',
        headers: {},
        body: data,
      }),

  update: (id: string, data: FormData) =>
      apiRequest<ApiResponse<BlogPost>>(`/api/blogs/${id}`, {
        method: 'PUT',
        headers: {},
        body: data,
      }),

  delete: (id: string) =>
      apiRequest<ApiResponse<{ message: string }>>(`/api/blogs/${id}`, {
        method: 'DELETE',
      }),
};

// Gallery API
export const galleryApi = {
  getAll: (page = 1, limit = 12, category = '') => 
    apiRequest<ApiResponse>(`/api/gallery?page=${page}&limit=${limit}&category=${category}`),
  create: (data: FormData) => apiRequest<ApiResponse>('/api/gallery', {
    method: 'POST',
    headers: {},
    body: data,
  }),
  update: (id: string, data: FormData) => apiRequest<ApiResponse>(`/api/gallery/${id}`, {
    method: 'PUT',
    headers: {},
    body: data,
  }),
  delete: (id: string) => apiRequest<ApiResponse>(`/api/gallery/${id}`, {
    method: 'DELETE',
  }),
};

// Auth API
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    apiRequest<ApiResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  register: (userData: { name: string; email: string; password: string }) =>
    apiRequest<ApiResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
  getProfile: () => apiRequest<ApiResponse>('/api/auth/profile'),
};

export { ApiError };