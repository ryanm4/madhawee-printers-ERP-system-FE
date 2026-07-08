"use client";
import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LayoutPanelTop, PlusIcon, Search, Table2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { DataTable } from "./_components/job-ticket-table";
import { jobTicketColumns } from "./_components/job-ticket-columns";
import { ALL_TICKETS, CREATE_TICKETS, JobTicketPrintData } from "@/modules/job-tickets/types";
import { jobTicketsApi } from "@/modules/job-tickets/api";
import { appToast } from "@/lib/toast-utils";
import { getErrorMessage } from "@/lib/error-utils";
import { AlertDeleteDialog } from "@/components/shared/delete_popup";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/empty-page";
import { ExportButton } from "@/components/shared/export-button";
import { PageLoader } from "@/components/shared/loader";
import {
  JobTicketPrintDialog,
  handleJobTicketPrint,
} from "./_components/job-ticket-print-dialog";
import { CustomerApi } from "@/modules/customer/api";
import { purchaseOrderApi } from "@/modules/purchase-order/api";
import { JobTicketCard } from "@/components/job-ticket-card";
import { CUSTOMER } from "@/modules/customer/types";
import { JobTicketStatus } from "@/config/enum";
import { toMySQLDateTime } from "@/hooks/sql-date-time";

type JobTicketWithCustomer = ALL_TICKETS & { customer_name?: string };

function JobTicketComponent() {
  const router = useRouter();
  const [data, setData] = useState<JobTicketWithCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [remarksSearch, setRemarksSearch] = useState("");
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
              (c: CUSTOMER) => String(c.customer_id) === String(ticket.customer_id)
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
              (c: CUSTOMER) => String(c.customer_id) === String(ticket.customer_id)
            )?.company_name || ticket.customer_id;

          const firstPaperType =
            ticket.paperCoating?.[0] || ticket.paper_coating?.[0];
          const allRawMaterials = (
            ticket.paperCoating ||
            ticket.paper_coating ||
            []
          ).flatMap((p) => p.materials || (p as Record<string, unknown>).raw_materials as Array<Record<string, unknown>> || []);

          const pd: JobTicketPrintData = {
            jobNumber: ticket.job_number,
            productType: ticket.product_type,
            orderReceivedDate: ticket.order_received_date,
            quantity: ticket.quantity,
            jobOpenDate: ticket.job_open_date || ticket.created_on,
            paperType: firstPaperType?.paper || firstPaperType?.paper_type,
            customer: customerName,
            coating: firstPaperType?.coating,
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
            oldPlatesQuantity: ticket.old_plate_quantity !== undefined && ticket.old_plate_quantity !== null ? String(ticket.old_plate_quantity) : undefined,
            newPlatesQuantity: ticket.new_plate_quantity !== undefined && ticket.new_plate_quantity !== null ? String(ticket.new_plate_quantity) : undefined,
            rawMaterials: allRawMaterials,
            inks: ticket.inks?.map((ink: any) => ({
              ink: ink.ink,
              quantity: ink.quantity ?? undefined,
              status: ink.status ?? undefined,
              remarks: ink.remarks ?? undefined,
            })),
          };
          console.log(pd);
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

          const formatDate = (date: string | Date | null | undefined) => {
            if (!date) return undefined;

            const parsed = new Date(date);

            if (isNaN(parsed.getTime())) {
              return undefined;
            }

            return toMySQLDateTime(parsed);
          };
          // Construct payload matching CREATE_TICKETS interface
          const payload = {
            po_id: currentTicket.po_id,
            item_code: currentTicket.item_code,
            job_number: currentTicket.job_number,
            order_received_date: formatDate(currentTicket.order_received_date),
            job_open_date: formatDate(currentTicket.job_open_date),
            customer_id: currentTicket.customer_id,
            job_name: currentTicket.job_name,
            product_type: currentTicket.product_type,
            quantity: currentTicket.quantity,
            completed_qty: currentTicket.completed_qty,
            wastage: currentTicket.wastage,
            packing_date: formatDate(currentTicket.packing_date),
            expiry_date: formatDate(currentTicket.expiry_date),
            tc_no: currentTicket.tc_no,
            batch_ref: currentTicket.batch_ref,
            remarks: currentTicket.remarks,

            // Plates
            old_plates_quantity: currentTicket.old_plates_quantity,
            old_plates_status: currentTicket.old_plates_status,
            old_plates_remarks: currentTicket.old_plates_remarks,
            new_plates_quantity: currentTicket.new_plates_quantity,
            new_plates_status: currentTicket.new_plates_status,
            new_plates_remarks: currentTicket.new_plates_remarks,

            // Map Arrays
            paperCoating: (
              (currentTicket.paperCoating ||
                (currentTicket as Record<string, unknown>).paper_coating ||
                []) as any[]
            ).map((p: Record<string, unknown>) => ({
              paper: p.paper || p.paper_type,
              coating: p.coating,
              delivery_date: formatDate(p.delivery_date as any),
              materials: p.materials || (p as any).raw_materials || [],
            })),

            inks: currentTicket.inks || [],
            status: status,
            created_by: (currentTicket as Record<string, unknown>).created_by as string || "User",
          };

          await jobTicketsApi.update(id, payload as CREATE_TICKETS);
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

  const columns = jobTicketColumns(handlers);

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

  const filteredData = data.filter((item) => {
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
          <div className="flex flex-row justify-end gap-[24px]">
            <div className="relative w-[320px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Job ID, Number or Customer"
                className="w-full pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="relative w-[320px]">
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

            <ExportButton data={filteredData} filename="job-tickets" />
            <Button onClick={() => router.push("/job-ticket/create")}>
              <PlusIcon /> Create New
            </Button>
          </div>

          {isLoading ? (
            <PageLoader />
          ) : filteredData.length === 0 ? (
            <EmptyState
              title="No Job Tickets"
              description="You haven't initiated any job tickets yet. Create a job ticket to start the production process."
              createLabel="Create New Job Ticket"
              createPath="/job-ticket/create"
            />
          ) : (
            <>
              <TabsContent value="Grid-View">
                <div className="grid gap-[24px] grid-cols-[repeat(auto-fill,minmax(450px,1fr))]">
                  {filteredData.map((item) => (
                    <JobTicketCard
                      key={item.job_id}
                      ticket={item}
                      onEdit={handlers.onEdit}
                      onDelete={handlers.onDelete}
                      onView={handlers.onView}
                      onDownload={handlers.onDownload}
                      onStatusChange={handlers.onStatusChange}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="Table-View">
                <DataTable
                  columns={columns}
                  data={filteredData}
                  searchValue=""
                  searchColumn="job_id"
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
