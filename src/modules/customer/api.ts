import apiClient from '@/lib/axios-client';
import { API_ENDPOINTS } from '@/config/api-endpoints';
import { CUSTOMER, CREATE_CUSTOMER } from './types';



export const CustomerApi = {
    getAll: () => apiClient.get<CUSTOMER[]>(API_ENDPOINTS.RELATIVE.CUSTOMERS.LIST),
    create: (data: CREATE_CUSTOMER) => apiClient.post<CREATE_CUSTOMER>(API_ENDPOINTS.RELATIVE.CUSTOMERS.CREATE, data),
    getById: (id: string) => apiClient.get<CUSTOMER>(API_ENDPOINTS.RELATIVE.CUSTOMERS.GET(id)),
    update: (id: number | string, data: CREATE_CUSTOMER) => apiClient.put<CREATE_CUSTOMER>(API_ENDPOINTS.RELATIVE.CUSTOMERS.UPDATE(id), data),
    delete: (id: number | string) => apiClient.delete<CUSTOMER>(API_ENDPOINTS.RELATIVE.CUSTOMERS.DELETE(id)),
};
