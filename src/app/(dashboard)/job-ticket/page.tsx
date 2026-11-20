"use client";
import { useSessionStorage } from "@/hooks/use-session-storage";
import { CardGridSkeleton } from "@/components/shared/page-skeletons";
import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  LayoutPanelTop,
  ListFilter,
  PlusIcon,
  Search,
  Table2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { DataTable } from "./_components/job-ticket-table";
import { jobTicketColumns } from "./_components/job-ticket-columns";
import {
  ALL_TICKETS,
  JobTicketPrintData,
} from "@/modules/job-tickets/types";
import { jobTicketsApi } from "@/modules/job-tickets/api";
import { updateJobTicketStatus } from "@/modules/job-tickets/update-status";
import { appToast } from "@/lib/toast-utils";
import { getErrorMessage } from "@/lib/error-utils";
import { AlertDeleteDialog } from "@/components/shared/delete_popup";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/empty-page";
import { ExportButton } from "@/components/shared/export-button";
import {
  JobTicketPrintDialog,
  handleJobTicketPrint,
  joinDistinct,
} from "./_components/job-ticket-print-dialog";
import { CustomerApi } from "@/modules/customer/api";
import { purchaseOrderApi } from "@/modules/purchase-order/api";
import { JobTicketCard } from "@/components/job-ticket-card";
import { CUSTOMER } from "@/modules/customer/types";
import { JobTicketStatus } from "@/config/enum";
import { sentenceCase, statusIconFor } from "@/components/shared/status-text";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/hooks/use-permissions";

type JobTicketWithCustomer = ALL_TICKETS & { customer_name?: string };

function JobTicketComponent() {
  const router = useRouter();
  const {
    canModifyJobTicket,
    canCreateJobTicket,
    canUpdateJobTicketStatus,
    canExportList,
  } = usePermissions();
  const [data, setData] = useState<JobTicketWithCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(true); // starts loading: the page fetches as soon as it opens
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [search, setSearch] = useSessionStorage("job-ticket-search", "");
  const [remarksSearch, setRemarksSearch] = useState("");
  // "ALL" or one job status, e.g. "IN PRODUCTION"
  const [statusFilter, setStatusFilter] = useSessionStorage(
    "job-ticket-status",
    "ALL"
  );
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [printData, setPrintData] = useState<JobTicketPrintData | null>(null);

  useEffect(() => {
    fetchData();
  }, []);
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [ticketsResponse, customersResponse] = await Promise.all([
        jobTicketsApi.getAll(),
        CustomerApi.getAll(),
      ]);

      if (ticketsResponse.status === 200 && customersResponse.status === 200) {
        const tickets = ticketsResponse.data;
        const customers = customersResponse.data;

        const enrichedData = tickets.map((ticket) => ({
          ...ticket,
          customer_name:
            customers.find(
              (c: CUSTOMER) =>
                String(c.customer_id) === String(ticket.customer_id)
            )?.company_name || ticket.customer_id,
        }));

        const sortedData = enrichedData.sort((a, b) => {
          const dateA = new Date(
            a.created_on || a.job_open_date || 0
          ).getTime();
          const dateB = new Date(
            b.created_on || b.job_open_date || 0
          ).getTime();
          return dateB - dateA;
        });
        setData(sortedData);
      }
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlers = {
    onEdit: (id: number) => {
      router.push(`/job-ticket/${id}/edit`);
    },
    onDelete: (id: number) => {
      setDeleteId(id);
    },
    onView: (id: number) => {
      router.push(`/job-ticket/${id}`);
    },
    onDownload: async (id: number) => {
      try {
        setIsLoading(true);
        const [ticketResponse, customersResponse] = await Promise.all([
          jobTicketsApi.getById(id),
          CustomerApi.getAll(),
        ]);

        if (ticketResponse.status === 200) {
          const ticket = ticketResponse.data;
          const customers = customersResponse.data;

          // Also fetch PO details to get TC/Batch if they aren't on the ticket
          let poDetails = null;
          if (ticket.po_id) {
            try {
              const poResponse = await purchaseOrderApi.getById(ticket.po_id);
              if (poResponse.status === 200) {
                poDetails = poResponse.data;
              }
            } catch (poErr) {
              console.error("Failed to fetch PO for printing", poErr);
            }
          }

          const customerName =
            customers.find(
              (c: CUSTOMER) =>
                String(c.customer_id) === String(ticket.customer_id)
            )?.company_name || ticket.customer_id;

          // A job can have several paper/coating rows; print all of them
          const paperRows: any[] =
            ticket.paperCoating || ticket.paper_coating || [];
          const allRawMaterials = (
            ticket.paperCoating ||
            ticket.paper_coating ||
            []
          ).flatMap(
            (p) =>
              p.materials ||
              ((p as Record<string, unknown>).raw_materials as Array<
                Record<string, unknown>
              >) ||
              []
          );

          const pd: JobTicketPrintData = {
            jobNumber: ticket.job_number,
            productType: ticket.product_type,
            orderReceivedDate: ticket.order_received_date,
            quantity: ticket.quantity,
            jobOpenDate: ticket.job_open_date || ticket.created_on,
            paperType: joinDistinct(
              paperRows.map((p) => p?.paper || p?.paper_type)
            ),
            customer: customerName,
            coating: joinDistinct(paperRows.map((p) => p?.coating)),
            jobName: ticket.job_name,
            customerDeliveryDate: ticket.delivery_date || undefined,
            packingDate: ticket.packing_date || undefined,
            expiryDate: ticket.expiry_date || undefined,
            poNo:
              ticket.customer_po ||
              poDetails?.customer_po ||
              String(ticket.po_id),
            tcNo: ticket.tc_no || poDetails?.TC_E_PR_No,
            batchRef: ticket.batch_ref || poDetails?.batch_ref,
            remarks: ticket.remarks,
            oldPlatesQuantity:
              ticket.old_plate_quantity !== undefined &&
              ticket.old_plate_quantity !== null
                ? String(ticket.old_plate_quantity)
                : undefined,
            newPlatesQuantity:
              ticket.new_plate_quantity !== undefined &&
              ticket.new_plate_quantity !== null
                ? String(ticket.new_plate_quantity)
                : undefined,
            oldPlatesStatus: ticket.old_plate_status || undefined,
            oldPlatesRemarks: ticket.old_plate_remarks || undefined,
            newPlatesStatus: ticket.new_plate_status || undefined,
            newPlatesRemarks: ticket.new_plate_remarks || undefined,
            rawMaterials: allRawMaterials,
            inks: ticket.inks
              ?.filter(
                (v: any, i: number, a: any[]) =>
                  a.findIndex(
                    (t: any) =>
                      t.ink === v.ink &&
                      t.quantity === v.quantity &&
                      t.status === v.status &&
                      t.remarks === v.remarks
                  ) === i
              )
              ?.filter((ink: any) => ink.ink && ink.ink.trim() !== "")
              ?.map((ink: any) => ({
                ink: ink.ink,
                quantity:
                  ink.quantity !== null && ink.quantity !== undefined
                    ? String(ink.quantity)
                    : undefined,
                status: ink.status ?? undefined,
                remarks: ink.remarks ?? undefined,
              })),
          };
          handleJobTicketPrint(pd);
        }
      } catch (error) {
        console.error("Failed to fetch ticket for printing", error);
        appToast.error(
          "Print Error",
          "Failed to load ticket details for printing"
        );
      } finally {
        setIsLoading(false);
      }
    },
    onStatusChange: async (id: number, status: string) => {
      try {
        setIsLoading(true);
        const currentTicketResponse = await jobTicketsApi.getById(id);
        if (currentTicketResponse.status === 200) {
          const currentTicket = currentTicketResponse.data;

          await updateJobTicketStatus(currentTicket, status);
          appToast.success(
            "Status Updated",
            `Job Ticket status updated to ${status}`
          );
          await fetchData();
        }
      } catch (error) {
        console.error("Failed to update status", error);
        appToast.error("Update Failed", getErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    },
  };

  const columns = jobTicketColumns(handlers, {
    canModify: canModifyJobTicket,
    canUpdateStatus: canUpdateJobTicketStatus,
  });

  const handleDelete = async () => {
    if (deleteId === null) return;

    try {
      setIsLoading(true);
      await jobTicketsApi.delete(deleteId);
      appToast.success(
        "Job Ticket Deleted",
        "Job Ticket has been deleted successfully."
      );
      await fetchData();
    } catch (error) {
      console.error("Failed to delete inventory item");
      appToast.error("Delete Failed", getErrorMessage(error));
    } finally {
      setIsLoading(false);
      setDeleteId(null);
    }
  };

  const searchedData = data.filter((item) => {
    const matchesSearch =
      !search ||
      item.job_number?.toLowerCase().includes(search.toLowerCase()) ||
      String(item.job_id).includes(search) ||
      item.job_name?.toLowerCase().includes(search.toLowerCase()) ||
      item.customer_name?.toLowerCase().includes(search.toLowerCase());
    const matchesRemarks =
      !remarksSearch ||
      item.remarks?.toLowerCase().includes(remarksSearch.toLowerCase());
    return matchesSearch && matchesRemarks;
  });

  // Count each status among the tickets that match the searches, so the numbers match what the filter shows
  const statusCounts = searchedData.reduce<Record<string, number>>(
    (acc, item) => {
      const key = (item.status || "").toUpperCase();
      if (key) acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    },
    {}
  );
  const knownStatuses = Object.values(JobTicketStatus) as string[];
  const statusOptions = [
    ...knownStatuses,
    ...Object.keys(statusCounts).filter((s) => !knownStatuses.includes(s)),
  ];
  const filteredData =
    statusFilter === "ALL"
      ? searchedData
      : searchedData.filter(
          (item) => (item.status || "").toUpperCase() === statusFilter
        );

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-[24px] pt-0 mt-3">
        <PageTitleWithBreadcrumb
          title="Job Ticket Management"
          breadcrumbs={[{ title: "Dashboard", href: "/dashboard" }]}
        />
        <Tabs
          defaultValue="Grid-View"
          className="w-full flex-1 flex flex-col gap-4"
        >
          <div className="flex flex-wrap items-center justify-end gap-3">
            <div className="relative w-full sm:w-[240px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Job ID, Number or Customer"
                className="w-full pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="relative w-full sm:w-[240px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search Remarks"
                className="w-full pl-8"
                value={remarksSearch}
                onChange={(e) => setRemarksSearch(e.target.value)}
              />
            </div>

            <TabsList>
              <TabsTrigger value="Grid-View">
                <LayoutPanelTop className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="Table-View">
                <Table2 className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>

            {canExportList && (
              <ExportButton data={filteredData} filename="job-tickets" />
            )}
            {canCreateJobTicket && (
              <Button onClick={() => router.push("/job-ticket/create")}>
                <PlusIcon /> Create New
              </Button>
            )}
          </div>

          {/* Status filter, with how many tickets are at each stage */}
          {!isLoading && data.length > 0 && (
            <div
              role="group"
              aria-label="Filter by status"
              className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0"
            >
              {[
                { value: "ALL", label: "All", count: searchedData.length },
                ...statusOptions.map((value) => ({
                  value,
                  label: sentenceCase(value),
                  count: statusCounts[value] ?? 0,
                })),
              ].map((option) => {
                const active = statusFilter === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setStatusFilter(option.value)}
                    className={cn(
                      "inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#223F7A]/30",
                      active
                        ? "border-[#223F7A] bg-[#223F7A] text-white"
                        : "border-[#D9DFE8] bg-white text-[#14213D] hover:bg-[#F1F3F8]"
                    )}
                  >
                    {(() => {
                      const Icon =
                        option.value === "ALL"
                          ? ListFilter
                          : statusIconFor(option.value);
                      return (
                        <Icon
                          aria-hidden
                          className={cn("size-4", !active && "text-[#4B5567]")}
                        />
                      );
                    })()}
                    {option.label}
                    <span
                      className={cn(
                        "min-w-6 rounded-md px-1.5 py-0.5 text-xs font-bold tabular-nums",
                        active
                          ? "bg-white/20 text-white"
                          : "bg-[#EDF0F5] text-[#14213D]"
                      )}
                    >
                      {option.count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {isLoading ? (
            <CardGridSkeleton />
          ) : filteredData.length === 0 && data.length > 0 ? (
            <p className="rounded-lg border border-dashed border-[#D9DFE8] px-5 py-10 text-center text-sm text-[#4B5567]">
              No job tickets match these filters.{" "}
              <button
                type="button"
                className="font-semibold text-[#223F7A] hover:underline"
                onClick={() => {
                  setStatusFilter("ALL");
                  setSearch("");
                  setRemarksSearch("");
                }}
              >
                Clear filters
              </button>
            </p>
          ) : filteredData.length === 0 ? (
            <EmptyState
              title="No Job Tickets"
              description="You haven't initiated any job tickets yet. Create a job ticket to start the production process."
              createLabel={canCreateJobTicket ? "Create New Job Ticket" : ""}
              createPath={canCreateJobTicket ? "/job-ticket/create" : ""}
            />
          ) : (
            <>
              <TabsContent value="Grid-View">
                <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(min(100%,440px),1fr))]">
                  {filteredData.map((item) => (
                    <JobTicketCard
                      key={item.job_id}
                      ticket={item}
                      onEdit={handlers.onEdit}
                      onDelete={handlers.onDelete}
                      onView={handlers.onView}
                      onDownload={handlers.onDownload}
                      onStatusChange={handlers.onStatusChange}
                      permissions={{
                        canModify: canModifyJobTicket,
                        canUpdateStatus: canUpdateJobTicketStatus,
                      }}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="Table-View">
                <DataTable
                  columns={columns}
                  data={filteredData}
                  searchValue=""
                />
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
      <AlertDeleteDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        handleSubmit={handleDelete}
      />

      {printData && (
        <JobTicketPrintDialog
          open={showPrintDialog}
          onOpenChange={setShowPrintDialog}
          data={printData}
          onDecline={() => {
            setShowPrintDialog(false);
            setPrintData(null);
          }}
        />
      )}
    </>
  );
}

export default JobTicketComponent;
