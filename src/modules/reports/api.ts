import apiClient from '@/lib/axios-client';
import { API_ENDPOINTS } from '@/config/api-endpoints';
import { CREATE_REPORT } from './types';

export const ReportsApi = {
    createSummary: (data: CREATE_REPORT) => apiClient.post<CREATE_REPORT>(API_ENDPOINTS.RELATIVE.REPORTS.SUMMARY, data),
    createAdvanced: (data: CREATE_REPORT) => apiClient.post<CREATE_REPORT>(API_ENDPOINTS.RELATIVE.REPORTS.ADVANCED, data),
};
