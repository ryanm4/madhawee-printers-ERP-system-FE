export interface GENERATE_KPI {
    dateFrom: Date;
    dateTo: Date;
}

export interface KPIItem {
    key: string;
    value: number | string;
}

export interface AnalyticsData {
    jobStats: {
        total_jobs: number | string;
        completed_jobs: number | string;
        production_efficiency: number | string;
    };
    dispatchStats: {
        total_dispatches: number | string;
        completed_dispatches: number | string;
    };
    revenueTrend: Array<{ month: string; revenue: string | number }>;
}

export interface KPIResponse {
    kpis: KPIItem[];
    insights?: string[];
    analytics?: AnalyticsData;
}