import apiClient from '@/lib/axiosClient';
import { API_ENDPOINTS } from '@/config/apihelper';
import { PURCHASE_ORDER } from '@/types/purchse_orders';

export const purchaseOrderApi = {
    getAll: () => apiClient.get<PURCHASE_ORDER[]>(API_ENDPOINTS.RELATIVE.PURCHASE_ORDERS.LIST),
    create: (data: any) => apiClient.post(API_ENDPOINTS.RELATIVE.PURCHASE_ORDERS.CREATE, data),
    getById: (id: string) => apiClient.get(API_ENDPOINTS.RELATIVE.PURCHASE_ORDERS.GET(id)),
    update: (id: string, data: any) => apiClient.put(API_ENDPOINTS.RELATIVE.PURCHASE_ORDERS.UPDATE(id), data),
    delete: (id: string) => apiClient.delete(API_ENDPOINTS.RELATIVE.PURCHASE_ORDERS.DELETE(id)),
};
