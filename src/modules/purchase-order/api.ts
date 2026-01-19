import apiClient from '@/lib/axios-client';
import { API_ENDPOINTS } from '@/config/api-endpoints';
import { PurchaseOrderType } from '@/config/enum';
import { CREATE_PURCHASE_ORDER, PURCHASE_ORDER } from './types';

export const purchaseOrderApi = {
    getAll: () => apiClient.get<PURCHASE_ORDER[]>(API_ENDPOINTS.RELATIVE.PURCHASE_ORDERS.LIST),
    create: (data: CREATE_PURCHASE_ORDER) => apiClient.post<PURCHASE_ORDER>(API_ENDPOINTS.RELATIVE.PURCHASE_ORDERS.CREATE, data),
    getById: (id: string) => apiClient.get<PURCHASE_ORDER>(API_ENDPOINTS.RELATIVE.PURCHASE_ORDERS.GET(id)),
    update: (id: string, data: PURCHASE_ORDER) => apiClient.put<PURCHASE_ORDER>(API_ENDPOINTS.RELATIVE.PURCHASE_ORDERS.UPDATE(id), data),
    delete: (id: string) => apiClient.delete<PURCHASE_ORDER>(API_ENDPOINTS.RELATIVE.PURCHASE_ORDERS.DELETE(id)),
};
