import apiClient from '@/lib/axios-client';
import { API_ENDPOINTS } from '@/config/api-endpoints';
import { ALL_TICKETS, CREATE_TICKETS, JOB_TICKET_DETAIL } from './types';

export const jobTicketsApi = {
    getAll: () => apiClient.get<ALL_TICKETS[]>(API_ENDPOINTS.RELATIVE.JOB_TICKETS.LIST),
    create: (data: CREATE_TICKETS) => apiClient.post<CREATE_TICKETS>(API_ENDPOINTS.RELATIVE.JOB_TICKETS.CREATE, data),
    getById: (id: number | string) => apiClient.get<JOB_TICKET_DETAIL>(API_ENDPOINTS.RELATIVE.JOB_TICKETS.GET(id)),
    update: (id: number | string, data: CREATE_TICKETS) => apiClient.put<CREATE_TICKETS>(API_ENDPOINTS.RELATIVE.JOB_TICKETS.UPDATE(id), data),
    delete: (id: number | string) => apiClient.delete<ALL_TICKETS>(API_ENDPOINTS.RELATIVE.JOB_TICKETS.DELETE(id)),
};
