import apiClient from "@/lib/axios-client";
import { IssueNote } from "./types";
import { API_ENDPOINTS } from "@/config/api-endpoints";

export const issueNotesApi = {
    getAll: async () => {
        const response = await apiClient.get<IssueNote[]>(API_ENDPOINTS.RELATIVE.ISSUE_NOTES.LIST);
        return response;
    },
    getById: async (id: number | string) => {
        const response = await apiClient.get<IssueNote>(API_ENDPOINTS.RELATIVE.ISSUE_NOTES.GET(id));
        return response;
    },
    create: async (data: Partial<IssueNote>) => {
        const response = await apiClient.post<IssueNote>(API_ENDPOINTS.RELATIVE.ISSUE_NOTES.CREATE, data);
        return response;
    },
    update: async (id: number | string, data: Partial<IssueNote>) => {
        const response = await apiClient.put<IssueNote>(API_ENDPOINTS.RELATIVE.ISSUE_NOTES.UPDATE(id), data);
        return response;
    },
    delete: async (id: number | string) => {
        const response = await apiClient.delete(API_ENDPOINTS.RELATIVE.ISSUE_NOTES.DELETE(id));
        return response;
    },
};
