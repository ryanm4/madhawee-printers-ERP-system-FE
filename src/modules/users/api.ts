import apiClient from '@/lib/axios-client';
import { API_ENDPOINTS } from '@/config/api-endpoints';
import { CREATE_USER, EDIT_USER, GET_ALL_USER } from './types';



export const userApi = {
    getAll: () => apiClient.get<GET_ALL_USER[]>(API_ENDPOINTS.RELATIVE.USER.LIST),
    create: (data: CREATE_USER) => apiClient.post<CREATE_USER>(API_ENDPOINTS.RELATIVE.USER.CREATE, data),
    getById: (id: string) => apiClient.get<GET_ALL_USER>(API_ENDPOINTS.RELATIVE.USER.GET(id)),
    update: (id: number | string, data: EDIT_USER) => apiClient.put<EDIT_USER>(API_ENDPOINTS.RELATIVE.USER.UPDATE(id), data),
    delete: (id: number | string) => apiClient.delete<GET_ALL_USER>(API_ENDPOINTS.RELATIVE.USER.DELETE(id)),
};
