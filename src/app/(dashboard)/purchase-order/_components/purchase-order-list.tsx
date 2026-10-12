"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  ArrowRightIcon,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  EyeIcon,
  MoreVertical,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AlertDeleteDialog } from "@/components/shared/delete_popup";
import { StatusPill } from "@/components/shared/status-text";
import { CreateJobTicketDialog } from "../../job-ticket/_components/create-job-ticket-dialog";
import { JobTicketStatus } from "@/config/enum";
import { statusActions } from "@/lib/status-actions";
import { usePermissions } from "@/hooks/use-permissions";
import { appToast } from "@/lib/toast-utils";
import { parseLocalDate } from "@/hooks/sql-date-time";
import { cn } from "@/lib/utils";
import type { PURCHASE_ORDER, PURCHASE_ORDER_JOBS } from "@/modules/purchase-order/types";

const formatDate = (value?: Date | string | null) => (value ? format(new Date(value), "dd MMM yyyy") : null);

/** Words people use for an order, rather than the stored codes */
const ORDER_LABEL: Record<string, string> = { CREATED: "Order placed" };
const JOB_LABEL: Record<string, string> = { CREATED: "Not started" };

/**
 * Job names are usually "<item code> - <what is printed>". Split them so the item reads
 * first and the code sits underneath; names without a code are shown whole.
 */
function splitJobName(name: string) {
  const match = name.match(/^(\S*\d\S*)\s+-\s+(.+)$/);
  return match ? { item: match[2], code: match[1] } : { item: name, code: null };
}

const isDone = (job: PURCHASE_ORDER_JOBS) => job.status === JobTicketStatus.COMPLETED;

/** Columns shared by the header and every row, from the lg breakpoint up */
const ROW_GRID = "lg:grid lg:grid-cols-[2rem_minmax(9rem,1.1fr)_minmax(12rem,1.6fr)_7.5rem_8rem_minmax(12rem,1.4fr)_9rem_2.5rem] lg:items-center lg:gap-x-4";

interface ListProps {
  orders: PURCHASE_ORDER[];
  canModify: boolean;
  onDelete: (id: number) => Promise<void>;
  onRefresh: () => Promise<void>;
  onStatusChange: (id: number, status: string) => Promise<void>;
}

export function PurchaseOrderList({ orders, canModify, onDelete, onRefresh, onStatusChange }: ListProps) {
  const [open, setOpen] = useState<Set<number>>(new Set());

  const toggle = (id: number) =>
    setOpen((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="overflow-hidden rounded-xl border border-[#E4E8F0] bg-white">
      <div
        aria-hidden
        className={cn(ROW_GRID, "hidden border-b border-[#E4E8F0] bg-[#F7F8FA] px-4 py-2.5 text-[13px] font-medium text-[#4B5567]")}
      >
        <span />
        <span>Purchase order</span>
        <span>Customer</span>
        <span>Ordered on</span>
        <span>Delivery date</span>
        <span>Job tickets</span>
        <span>Order status</span>
        <span />
      </div>

      <ul className="divide-y divide-[#EEF1F5]">
        {orders.map((order) => (
          <OrderRow
            key={order.po_id}
            order={order}
            expanded={open.has(order.po_id)}
            onToggle={() => toggle(order.po_id)}
            canModify={canModify}
            onDelete={onDelete}
            onRefresh={onRefresh}
            onStatusChange={onStatusChange}
          />
        ))}
      </ul>
    </div>
  );
}

function OrderRow({
  order,
  expanded,
  onToggle,
  canModify,
  onDelete,
  onRefresh,
  onStatusChange,
}: {
  order: PURCHASE_ORDER;
  expanded: boolean;
  onToggle: () => void;
} & Omit<ListProps, "orders">) {
  const jobs = order.jobs ?? [];
  const doneCount = jobs.filter(isDone).length;
  const openCount = jobs.length - doneCount;
  const allDone = jobs.length > 0 && openCount === 0;
  const delivery = formatDate(order.delivery_date);
  const panelId = `po-${order.po_id}-jobs`;

  return (
    <li className={cn(expanded && "bg-[#FBFCFD]")}>
      <div className={cn(ROW_GRID, "relative grid grid-cols-[2rem_1fr_auto] gap-x-3 gap-y-2 px-4 py-3")}>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          aria-controls={panelId}
          aria-label={`${expanded ? "Hide" : "Show"} job tickets for ${order.customer_po || "this order"}`}
          className="row-span-2 flex size-7 items-center justify-center self-start rounded-md bg-[#F1F3F8] text-[#4B5567] hover:bg-[#E4E8F0] hover:text-[#14213D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#223F7A]/30 lg:row-span-1 lg:self-center"
        >
          {expanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
        </button>

        <div className="min-w-0">
          <p className="text-xs text-[#4B5567]">PO number</p>
          <Link
            href={`/purchase-order/${order.po_id}/view`}
            className="block truncate rounded-sm text-[15px] font-bold text-[#14213D] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#223F7A]/30"
            title={order.customer_po}
          >
            {order.customer_po || "No PO number"}
          </Link>
        </div>

        <div className="col-start-3 row-start-1 flex items-center gap-1 lg:order-last lg:col-auto lg:row-auto lg:justify-end">
          <OrderActions order={order} canModify={canModify} onDelete={onDelete} onRefresh={onRefresh} onStatusChange={onStatusChange} />
        </div>

        <div className="col-span-2 col-start-2 flex min-w-0 flex-col gap-2 lg:contents">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#14213D]" title={order.customer?.name}>
              {order.customer?.name || "No customer"}
            </p>
            {order.customer?.email && (
              <a
                href={`mailto:${order.customer.email}`}
                className="block truncate text-[13px] text-[#223F7A] underline-offset-2 hover:underline"
              >
                {order.customer.email}
              </a>
            )}
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm lg:contents">
            <p className="text-[#14213D]">
              <span className="text-[#4B5567] lg:hidden">Ordered on </span>
              {formatDate(order.po_date) ?? "Not set"}
            </p>
            <p className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-3.5 shrink-0 text-[#4B5567]" aria-hidden />
              <span className="text-[#4B5567] lg:hidden">Delivery </span>
              {delivery ? <span className="text-[#14213D]">{delivery}</span> : <span className="text-[#4B5567]">Not set yet</span>}
            </p>
          </div>

          <JobProgress total={jobs.length} done={doneCount} open={openCount} allDone={allDone} />

          <div>
            <StatusPill status={order.status} label={ORDER_LABEL[order.status]} className="text-xs" />
          </div>
        </div>
      </div>

      {expanded && (
        <div id={panelId} className="px-4 pb-4 lg:pl-[3.25rem]">
          <JobsPanel order={order} canModify={canModify} onRefresh={onRefresh} />
        </div>
      )}
    </li>
  );
}

function JobProgress({ total, done, open, allDone }: { total: number; done: number; open: number; allDone: boolean }) {
  if (total === 0) return <p className="text-sm text-[#4B5567]">No job tickets yet</p>;
  return (
    <div className="min-w-0">
      <p className="text-[13px] text-[#4B5567]">
        {allDone ? (
          <span className="font-semibold text-[#15803D]">
            {total === 1 ? "1 job, done" : `All ${total} jobs done`}
          </span>
        ) : (
          <>
            <span className="font-semibold text-[#14213D]">
              {done} of {total} done
            </span>{" "}
            · {open} still open
          </>
        )}
      </p>
      <div
        className="mt-1.5 h-1.5 w-full max-w-60 overflow-hidden rounded-full bg-[#EDF0F5]"
        role="progressbar"
        aria-valuenow={Math.round((done / total) * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Job tickets done"
      >
        <div
          className={cn("h-full rounded-full", allDone ? "bg-[#16A34A]" : "bg-[#D97706]")}
          style={{ width: `${(done / total) * 100}%` }}
        />
      </div>
    </div>
  );
}

const JOBS_SHOWN = 2;

function JobsPanel({ order, canModify, onRefresh }: { order: PURCHASE_ORDER; canModify: boolean; onRefresh: () => Promise<void> }) {
  const [creating, setCreating] = useState(false);
  const jobs = order.jobs ?? [];

  if (jobs.length === 0) {
    return (
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-dashed border-[#D9DFE8] bg-white px-4 py-3 text-sm text-[#4B5567]">
        No job tickets have been created for this order yet.
        {canModify && (
          <>
            <Button variant="outline" size="sm" onClick={() => setCreating(true)}>
              <PlusIcon className="size-4" />
              Create job ticket
            </Button>
            <CreateJobTicketDialog open={creating} onOpenChange={setCreating} initialPoId={String(order.po_id)} onSuccess={onRefresh} />
          </>
        )}
      </div>
    );
  }

  const grid = "sm:grid sm:grid-cols-[minmax(9rem,0.9fr)_minmax(12rem,2.5fr)_7.5rem_8.5rem] sm:items-center sm:gap-x-4";

  return (
    <div className="overflow-hidden rounded-lg border border-[#E4E8F0] bg-white">
      <div aria-hidden className={cn(grid, "hidden border-b border-[#EEF1F5] bg-[#F7F8FA] px-4 py-2 text-xs font-medium text-[#4B5567]")}>
        <span>Job number</span>
        <span>Item being printed</span>
        <span>Job opened on</span>
        <span>Job status</span>
      </div>
      <ul className="divide-y divide-[#EEF1F5]">
        {jobs.slice(0, JOBS_SHOWN).map((job) => {
          const { item, code } = splitJobName(job.job_name || "");
          return (
            <li key={job.job_id} className={cn(grid, "flex flex-col gap-1 px-4 py-2.5 text-sm")}>
              <Link
                href={`/job-ticket/${job.job_id}`}
                className="w-fit rounded-sm font-semibold text-[#14213D] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#223F7A]/30"
              >
                {job.job_number}
              </Link>
              <div className="min-w-0">
                <p className="truncate text-[#14213D]" title={job.job_name}>
                  {item}
                </p>
                {code && <p className="text-xs text-[#4B5567]">Item code {code}</p>}
              </div>
              <p className="text-[#14213D]">
                <span className="text-[#4B5567] sm:hidden">Opened </span>
                {job.job_open_date ? format(parseLocalDate(job.job_open_date), "dd MMM yyyy") : "Not set"}
              </p>
              <div>
                <StatusPill status={job.status} label={JOB_LABEL[job.status]} className="text-xs" />
              </div>
            </li>
          );
        })}
      </ul>
      {jobs.length > JOBS_SHOWN && (
        <div className="border-t border-[#EEF1F5] px-4 py-2.5">
          <Link
            href={`/purchase-order/${order.po_id}/view`}
            className="rounded-sm text-sm font-semibold text-[#223F7A] underline underline-offset-2 hover:text-[#14213D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#223F7A]/30"
          >
            See {jobs.length - JOBS_SHOWN} more job {jobs.length - JOBS_SHOWN === 1 ? "ticket" : "tickets"}
          </Link>
        </div>
      )}
    </div>
  );
}

/** The row's menu: the same actions the order cards had */
function OrderActions({
  order,
  canModify,
  onDelete,
  onRefresh,
  onStatusChange,
}: { order: PURCHASE_ORDER } & Omit<ListProps, "orders">) {
  const router = useRouter();
  const [isJobTicketOpen, setIsJobTicketOpen] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const jobs = order.jobs ?? [];
  const statusOptions = statusActions.purchaseOrder(order.status, jobs.map((job) => job.status), usePermissions());

  return (
    <Fragment>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8 text-[#4B5567]" aria-label={`Actions for ${order.customer_po || "purchase order"}`}>
            <MoreVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[210px]" align="end">
          {statusOptions.map((action) => (
            <DropdownMenuItem
              key={action.to}
              disabled={isUpdatingStatus}
              onClick={async () => {
                if (action.blockedReason) {
                  appToast.warning("Can't complete this order yet", action.blockedReason);
                  return;
                }
                setIsUpdatingStatus(true);
                await onStatusChange(order.po_id, action.to);
                setIsUpdatingStatus(false);
              }}
            >
              <ArrowRightIcon className="mr-2 h-4 w-4" />
              {action.label}
            </DropdownMenuItem>
          ))}
          {statusOptions.length > 0 && <DropdownMenuSeparator />}
          {canModify && (
            <>
              <DropdownMenuItem onSelect={() => setIsJobTicketOpen(true)}>
                <PlusIcon className="mr-2 h-4 w-4" />
                Create Job Ticket
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => router.push(`/purchase-order/${order.po_id}/edit`)}>
                <PencilIcon className="mr-2 h-4 w-4" />
                Edit Purchase Order
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => setOpenDelete(true)}
                variant="destructive"
                disabled={jobs.length > 0 || isUpdatingStatus}
              >
                <TrashIcon className="mr-2 h-4 w-4" />
                Delete Purchase Order
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuItem onSelect={() => router.push(`/purchase-order/${order.po_id}/view`)}>
            <EyeIcon className="mr-2 h-4 w-4" />
            View Purchase Order
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {canModify && (
        <CreateJobTicketDialog open={isJobTicketOpen} onOpenChange={setIsJobTicketOpen} initialPoId={String(order.po_id)} onSuccess={onRefresh} />
      )}
      <AlertDeleteDialog
        isOpen={openDelete}
        onClose={() => setOpenDelete(false)}
        handleSubmit={async () => {
          await onDelete(order.po_id);
          setOpenDelete(false);
        }}
      />
    </Fragment>
  );
}
