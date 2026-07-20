import apiClient from '@/lib/axios-client';
import { API_ENDPOINTS } from '@/config/api-endpoints';
import { CREATE_REPORT } from './types';

export const ReportsApi = {
    createSummary: (data: CREATE_REPORT) => apiClient.post<any>(API_ENDPOINTS.RELATIVE.REPORTS.SUMMARY, data),
    createAdvanced: (data: CREATE_REPORT) => apiClient.post<any>(API_ENDPOINTS.RELATIVE.REPORTS.ADVANCED, data),
    createCustomInventory: (data: any) => apiClient.post<any>(API_ENDPOINTS.RELATIVE.REPORTS.CUSTOM_INVENTORY, data),
    createCustomSales: (data: any) => apiClient.post<any>(API_ENDPOINTS.RELATIVE.REPORTS.CUSTOM_SALES, data),
};
