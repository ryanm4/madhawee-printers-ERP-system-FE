import apiClient from "@/lib/axios-client";
import { GRN } from "./types";
import { API_ENDPOINTS } from "@/config/api-endpoints";

export const grnApi = {
    getAll: async () => {
        const response = await apiClient.get<GRN[]>(API_ENDPOINTS.RELATIVE.GRN.LIST);
        return response;
    },
    getById: async (id: number | string) => {
        const response = await apiClient.get<GRN>(API_ENDPOINTS.RELATIVE.GRN.GET(id));
        return response;
    },
    create: async (data: any) => {
        const response = await apiClient.post<GRN>(API_ENDPOINTS.RELATIVE.GRN.CREATE, data);
        return response;
    },
    update: async (id: number | string, data: any) => {
        const response = await apiClient.put<GRN>(API_ENDPOINTS.RELATIVE.GRN.UPDATE(id), data);
        return response;
    },
    delete: async (id: number | string) => {
        const response = await apiClient.delete(API_ENDPOINTS.RELATIVE.GRN.DELETE(id));
        return response;
    },
};
