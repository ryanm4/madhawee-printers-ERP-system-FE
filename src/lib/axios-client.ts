// lib/axios-client.ts
import axios, {
    AxiosInstance,
    AxiosError,
    InternalAxiosRequestConfig
} from 'axios';
import { getToken, clearAuth } from './auth';

// Create axios instance with base configuration
const apiClient: AxiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Enable cookies
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

// ✅ Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
    (response) => {
        // Log response in development


        return response;
    },
    async (error: AxiosError) => {
        // Handle 401 Unauthorized - Clear auth and redirect
        // Skip for login page requests to allow form to handle "Invalid credentials"
        if (error.response?.status === 401 && !error.config?.url?.includes('/api/login')) {
            console.log('🔒 Unauthorized - Logging out');
            clearAuth();

            // Redirect to login if not already there
            if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }

        // Handle 403 Forbidden
        if (error.response?.status === 403) {
            console.log(error.response)
            console.error('🚫 Forbidden - Insufficient permissions');
        }

        // Extract error message
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