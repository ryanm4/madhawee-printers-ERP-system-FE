export interface GENERATE_KPI {
    dateFrom: string;
    dateTo: string;
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
    stockReminders?: Array<{
        item_name: string;
        item_sub_category: string;
        size: string;
        quantity?: number;
        available_qty?: number;
        reorder_level: number;
        stock_status: 'BELOW' | 'NEAR';
    }>;
}

export interface KPIResponse {
    kpis: KPIItem[];
    insights?: string[];
    analytics?: AnalyticsData;
}