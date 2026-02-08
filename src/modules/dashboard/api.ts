import apiClient from '@/lib/axios-client';
import { API_ENDPOINTS } from '@/config/api-endpoints';
import { GENERATE_KPI, KPIItem, KPIResponse } from './types';



export const DashboardApi = {

    create: (data: GENERATE_KPI) => apiClient.post<KPIResponse>(API_ENDPOINTS.RELATIVE.REPORTS.DASHBOARD_KPI.CREATE, data),

};
