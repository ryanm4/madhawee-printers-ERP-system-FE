const API_BASE_URL = process.env.MADHAWEE_PRINTERS_ERP_BASE_URL;
const NEXTJS_API_BASE = '/api';
export const API_ENDPOINTS = {

    PURCHASE_ORDERS: {
        LIST: `${API_BASE_URL}/purchase_orders`,
        CREATE: `${API_BASE_URL}/purchase_orders`,
        UPDATE: (poId: string) => `${API_BASE_URL}/purchase_orders/${poId}`,
        GET: (poId: string) => `${API_BASE_URL}/purchase_orders/${poId}`,
        DELETE: (poId: string) => `${API_BASE_URL}/purchase_orders/${poId}`,
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
        UPDATE: (quoteId: string) => `${API_BASE_URL}/quotes/${quoteId}`,
        DELETE: (quoteId: string) => `${API_BASE_URL}/quotes/${quoteId}`,
        GET: (quoteId: string) => `${API_BASE_URL}/quotes/${quoteId}`,
        GET_CUSTOMER: (customerId: string) => `${API_BASE_URL}/quotes/customer/${customerId}`,
    },
    JOB_TICKETS: {
        LIST: `${API_BASE_URL}/jobs`,
        CREATE: `${API_BASE_URL}/jobs`,

    },
    DISPATCH: {
        LIST: `${API_BASE_URL}/dispatch`,
        CREATE: `${API_BASE_URL}/dispatch`,
        UPDATE: (dispatch_id: string) => `${API_BASE_URL}/dispatch/${dispatch_id}`,
        DELETE: (dispatch_id: string) => `${API_BASE_URL}/dispatch/${dispatch_id}`,
        GET: (dispatch_id: string) => `${API_BASE_URL}/dispatch/${dispatch_id}`,
    },
    CUSTOMERS: {
        LIST: `${API_BASE_URL}/customers`,
        CREATE: `${API_BASE_URL}/customers`,
        UPDATE: (customerId: string) => `${API_BASE_URL}/customers/${customerId}`,
        DELETE: (customerId: string) => `${API_BASE_URL}/customers/${customerId}`,
        GET: (customerId: string) => `${API_BASE_URL}/customers/${customerId}`,
    },


    RELATIVE: {
        PURCHASE_ORDERS: {
            LIST: `${NEXTJS_API_BASE}/purchase-orders`,
            CREATE: `${NEXTJS_API_BASE}/purchase-orders`,
            UPDATE: (poId: string) => `${NEXTJS_API_BASE}/purchase-orders/${poId}`,
            GET: (poId: string) => `${NEXTJS_API_BASE}/purchase-orders/${poId}`,
            DELETE: (poId: string) => `${NEXTJS_API_BASE}/purchase-orders/${poId}`,
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
            UPDATE: (quoteId: string) => `${NEXTJS_API_BASE}/quotes/${quoteId}`,
            DELETE: (quoteId: string) => `${NEXTJS_API_BASE}/quotes/${quoteId}`,
            GET: (quoteId: string) => `${NEXTJS_API_BASE}/quotes/${quoteId}`,
            GET_CUSTOMER: (customerId: string) => `${NEXTJS_API_BASE}/quotes/customer/${customerId}`,
        },
        JOB_TICKETS: {
            LIST: `${NEXTJS_API_BASE}/jobs`,
            CREATE: `${NEXTJS_API_BASE}/jobs`,
        },
        DISPATCH: {
            LIST: `${NEXTJS_API_BASE}/dispatch`,
            CREATE: `${NEXTJS_API_BASE}/dispatch`,
            UPDATE: (dispatch_id: string) => `${NEXTJS_API_BASE}/dispatch/${dispatch_id}`,
            DELETE: (dispatch_id: string) => `${NEXTJS_API_BASE}/dispatch/${dispatch_id}`,
            GET: (dispatch_id: string) => `${NEXTJS_API_BASE}/dispatch/${dispatch_id}`,
        },
        CUSTOMERS: {
            LIST: `${NEXTJS_API_BASE}/customers`,
            CREATE: `${NEXTJS_API_BASE}/customers`,
            UPDATE: (customerId: string) => `${NEXTJS_API_BASE}/customers/${customerId}`,
            DELETE: (customerId: string) => `${NEXTJS_API_BASE}/customers/${customerId}`,
            GET: (customerId: string) => `${NEXTJS_API_BASE}/customers/${customerId}`,
        },
    },
} as const;

