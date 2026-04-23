import apiClient from '@/lib/axios-client';
import { API_ENDPOINTS } from '@/config/api-endpoints';
import { SUPPLIER, CREATE_SUPPLIER, UPDATE_SUPPLIER } from './types';

export const SupplierApi = {
    getAll: () => apiClient.get<SUPPLIER[]>(API_ENDPOINTS.RELATIVE.CUSTOMERS.LIST),
    create: (data: CREATE_SUPPLIER) => apiClient.post<CREATE_SUPPLIER>(API_ENDPOINTS.RELATIVE.CUSTOMERS.CREATE, data),
    getById: (id: string) => apiClient.get<SUPPLIER>(API_ENDPOINTS.RELATIVE.CUSTOMERS.GET(id)),
    update: (id: number | string, data: UPDATE_SUPPLIER) => apiClient.put<UPDATE_SUPPLIER>(API_ENDPOINTS.RELATIVE.CUSTOMERS.UPDATE(id), data),
    delete: (id: number | string) => apiClient.delete<SUPPLIER>(API_ENDPOINTS.RELATIVE.CUSTOMERS.DELETE(id)),
};
