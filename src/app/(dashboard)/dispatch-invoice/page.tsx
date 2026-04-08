"use client";
import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb";
import { getErrorMessage } from "@/lib/error-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ALL_DISPATCH } from "@/modules/dispatch-invoice/types";
import { PlusIcon, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { DispatchColumns } from "./_components/dispatch_columns";
import { AlertDeleteDialog } from "@/components/shared/delete_popup";
import { DataTable } from "./_components/dispatch_table";
import { dispatchInventoryApi } from "@/modules/dispatch-invoice/api";
import { appToast } from "@/lib/toast-utils";
import { EmptyState } from "@/components/shared/empty-page";
import { ExportButton } from "@/components/shared/export-button";
import { PageLoader } from "@/components/shared/loader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppSidebar } from "@/components/layout/app-sidebar"
import { handleDispatchPrint, DispatchPrintData } from "./_components/dispatch-print-dialog";

function DispatchInvoiceManagement() {
  const router = useRouter();
  const [data, setData] = useState<ALL_DISPATCH[]>([]);
  const [deleteId, setDeleteId] = useState<string | number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await dispatchInventoryApi.getAll();

      if (response.status === 200) {
        const sortedData = response.data.sort((a: any, b: any) => {
          const dateA = new Date(a.created_on || a.dispatch_date || 0).getTime();
          const dateB = new Date(b.created_on || b.dispatch_date || 0).getTime();
          return dateB - dateA;
        });
        setData(sortedData);
      }
    } catch (error) {
      console.error("Failed to fetch dispatch records", error);
      appToast.error("Fetch Error", getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handlers = {
    onEdit: (id: string | number) => {
      router.push(`/dispatch-invoice/${id}/edit`);
    },
    onDelete: (id: string | number) => {
      setDeleteId(Number(id));
    },
    onView: (id: string | number) => {
      router.push(`/dispatch-invoice/${id}/view`);
    },
    onPrint: (dispatch: ALL_DISPATCH) => {
      const pData: DispatchPrintData = {
        dispatch_id: dispatch.dispatch_id,
        dispatch_date: dispatch.dispatch_date,
        customer_name: dispatch.customer_name,
        customer_address: dispatch.customer_address,
        customer_phone: dispatch.customer_phone,
        delivery_address: dispatch.delivery_address,
        dispatch_qty: dispatch.dispatch_qty,
        no_of_bundles: dispatch.no_of_bundles,
        description: dispatch.description,
        job_id: dispatch.job_id,
        job_name: dispatch.job_name,
        po_id: dispatch.po_id,
        contact_person: dispatch.contact_person,
        remarks: dispatch.dispatch_note,
        created_by: dispatch.created_by || dispatch.create_by,
      };
      handleDispatchPrint(pData);
    }
  };

  const columns = DispatchColumns(handlers);

  const handleDelete = async () => {
    if (deleteId === null) return;

    try {
      setIsLoading(true);
      await dispatchInventoryApi.delete(deleteId);
      appToast.success("Dispatch Deleted", "Dispatch has been deleted successfully.");
      await fetchData();
    } catch (error) {
      console.error("Failed to delete dispatch:", error);
      appToast.error("Delete Failed", getErrorMessage(error));
    } finally {
      setIsLoading(false);
      setDeleteId(null); // close popup
    }
  };
  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-[24px] pt-0 mt-3">
        <PageTitleWithBreadcrumb
          title="Dispatch & Invoice Management"
          breadcrumbs={[{ title: "Dashboard", href: "/dashboard" }]}
        />
        <div className="flex flex-row justify-end gap-[24px]">
          <div className="relative w-[320px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by Job Number"
              className="w-full pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <ExportButton data={data} filename="dispatch-list" />
          <Button onClick={() => router.push("/dispatch-invoice/create")}>
            <PlusIcon /> Create New
          </Button>
        </div>
        {isLoading ? (
          <PageLoader />
        ) : data.length === 0 ? (
          <EmptyState
            title="No Dispatch Records"
            description="You haven't recorded any dispatches yet. Start processing your orders by creating your first record."
            createLabel="Create New Dispatch"
            createPath="/dispatch-invoice/create"
          />
        ) : (
          <DataTable
            columns={columns}
            data={data}
            searchValue={search}
            searchColumn="job_number"
          />
        )}
      </div>

      <AlertDeleteDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        handleSubmit={handleDelete}
      />
    </>
  );
}

export default DispatchInvoiceManagement;
