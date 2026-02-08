import apiClient from '@/lib/axios-client';
import { API_ENDPOINTS } from '@/config/api-endpoints';
import { LoginForm, LoginResponse } from './types';

export const loginApi = {
    login: (credentials: LoginForm) =>
        apiClient.post<LoginResponse>(API_ENDPOINTS.RELATIVE.AUTH.LOGIN, credentials),
};
