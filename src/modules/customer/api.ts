import apiClient from '@/lib/axios-client';
import { API_ENDPOINTS } from '@/config/api-endpoints';
import { CUSTOMER } from './types';



export const CustomerApi = {
    getAll: () => apiClient.get<CUSTOMER[]>(API_ENDPOINTS.RELATIVE.CUSTOMERS.LIST),
    create: (data: CUSTOMER) => apiClient.post<CUSTOMER>(API_ENDPOINTS.RELATIVE.CUSTOMERS.CREATE, data),
    getById: (id: string) => apiClient.get<CUSTOMER>(API_ENDPOINTS.RELATIVE.CUSTOMERS.GET(id)),
    update: (id: string, data: CUSTOMER) => apiClient.put<CUSTOMER[]>(API_ENDPOINTS.RELATIVE.CUSTOMERS.UPDATE(id), data),
    delete: (id: string) => apiClient.delete<CUSTOMER>(API_ENDPOINTS.RELATIVE.CUSTOMERS.DELETE(id)),
};
