"use client"
import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb";
import { PurchaseOrderCard } from "@/components/purchase-order-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutPanelTop, PlusIcon, Search, Table2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { EmptyState } from "@/components/shared/empty-page";


import { purchaseOrderApi } from "@/modules/purchase-order/api";
import { PURCHASE_ORDER } from "@/modules/purchase-order/types";
import { PurchaseOrderStatus, JobTicketStatus } from "@/config/enum";
import { DataTable } from "./_components/purchase-order-table";
import { purchaseOrderColumns } from "./_components/purchase-order-columns";


function PurchaseOrderPage() {

  const [data, setData] = useState<PURCHASE_ORDER[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter()

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await purchaseOrderApi.getAll();
      console.log(response)
      setData(response.data);
    } catch (err) {
      console.error('Failed to fetch POs', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setLoading(true);
      await purchaseOrderApi.delete(id);
      toast("Purchase Order Deleted", {
        description: "The purchase order has been deleted successfully."
      });
      await fetchData();
    } catch (error) {
      console.error('Failed to delete PO:', error);
      toast("Failed to Delete Purchase Order", {
        description: "An error occurred while deleting the purchase order. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  const columns = purchaseOrderColumns({
    onEdit: (id) => router.push(`/purchase-order/${id}/edit`),
    onDelete: (id) => handleDelete(id),
    onView: (id) => router.push(`/purchase-order/${id}`),
    onStatusChange: async (id, status) => {
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
              toast.warning("Cannot Complete Purchase Order", {
                description: "This Purchase Order has active Job Tickets. All linked Job Tickets must be COMPLETED first.",
              });
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
            updated_by: "admin", // Ideally from user context
            status: status,
            customer_po: String(data.po_id), // Or specific field if different
            po_items: (data.po_items || []).map((item: any) => ({
              item_code: item.item_code,
              description: item.description,
              quantity: String(item.quantity),
              uom: item.uom,
              price: String(item.price),
            })),
          };
          await purchaseOrderApi.update(id, payload as any);
          toast.success(`Purchase Order status updated to ${status}`);
          await fetchData();
        } else {
          toast.error("Failed to fetch PO details for status update");
        }
      } catch (error) {
        console.error("Status Update Error:", error);
        toast.error("Failed to update status");
      } finally {
        setLoading(false);
      }
    }
  })

  return (
    <div className="flex flex-1 flex-col gap-4 p-[24px] pt-0 mt-3">
      <PageTitleWithBreadcrumb
        title="Purchase Order Management"
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard" }
        ]}
      />
      <Tabs defaultValue="Grid-View" className="w-full flex-1 flex flex-col gap-4">
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



          <TabsList>
            <TabsTrigger value="Grid-View"><LayoutPanelTop /></TabsTrigger>
            <TabsTrigger value="Table-View"><Table2 /></TabsTrigger>
          </TabsList>
          <Button onClick={() => router.push("/purchase-order/create")} disabled={loading}>
            <PlusIcon /> Create New
          </Button>
        </div>

        {data.length === 0 && !loading ? (
          <EmptyState
            title="No Purchase Orders"
            description="You haven't received or created any purchase orders yet. Start by creating a NEW PO."
            createLabel="Create New PO"
            createPath="/purchase-order/create"
          />
        ) : (
          <>
            <TabsContent value="Grid-View">
              <div className="grid gap-[24px] grid-cols-[repeat(auto-fill,minmax(412px,1fr))]">
                {data
                  .filter((item) => {
                    if (!search) return true
                    const s = search.toLowerCase()
                    return (
                      item.po_id.toString().toLowerCase().includes(s) ||
                      item.customer?.name?.toLowerCase().includes(s) ||
                      item.status?.toLowerCase().includes(s)
                    )
                  })
                  .map((item: PURCHASE_ORDER) => (
                    <PurchaseOrderCard
                      key={item.po_id}
                      po_id={item.po_id}
                      companyName={item.customer?.name}
                      contactEmail={item.customer?.email}
                      poNumber={item.po_id}
                      poDate={item.po_date}
                      deliveryDate={item.delivery_date}
                      jobs={item.jobs}
                      totalJobs={item.jobs.length}
                      additionalJobs={item.jobs.length}
                      status={item.status}
                      onDelete={handleDelete}
                      onRefresh={fetchData}
                    />
                  ))}
              </div>
              {/* Pagination could be here if needed */}
            </TabsContent>

            <TabsContent value="Table-View">
              <DataTable
                columns={columns}
                data={data}
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
