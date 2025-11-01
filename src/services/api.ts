import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { authService } from './auth';
import { APIResponse } from '@/types';

export class APIService {
  private static instance: APIService;
  private client: AxiosInstance;

  private constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      async (config) => {
        const token = await authService.getIdToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse<APIResponse>) => {
        return response;
      },
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid, redirect to login
          authService.signOut();
        }
        return Promise.reject(this.handleError(error));
      }
    );
  }

  public static getInstance(): APIService {
    if (!APIService.instance) {
      APIService.instance = new APIService();
    }
    return APIService.instance;
  }

  /**
   * Generic GET request
   */
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<APIResponse<T>>(url, config);
    return this.handleResponse(response);
  }

  /**
   * Generic POST request
   */
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<APIResponse<T>>(url, data, config);
    return this.handleResponse(response);
  }

  /**
   * Generic PUT request
   */
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<APIResponse<T>>(url, data, config);
    return this.handleResponse(response);
  }

  /**
   * Generic DELETE request
   */
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<APIResponse<T>>(url, config);
    return this.handleResponse(response);
  }

  /**
   * Stream endpoint for real-time responses
   */
  async stream(url: string, data?: any, onChunk?: (chunk: string) => void): Promise<void> {
    const token = await authService.getIdToken();
    
    const response = await fetch(`${this.client.defaults.baseURL}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body reader available');
    }

    const decoder = new TextDecoder();
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        if (onChunk) {
          onChunk(chunk);
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Handle API response
   */
  private handleResponse<T>(response: AxiosResponse<APIResponse<T>>): T {
    const { data } = response;
    
    if (!data.success) {
      throw new Error(data.error?.message || 'API request failed');
    }
    
    return data.data as T;
  }

  /**
   * Handle API errors
   */
  private handleError(error: any): Error {
    if (error.response?.data?.error) {
      return new Error(error.response.data.error.message);
    }
    
    if (error.code === 'ECONNABORTED') {
      return new Error('Request timeout. Please try again.');
    }
    
    if (error.code === 'ERR_NETWORK') {
      return new Error('Network error. Please check your connection.');
    }
    
    return new Error(error.message || 'An unexpected error occurred');
  }
}

// Export singleton instance
export const apiService = APIService.getInstance();