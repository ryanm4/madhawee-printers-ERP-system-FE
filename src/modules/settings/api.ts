import apiClient from '@/lib/axios-client';
import { API_ENDPOINTS } from '@/config/api-endpoints';

export const SettingsApi = {
    getCurrencyRate: () => apiClient.get<any>('/api/v1/currency/rate'),
    updateCurrencyRate: (data: { rate: number }) => apiClient.put<any>('/api/v1/currency/rate', data),
};
