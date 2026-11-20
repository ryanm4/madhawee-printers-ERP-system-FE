import apiClient from '@/lib/axios-client';
import { API_ENDPOINTS } from '@/config/api-endpoints';

import { CREATE_PURCHASE_ORDER, PURCHASE_ORDER, PURCHASE_ORDER_ID } from './types';

export const purchaseOrderApi = {
    getAll: () => apiClient.get<PURCHASE_ORDER[]>(API_ENDPOINTS.RELATIVE.PURCHASE_ORDERS.LIST),
    create: (data: CREATE_PURCHASE_ORDER) => apiClient.post<PURCHASE_ORDER>(API_ENDPOINTS.RELATIVE.PURCHASE_ORDERS.CREATE, data),
    getById: (id: string | number) => apiClient.get<PURCHASE_ORDER_ID>(API_ENDPOINTS.RELATIVE.PURCHASE_ORDERS.GET(id)),
    update: (id: number, data: CREATE_PURCHASE_ORDER) => apiClient.put<CREATE_PURCHASE_ORDER>(API_ENDPOINTS.RELATIVE.PURCHASE_ORDERS.UPDATE(id), data),
    delete: (id: number) => apiClient.delete<PURCHASE_ORDER>(API_ENDPOINTS.RELATIVE.PURCHASE_ORDERS.DELETE(id)),
};
