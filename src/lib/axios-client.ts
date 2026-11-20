// lib/axios-client.ts — Tier 2 Auth: Auto-refresh access token on 401/403
import axios, {
    AxiosInstance,
    AxiosError,
    InternalAxiosRequestConfig
} from 'axios';
import { getToken, setToken, clearAuth } from './auth';

// Queue system for handling concurrent requests during token refresh
let isRefreshing = false;
let failedQueue: { resolve: (token: string) => void; reject: (error: any) => void }[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) {
            reject(error);
        } else if (token) {
            resolve(token);
        }
    });
    failedQueue = [];
};

// Create axios instance with base configuration
const apiClient: AxiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Enable cookies (needed for refresh_token HttpOnly cookie)
});

// ✅ Request interceptor - Add Bearer token to all requests
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = getToken();

        // Add Authorization header if token exists
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error: AxiosError) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
    }
);

// ✅ Response interceptor - Auto-refresh on 401/403, handle errors globally
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Skip refresh logic for login and refresh endpoints themselves
        if (
            originalRequest?.url?.includes('/api/login') ||
            originalRequest?.url?.includes('/api/auth/refresh') ||
            originalRequest?.url?.includes('/auth/login') ||
            originalRequest?.url?.includes('/auth/refresh')
        ) {
            return Promise.reject(error);
        }

        // If we get 401/403 and haven't retried yet, attempt token refresh
        if (
            (error.response?.status === 401 || error.response?.status === 403) &&
            !originalRequest._retry
        ) {
            // If already refreshing, queue this request
            if (isRefreshing) {
                return new Promise<string>((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                    }
                    return apiClient(originalRequest);
                }).catch((err) => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Call the refresh endpoint — refresh_token cookie is sent automatically
                const response = await axios.post('/api/auth/refresh', {}, {
                    withCredentials: true,
                });

                const { accessToken } = response.data;

                if (accessToken) {
                    // Store the new access token
                    setToken(accessToken);
                    processQueue(null, accessToken);

                    // Retry the original request with the new token
                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    }
                    return apiClient(originalRequest);
                } else {
                    throw new Error('No access token in refresh response');
                }
            } catch (refreshError) {
                processQueue(refreshError, null);

                // Refresh failed — clear auth and redirect to login
                clearAuth();
                if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        // For non-auth errors, extract error message
        const errorMessage =
            (error.response?.data as { message?: string })?.message ||
            error.message ||
            'An unexpected error occurred';

        console.error('❌ Response Error:', {
            status: error.response?.status,
            message: errorMessage,
            url: error.config?.url,
        });

        return Promise.reject(error);
    }
);

export default apiClient;