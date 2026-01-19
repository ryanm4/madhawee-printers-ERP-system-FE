import apiClient from '@/lib/axios-client';
import { API_ENDPOINTS } from '@/config/api-endpoints';
import { QUOTATIONS } from './types';

export const quotationApi = {
    getAll: () => apiClient.get<QUOTATIONS[]>(API_ENDPOINTS.RELATIVE.QUOTATIONS.LIST),
    create: (data: QUOTATIONS) => apiClient.post<QUOTATIONS>(API_ENDPOINTS.RELATIVE.QUOTATIONS.CREATE, data),
    getById: (id: string) => apiClient.get<QUOTATIONS>(API_ENDPOINTS.RELATIVE.QUOTATIONS.GET(id)),
    update: (id: string, data: QUOTATIONS) => apiClient.put<QUOTATIONS>(API_ENDPOINTS.RELATIVE.QUOTATIONS.UPDATE(id), data),
    delete: (id: string) => apiClient.delete<QUOTATIONS>(API_ENDPOINTS.RELATIVE.QUOTATIONS.DELETE(id)),
};
