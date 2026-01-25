import apiClient from '@/lib/axios-client';
import { API_ENDPOINTS } from '@/config/api-endpoints';
import { CREATE_QUOTATION_REQUEST, DELETE_QUOTATION_REQUEST, QUOTATIONS, UPDATE_QUOTATION_REQUEST } from './types';

export const quotationApi = {
    getAll: () => apiClient.get<QUOTATIONS[]>(API_ENDPOINTS.RELATIVE.QUOTATIONS.LIST),
    create: (data: CREATE_QUOTATION_REQUEST) => apiClient.post<QUOTATIONS>(API_ENDPOINTS.RELATIVE.QUOTATIONS.CREATE, data),
    getById: (id: string | number) => apiClient.get<QUOTATIONS>(API_ENDPOINTS.RELATIVE.QUOTATIONS.GET(id)),
    update: (id: string | number, data: UPDATE_QUOTATION_REQUEST) => apiClient.put<UPDATE_QUOTATION_REQUEST>(API_ENDPOINTS.RELATIVE.QUOTATIONS.UPDATE(id), data),
    delete: (id: string | number) => apiClient.delete<DELETE_QUOTATION_REQUEST>(API_ENDPOINTS.RELATIVE.QUOTATIONS.DELETE(id)),
};
