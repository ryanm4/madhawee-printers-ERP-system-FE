import apiClient from '@/lib/axios-client';
import { API_ENDPOINTS } from '@/config/api-endpoints';
import { CREATE_INVENTORY, GET_ALL_INVENTORY } from './types';



export const inventoryApi = {
    getAll: () => apiClient.get<GET_ALL_INVENTORY[]>(API_ENDPOINTS.RELATIVE.INVENTORY.LIST),
    create: (data: CREATE_INVENTORY) => apiClient.post<CREATE_INVENTORY>(API_ENDPOINTS.RELATIVE.INVENTORY.CREATE, data),
    getById: (id: number | string) => apiClient.get<GET_ALL_INVENTORY>(API_ENDPOINTS.RELATIVE.INVENTORY.GET(id)),
    update: (id: number | string, data: CREATE_INVENTORY) => apiClient.put<CREATE_INVENTORY>(API_ENDPOINTS.RELATIVE.INVENTORY.UPDATE(id), data),
    delete: (id: number | string) => apiClient.delete<GET_ALL_INVENTORY>(API_ENDPOINTS.RELATIVE.INVENTORY.DELETE(id)),
};
