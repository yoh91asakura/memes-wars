/**
 * Client API principal pour Meme Wars
 * Gère toutes les requêtes HTTP avec authentification et gestion d'erreurs
 */

import axios, { AxiosInstance, AxiosError, AxiosResponse, InternalAxiosRequestConfig, AxiosProgressEvent } from 'axios';

// Types pour les réponses API
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  timestamp: string;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

class ApiClient {
  private client: AxiosInstance;
  private refreshTokenPromise: Promise<string> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      withCredentials: true,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor pour ajouter le token d'auth
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.getStoredToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Log des requêtes en mode debug
        if (import.meta.env.VITE_DEBUG) {
          console.log(`🔵 API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data);
        }
        
        return config;
      },
      (error: AxiosError) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor pour gérer les erreurs et refresh tokens
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        // Log des réponses en mode debug
        if (import.meta.env.VITE_DEBUG) {
          console.log(`🟢 API Response: ${response.status}`, response.data);
        }
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Token expiré - tentative de refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newToken = await this.refreshToken();
            if (newToken && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            // Refresh échoué - déconnecter l'utilisateur
            this.handleAuthFailure();
            return Promise.reject(refreshError);
          }
        }

        // Log des erreurs
        console.error(`❌ API Error: ${error.response?.status}`, {
          url: error.config?.url,
          method: error.config?.method,
          data: error.response?.data,
        });

        return Promise.reject(this.normalizeError(error));
      }
    );
  }

  private getStoredToken(): string | null {
    return localStorage.getItem('authToken');
  }

  private async refreshToken(): Promise<string | null> {
    // Éviter les multiples refreshes simultanés
    if (this.refreshTokenPromise) {
      return this.refreshTokenPromise;
    }

    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    this.refreshTokenPromise = this.client
      .post('/api/auth/refresh', { refreshToken })
      .then((response) => {
        const { token } = response.data.data;
        localStorage.setItem('authToken', token);
        this.refreshTokenPromise = null;
        return token;
      })
      .catch((error) => {
        this.refreshTokenPromise = null;
        throw error;
      });

    return this.refreshTokenPromise;
  }

  private handleAuthFailure() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    
    // Rediriger vers la page de login
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  private normalizeError(error: AxiosError): ApiError {
    const apiError: ApiError = {
      message: 'Une erreur est survenue',
      status: error.response?.status,
    };

    if (error.response?.data) {
      const data = error.response.data as any;
      apiError.message = data.message || data.error || apiError.message;
      apiError.code = data.code;
      apiError.details = data.details;
    } else if (error.message) {
      apiError.message = error.message;
    }

    return apiError;
  }

  // Méthodes publiques pour les requêtes HTTP
  async get<T>(url: string, params?: any): Promise<ApiResponse<T>> {
    const response = await this.client.get(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.client.post(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.client.put(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    const response = await this.client.delete(url);
    return response.data;
  }

  // Méthode pour les uploads de fichiers
  async upload<T>(url: string, file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.client.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent: AxiosProgressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return response.data;
  }

  // Health check du backend
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      const response = await this.client.get('/health');
      return response.data;
    } catch (error) {
      throw new Error('Backend non disponible');
    }
  }
}

// Instance singleton
export const apiClient = new ApiClient();
export default apiClient;
