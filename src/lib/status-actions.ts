import { JobTicketStatus, QuotationStatus } from "@/config/enum";
import type { ClientPermissions } from "@/lib/permissions";

/** One status a record can be moved to, as offered on its view screen */
export interface StatusAction {
  to: string;
  /** The button text, e.g. "Approve order" */
  label: string;
  /** What happens, in plain words, shown before confirming */
  description: string;
  /** Why it can't be done right now; the option shows but can't be picked */
  blockedReason?: string;
}

/**
 * Which status changes the signed-in user may make on a record. Each step is offered
 * only to the roles allowed to make it; anyone else sees the status but no way to change it.
 */
export const statusActions = {
  quotation(status: string, p: ClientPermissions): StatusAction[] {
    // Accepting or rejecting is an approval decision
    if (!p.canApprove) return [];
    const actions: StatusAction[] = [];
    if (status !== QuotationStatus.ACCEPTED) {
      actions.push({
        to: QuotationStatus.ACCEPTED,
        label: "Accept quotation",
        description: "The customer has agreed to this quotation. It can then be printed.",
      });
    }
    if (status === QuotationStatus.CREATED) {
      actions.push({
        to: QuotationStatus.REJECTED,
        label: "Reject quotation",
        description: "The customer has turned this quotation down.",
      });
    }
    return actions;
  },

  /** None by hand: orders are approved when entered and complete themselves when all their jobs are done */
  purchaseOrder(): StatusAction[] {
    return [];
  },

  jobTicket(status: string, p: ClientPermissions): StatusAction[] {
    // Later stages (partly dispatched, completed) follow from dispatches, not by hand
    if (status === JobTicketStatus.CREATED && p.canUpdateJobTicketStatus) {
      return [{ to: JobTicketStatus.IN_PRODUCTION, label: "Start production", description: "Work on this job has begun on the floor." }];
    }
    return [];
  },
};
