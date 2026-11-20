import { StatusPill, toneFor } from "./shared/status-text";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { parseLocalDate } from "@/hooks/sql-date-time";
import {
  EyeIcon,
  MoreVertical,
  PencilIcon,
  TrashIcon,
  Loader2,
  Printer,
  Boxes,
  CalendarDays,
  CircleCheck,
  Factory,
  FileText,
  Gauge,
  Hash,
  Package,
  Play,
} from "lucide-react";
import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { format } from "date-fns";
import { ALL_TICKETS } from "@/modules/job-tickets/types";
import { JobTicketStatus } from "@/config/enum";

export interface JobTicketCardOptions {
  canModify?: boolean;
  canUpdateStatus?: boolean;
}

export interface JobTicketCardProps {
  ticket: ALL_TICKETS;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onView: (id: number) => void;
  onDownload: (id: number) => void;
  onStatusChange: (id: number, status: string) => void;
  className?: string;
  permissions?: JobTicketCardOptions;
}

export function JobTicketCard({
  ticket,
  onEdit,
  onDelete,
  onView,
  onDownload,
  onStatusChange,
  className,
  permissions,
}: JobTicketCardProps) {
  const canModify = permissions?.canModify ?? true;
  const canUpdateStatus = permissions?.canUpdateStatus ?? true;
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const quantity = Number(ticket.quantity) || 0;
  const completed = Number(ticket.completed_qty) || 0;
  const done = quantity > 0 && completed >= quantity;
  // Once production has started the button is only a label, so it steps back visually
  const inProduction =
    ticket.status === JobTicketStatus.IN_PRODUCTION ||
    ticket.status === JobTicketStatus.PARTIALLY_DISPATCHED ||
    ticket.status === JobTicketStatus.COMPLETED;
  const progress =
    quantity > 0 ? Math.min(100, (completed / quantity) * 100) : 0;

  return (
    <Card
      className={cn(
        "relative flex w-full flex-col gap-0 overflow-hidden rounded-lg border-[#D9DFE8] p-0 pl-1 shadow-none",
        className
      )}
    >
      <div className="flex items-start gap-2 px-4 pt-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className="inline-flex min-w-0 items-center gap-1 text-[13px] text-[#4B5567]"
              title={ticket.job_number}
            >
              <Hash className="size-3.5 shrink-0" aria-hidden />
              <span className="shrink-0">Job no.</span>
              <span className="truncate font-semibold text-[#14213D]">
                {ticket.job_number}
              </span>
            </span>
            <StatusPill status={ticket.status} className="ml-auto text-xs" />
          </div>
          {/* Always two lines tall, so everything below lines up across cards */}
          <button
            type="button"
            onClick={() => onView(ticket.job_id)}
            className="mt-1.5 min-h-[2.75em] w-full rounded-sm text-left text-[15px] font-bold leading-[1.375] text-[#14213D] line-clamp-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#223F7A]/30"
            title={ticket.job_name}
          >
            {ticket.job_name}
          </button>
        </div>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="-mt-1 -mr-2 h-7 w-7 shrink-0 text-[#4B5567]"
              aria-label={`Actions for ${ticket.job_number || "job ticket"}`}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[200px]" align="end">
            <DropdownMenuItem onSelect={() => onView(ticket.job_id)}>
              <EyeIcon className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            {canModify && (
              <DropdownMenuItem onSelect={() => onEdit(ticket.job_id)}>
                <PencilIcon className="mr-2 h-4 w-4" />
                Edit Ticket
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onSelect={() => onDownload(ticket.job_id)}>
              <Printer className="mr-2 h-4 w-4" />
              Print Ticket
            </DropdownMenuItem>
            {canModify && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => onDelete(ticket.job_id)}
                  className="text-destructive focus:text-destructive"
                >
                  <TrashIcon className="mr-2 h-4 w-4" />
                  Delete Ticket
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Which order it belongs to, when it started, and what it is */}
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1 px-4 pt-2 text-[13px] text-[#4B5567]">
        <div
          className="flex min-w-0 items-center gap-1.5"
          title={ticket.customer_po}
        >
          <FileText className="size-3.5 shrink-0" aria-hidden />
          <dt className="shrink-0">PO</dt>
          <dd className="truncate font-semibold text-[#14213D]">
            {ticket.customer_po || "N/A"}
          </dd>
        </div>
        <div className="flex min-w-0 items-center gap-1.5">
          <CalendarDays className="size-3.5 shrink-0" aria-hidden />
          <dt className="shrink-0">Opened</dt>
          <dd className="truncate font-semibold text-[#14213D]">
            {ticket.job_open_date
              ? format(parseLocalDate(ticket.job_open_date), "dd MMM yyyy")
              : "N/A"}
          </dd>
        </div>
        <div
          className="col-span-2 flex min-w-0 items-center gap-1.5"
          title={ticket.product_type}
        >
          <Package className="size-3.5 shrink-0" aria-hidden />
          <dt className="sr-only">Product type</dt>
          <dd className="truncate font-semibold text-[#14213D]">
            {ticket.product_type || "N/A"}
          </dd>
        </div>
      </dl>

      {/* How much to make, and how much is done */}
      <div className="mx-4 mt-3 rounded-md border border-[#E6EAF0] px-3 py-2.5">
        <div className="flex flex-col gap-1 text-[13px] text-[#4B5567]">
          <span className="inline-flex items-center gap-1.5">
            <Boxes className="size-3.5 shrink-0" aria-hidden />
            Quantity{" "}
            <span className="text-base font-bold tabular-nums text-[#14213D]">
              {quantity.toLocaleString()}
            </span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            {done ? (
              <CircleCheck
                className="size-3.5 shrink-0 text-[#15803D]"
                aria-hidden
              />
            ) : (
              <Gauge className="size-3.5 shrink-0" aria-hidden />
            )}
            Completed{" "}
            <span
              className={cn(
                "font-bold tabular-nums",
                done ? "text-[#15803D]" : "text-[#B45309]"
              )}
            >
              {completed.toLocaleString()} of {quantity.toLocaleString()}
            </span>
            <span className="tabular-nums">({Math.round(progress)}%)</span>
          </span>
        </div>
        <div
          className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#EDF0F5]"
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Completed quantity"
        >
          <div
            className={cn(
              "h-full rounded-full",
              done ? "bg-[#16A34A]" : "bg-[#D97706]"
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-end px-4 pb-3">
        {canUpdateStatus && (
          <div className="mt-3">
            <Button
              className={cn(
                "h-9 w-full font-semibold",
                inProduction &&
                  "bg-[#F1F3F8] text-[#4B5567] disabled:opacity-100"
              )}
              onClick={async () => {
                setIsUpdatingStatus(true);
                try {
                  await onStatusChange(
                    ticket.job_id,
                    JobTicketStatus.IN_PRODUCTION
                  );
                } finally {
                  setIsUpdatingStatus(false);
                }
              }}
              disabled={
                ticket.status === JobTicketStatus.IN_PRODUCTION ||
                ticket.status === JobTicketStatus.PARTIALLY_DISPATCHED ||
                ticket.status === JobTicketStatus.COMPLETED ||
                isUpdatingStatus
              }
            >
              {isUpdatingStatus ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : ticket.status === JobTicketStatus.COMPLETED ? (
                <CircleCheck className="mr-2 h-4 w-4" />
              ) : inProduction ? (
                <Factory className="mr-2 h-4 w-4" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              {ticket.status === JobTicketStatus.COMPLETED
                ? "Completed"
                : inProduction
                ? "In production"
                : "Start production"}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
