"use client";
import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb";
import { getErrorMessage } from "@/lib/error-utils";
import { PurchaseOrderCard } from "@/components/purchase-order-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, LayoutPanelTop, PlusIcon, Search, Table2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { getUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { appToast } from "@/lib/toast-utils";
import { EmptyState } from "@/components/shared/empty-page";
import { ExportButton } from "@/components/shared/export-button";
import { PageLoader } from "@/components/shared/loader";
import { format, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";

import { purchaseOrderApi } from "@/modules/purchase-order/api";
import { PURCHASE_ORDER } from "@/modules/purchase-order/types";
import { PurchaseOrderStatus, JobTicketStatus } from "@/config/enum";
import { DataTable } from "./_components/purchase-order-table";
import { purchaseOrderColumns } from "./_components/purchase-order-columns";

function PurchaseOrderPage() {
  const [data, setData] = useState<PURCHASE_ORDER[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), 0, 1),
    to: new Date(),
  });
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await purchaseOrderApi.getAll();

      setData([...response.data].sort((a: any, b: any) => {
        const dateA = new Date(a.created_on || a.po_date || 0).getTime();
        const dateB = new Date(b.created_on || b.po_date || 0).getTime();
        return dateB - dateA;
      }));
    } catch (err) {
      console.error("Failed to fetch POs", err);
      appToast.error("Failed to fetch purchase orders", getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setLoading(true);
      await purchaseOrderApi.delete(id);
      appToast.success("Purchase Order Deleted", "The purchase order has been deleted successfully.");
      await fetchData();
    } catch (error) {
      console.error("Failed to delete PO:", error);
      appToast.error("Failed to Delete Purchase Order", getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      setLoading(true);
      const response = await purchaseOrderApi.getById(String(id));
      if (response.data) {
        const data = response.data;

        if (status === PurchaseOrderStatus.COMPLETED) {
          const hasIncompleteJobs = (data.jobs || []).some(
            (job) => job.status !== JobTicketStatus.COMPLETED
          );

          if (hasIncompleteJobs) {
            appToast.warning("Cannot Complete Purchase Order", "This Purchase Order has active Job Tickets. All linked Job Tickets must be COMPLETED first.");
            setLoading(false);
            return;
          }
        }

        const payload = {
          quote_id: Number(data.quote_id),
          customer_id: data.customer ? Number(data.customer.customer_id) : 0,
          po_type_id: Number(data.po_type_id),
          batch_ref: data.batch_ref,
          po_date: data.po_date,
          delivery_date: data.delivery_date,
          TC_E_PR_No: data.TC_E_PR_No,
          updated_by: getUser()?.name || "User", // Ideally from user context
          status: status,
          customer_po: String(data.customer_po),
          po_items: (data.po_items || []).map((item: any) => ({
            item_code: item.item_code,
            description: item.description,
            quantity: String(item.quantity),
            uom: item.uom,
            price: String(item.price),
          })),
        };
        await purchaseOrderApi.update(id, payload as any);
        appToast.success("Status Updated", `Purchase Order status updated to ${status}`);
        await fetchData();
      } else {
        appToast.error("Data Error", "Failed to fetch PO details for status update");
      }
    } catch (error) {
      console.error("Status Update Error:", error);
      appToast.error("Update Failed", getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const columns = purchaseOrderColumns({
    onEdit: (id) => router.push(`/purchase-order/${id}/edit`),
    onDelete: (id) => handleDelete(id),
    onView: (id) => router.push(`/purchase-order/${id}`),
    onStatusChange: handleStatusChange,
  });

  const filteredData = data.filter((item) => {
    const matchesSearch = !search || (() => {
      const s = search.toLowerCase();
      return (
        item.po_id.toString().toLowerCase().includes(s) ||
        item.customer?.name?.toLowerCase().includes(s) ||
        item.status?.toLowerCase().includes(s)
      );
    })();

    const matchesDate = !date?.from || !date?.to || (() => {
      const poDate = new Date(item.po_date);
      return isWithinInterval(poDate, {
        start: startOfDay(date.from),
        end: endOfDay(date.to),
      });
    })();

    return matchesSearch && matchesDate;
  });

  return (
    <div className="flex flex-1 flex-col gap-4 p-[24px] pt-0 mt-3">
      <PageTitleWithBreadcrumb
        title="Purchase Order Management"
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
              placeholder="PO Number"
              className="w-full pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-[280px] justify-start text-left font-normal border-gray-200 shadow-none",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>

          <TabsList>
            <TabsTrigger value="Grid-View">
              <LayoutPanelTop />
            </TabsTrigger>
            <TabsTrigger value="Table-View">
              <Table2 />
            </TabsTrigger>
          </TabsList>
          <ExportButton data={data} filename="purchase-orders" />
          <Button
            onClick={() => router.push("/purchase-order/create")}
            disabled={loading}
          >
            <PlusIcon /> Create New
          </Button>
        </div>

        {loading ? (
          <PageLoader />
        ) : data.length === 0 ? (
          <EmptyState
            title="No Purchase Orders"
            description="You haven't received or created any purchase orders yet. Start by creating a NEW PO."
            createLabel="Create New PO"
            createPath="/purchase-order/create"
          />
        ) : (
          <>
            <TabsContent value="Grid-View">
              <div className="grid gap-[24px] grid-cols-[repeat(auto-fill,minmax(450px,1fr))]">
                {filteredData.map((item: PURCHASE_ORDER) => (
                  <PurchaseOrderCard
                    key={item.po_id}
                    po_id={item.po_id}
                    customer_po={item.customer_po}
                    companyName={item.customer?.name}
                    contactEmail={item.customer?.email}
                    poNumber={item.po_id}
                    poDate={item.po_date}
                    deliveryDate={item.delivery_date}
                    jobs={item.jobs}
                    totalJobs={item.jobs.length}
                    additionalJobs={item.jobs.filter(job => job.status !== 'COMPLETED').length}
                    status={item.status}
                    onDelete={handleDelete}
                    onRefresh={fetchData}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="Table-View">
              <DataTable
                columns={columns}
                data={filteredData}
                searchValue={search}
                searchColumn="po_id"
              />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}

export default PurchaseOrderPage;
