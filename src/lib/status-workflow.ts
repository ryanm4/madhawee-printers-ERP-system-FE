import { JobTicketStatus, PurchaseOrderStatus, QuotationStatus } from "@/config/enum";

export const getNextJobTicketStatus = (currentStatus: string): JobTicketStatus | null => {
    const statusOrder = [
        JobTicketStatus.CREATED,
        JobTicketStatus.IN_PRODUCTION,
        JobTicketStatus.PARTIALLY_DISPATCHED,
        JobTicketStatus.COMPLETED
    ];

    const currentIndex = statusOrder.indexOf(currentStatus as JobTicketStatus);

    // User can only change status manually up to IN PRODUCTION
    if (currentIndex === -1 || currentStatus === JobTicketStatus.IN_PRODUCTION || currentIndex >= statusOrder.indexOf(JobTicketStatus.IN_PRODUCTION)) {
        return null;
    }

    return statusOrder[currentIndex + 1];
};

export const getNextQuotationStatus = (currentStatus: string): QuotationStatus | null => {
    const statusOrder = [
        QuotationStatus.CREATED,
        QuotationStatus.ACCEPTED
    ];
    // Note: REJECTED is a terminal state that doesn't fit a simple linear "next" flow usually, 
    // but maybe we can just allow moving to Completed?
    // Or maybe we treat REJECTED as an alternative to APPROVED?
    // For a linear flow user request, let's stick to the happy path.

    const currentIndex = statusOrder.indexOf(currentStatus as QuotationStatus);
    if (currentIndex === -1 || currentIndex === statusOrder.length - 1) {
        return null;
    }
    return statusOrder[currentIndex + 1];
};

export const getNextPurchaseOrderStatus = (currentStatus: string): PurchaseOrderStatus | null => {
    const statusOrder = [
        PurchaseOrderStatus.CREATED,
        PurchaseOrderStatus.APPROVED,
        PurchaseOrderStatus.COMPLETED
    ];

    const currentIndex = statusOrder.indexOf(currentStatus as PurchaseOrderStatus);
    if (currentIndex === -1 || currentIndex === statusOrder.length - 1) {
        return null;
    }
    return statusOrder[currentIndex + 1];
};
