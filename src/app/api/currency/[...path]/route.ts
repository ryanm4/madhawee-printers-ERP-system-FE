// Forwards /api/currency/* (the USD rate) to the backend's /currency/*
import { backendRoutes } from "@/lib/backend-proxy";

export const { GET, PUT } = backendRoutes("currency");
