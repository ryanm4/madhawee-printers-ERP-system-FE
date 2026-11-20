// Forwards /api/settings/* to the backend's /settings/*
import { backendRoutes } from "@/lib/backend-proxy";

export const { GET, POST, PUT, DELETE } = backendRoutes("settings");
