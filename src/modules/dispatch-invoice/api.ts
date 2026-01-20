import apiClient from '@/lib/axios-client';
import { API_ENDPOINTS } from '@/config/api-endpoints';
import { CREATE_DISPATCH, ALL_DISPATCH } from './types';



export const dispatchInventoryApi = {
    getAll: () => apiClient.get<ALL_DISPATCH[]>(API_ENDPOINTS.RELATIVE.DISPATCH.LIST),
    create: (data: CREATE_DISPATCH) => apiClient.post<CREATE_DISPATCH>(API_ENDPOINTS.RELATIVE.DISPATCH.CREATE, data),
    getById: (id: number | string) => apiClient.get<ALL_DISPATCH>(API_ENDPOINTS.RELATIVE.DISPATCH.GET(id)),
    update: (id: number | string, data: CREATE_DISPATCH) => apiClient.put<CREATE_DISPATCH>(API_ENDPOINTS.RELATIVE.DISPATCH.UPDATE(id), data),
    delete: (id: number | string) => apiClient.delete<ALL_DISPATCH>(API_ENDPOINTS.RELATIVE.DISPATCH.DELETE(id)),
};
