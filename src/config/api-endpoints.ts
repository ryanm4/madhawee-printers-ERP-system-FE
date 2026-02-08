const API_BASE_URL = process.env.MADHAWEE_PRINTERS_ERP_BASE_URL;
const NEXTJS_API_BASE = '/api';
export const API_ENDPOINTS = {

    PURCHASE_ORDERS: {
        LIST: `${API_BASE_URL}/purchase_orders`,
        CREATE: `${API_BASE_URL}/purchase_orders`,
        UPDATE: (poId: number | string) => `${API_BASE_URL}/purchase_orders/${poId}`,
        GET: (poId: number | string) => `${API_BASE_URL}/purchase_orders/${poId}`,
        DELETE: (poId: number | string) => `${API_BASE_URL}/purchase_orders/${poId}`,
    },
    INVENTORY: {
        LIST: `${API_BASE_URL}/inventory`,
        CREATE: `${API_BASE_URL}/inventory`,
        GET: (item_id: number | string) => `${API_BASE_URL}/inventory/${item_id}`,
        UPDATE: (item_id: number | string) => `${API_BASE_URL}/inventory/${item_id}`,
        DELETE: (item_id: number | string) => `${API_BASE_URL}/inventory/${item_id}`,

    },
    QUOTATIONS: {
        LIST: `${API_BASE_URL}/quotes`,
        CREATE: `${API_BASE_URL}/quotes`,
        UPDATE: (quoteId: number | string) => `${API_BASE_URL}/quotes/${quoteId}`,
        DELETE: (quoteId: number | string) => `${API_BASE_URL}/quotes/${quoteId}`,
        GET: (quoteId: number | string) => `${API_BASE_URL}/quotes/${quoteId}`,
        GET_CUSTOMER: (customerId: number | string) => `${API_BASE_URL}/quotes/customer/${customerId}`,
    },
    JOB_TICKETS: {
        LIST: `${API_BASE_URL}/jobs`,
        CREATE: `${API_BASE_URL}/jobs`,
        GET: (jobId: number | string) => `${API_BASE_URL}/jobs/${jobId}`,
        UPDATE: (jobId: number | string) => `${API_BASE_URL}/jobs/${jobId}`,
        DELETE: (jobId: number | string) => `${API_BASE_URL}/jobs/${jobId}`,

    },
    DISPATCH: {
        LIST: `${API_BASE_URL}/dispatch`,
        CREATE: `${API_BASE_URL}/dispatch`,
        UPDATE: (dispatch_id: number | string) => `${API_BASE_URL}/dispatch/${dispatch_id}`,
        DELETE: (dispatch_id: number | string) => `${API_BASE_URL}/dispatch/${dispatch_id}`,
        GET: (dispatch_id: number | string) => `${API_BASE_URL}/dispatch/${dispatch_id}`,
    },
    CUSTOMERS: {
        LIST: `${API_BASE_URL}/customers`,
        CREATE: `${API_BASE_URL}/customers`,
        UPDATE: (customerId: number | string) => `${API_BASE_URL}/customers/${customerId}`,
        DELETE: (customerId: number | string) => `${API_BASE_URL}/customers/${customerId}`,
        GET: (customerId: number | string) => `${API_BASE_URL}/customers/${customerId}`,
    },

    USER: {
        LIST: `${API_BASE_URL}/auth/users`,
        CREATE: `${API_BASE_URL}/auth/register`,
        UPDATE: (userID: number | string) => `${API_BASE_URL}/auth/users/${userID}`,
        DELETE: (userID: number | string) => `${API_BASE_URL}/auth/users/${userID}`,
        GET: (userID: number | string) => `${API_BASE_URL}/auth/users/${userID}`,
    },

    AUTH: {
        LOGIN: `${API_BASE_URL}/auth/login`,
    },

    DASHBOARD_KPI: {
        CREATE: `${API_BASE_URL}/reports/dashboard/insights`,
    },
    REPORTS: {
        CREATE: `${API_BASE_URL}/reports`,
    },


    RELATIVE: {
        PURCHASE_ORDERS: {
            LIST: `${NEXTJS_API_BASE}/purchase-orders`,
            CREATE: `${NEXTJS_API_BASE}/purchase-orders`,
            UPDATE: (poId: number | string) => `${NEXTJS_API_BASE}/purchase-orders/${poId}`,
            GET: (poId: number | string) => `${NEXTJS_API_BASE}/purchase-orders/${poId}`,
            DELETE: (poId: number | string) => `${NEXTJS_API_BASE}/purchase-orders/${poId}`,
        },
        INVENTORY: {
            LIST: `${NEXTJS_API_BASE}/inventory`,
            CREATE: `${NEXTJS_API_BASE}/inventory`,
            GET: (item_id: number | string) => `${NEXTJS_API_BASE}/inventory/${item_id}`,
            UPDATE: (item_id: number | string) => `${NEXTJS_API_BASE}/inventory/${item_id}`,
            DELETE: (item_id: number | string) => `${NEXTJS_API_BASE}/inventory/${item_id}`,
        },
        QUOTATIONS: {
            LIST: `${NEXTJS_API_BASE}/quotes`,
            CREATE: `${NEXTJS_API_BASE}/quotes`,
            UPDATE: (quoteId: number | string) => `${NEXTJS_API_BASE}/quotes/${quoteId}`,
            DELETE: (quoteId: number | string) => `${NEXTJS_API_BASE}/quotes/${quoteId}`,
            GET: (quoteId: number | string) => `${NEXTJS_API_BASE}/quotes/${quoteId}`,
            GET_CUSTOMER: (customerId: number | string) => `${NEXTJS_API_BASE}/quotes/customer/${customerId}`,
        },
        JOB_TICKETS: {
            LIST: `${NEXTJS_API_BASE}/jobs`,
            CREATE: `${NEXTJS_API_BASE}/jobs`,
            GET: (jobId: number | string) => `${NEXTJS_API_BASE}/jobs/${jobId}`,
            UPDATE: (jobId: number | string) => `${NEXTJS_API_BASE}/jobs/${jobId}`,
            DELETE: (jobId: number | string) => `${NEXTJS_API_BASE}/jobs/${jobId}`,
        },
        DISPATCH: {
            LIST: `${NEXTJS_API_BASE}/dispatch`,
            CREATE: `${NEXTJS_API_BASE}/dispatch`,
            UPDATE: (dispatch_id: number | string) => `${NEXTJS_API_BASE}/dispatch/${dispatch_id}`,
            DELETE: (dispatch_id: number | string) => `${NEXTJS_API_BASE}/dispatch/${dispatch_id}`,
            GET: (dispatch_id: number | string) => `${NEXTJS_API_BASE}/dispatch/${dispatch_id}`,
        },
        CUSTOMERS: {
            LIST: `${NEXTJS_API_BASE}/customers`,
            CREATE: `${NEXTJS_API_BASE}/customers`,
            UPDATE: (customerId: number | string) => `${NEXTJS_API_BASE}/customers/${customerId}`,
            DELETE: (customerId: number | string) => `${NEXTJS_API_BASE}/customers/${customerId}`,
            GET: (customerId: number | string) => `${NEXTJS_API_BASE}/customers/${customerId}`,
        },

        USER: {
            LIST: `${NEXTJS_API_BASE}/users`,
            CREATE: `${NEXTJS_API_BASE}/users`,
            UPDATE: (userID: number | string) => `${NEXTJS_API_BASE}/users/${userID}`,
            DELETE: (userID: number | string) => `${NEXTJS_API_BASE}/users/${userID}`,
            GET: (userID: number | string) => `${NEXTJS_API_BASE}/users/${userID}`,
        },

        AUTH: {
            LOGIN: `${NEXTJS_API_BASE}/login`,
        },

        REPORTS: {
            DASHBOARD_KPI: {
                CREATE: `${NEXTJS_API_BASE}/reports/dashboard/insights`,
            },
            CREATE: `${NEXTJS_API_BASE}/reports`,
        },

    }

} as const;

