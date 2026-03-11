"use client";
import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb";
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
import { toast } from "sonner";
import { EmptyState } from "@/components/shared/empty-page";
import { ExportButton } from "@/components/shared/export-button";
import { PageLoader } from "@/components/shared/loader";

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
        setData(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch inventory");
    } finally {
      setIsLoading(false);
    }
  };

  const columns = DispatchColumns({
    onEdit: (id) => {
      router.push(`/dispatch-invoice/${id}/edit`);
    },
    onDelete: (id) => {
      setDeleteId(id);
    },
  });

  const handleDelete = async () => {
    if (deleteId === null) return;

    try {
      setIsLoading(true);
      await dispatchInventoryApi.delete(deleteId);
      toast("Dispatch Deleted", {
        description: "Dispatch has been deleted successfully.",
      });
      await fetchData();
    } catch (error) {
      toast("Failed to Delete Dispatch", {
        description:
          "An error occurred while deleting the dispatch record. Please try again.",
      });
    } finally {
      setIsLoading(false);
      setDeleteId(null); // close popup
    }
  };
  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-[24px] pt-0 mt-3">
        <PageTitleWithBreadcrumb
          title="Dispatch and Invoice Management"
          breadcrumbs={[{ title: "Dashboard", href: "/dashboard" }]}
        />
        <div className="flex flex-row justify-end gap-[24px]">
          <div className="relative w-[320px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Dispatch"
              className="w-full pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <ExportButton data={data} filename="dispatch-invoices" />
          <Button onClick={() => router.push("/dispatch-invoice/create")}>
            <PlusIcon /> Create New
          </Button>
        </div>
        {isLoading ? (
          <PageLoader />
        ) : data.length === 0 ? (
          <EmptyState
            title="No Dispatch Records"
            description="There are no dispatch notes or invoices recorded yet. Start by creating a NEW dispatch note."
            createLabel="Create New Dispatch"
            createPath="/dispatch-invoice/create"
          />
        ) : (
          <DataTable
            columns={columns}
            data={data}
            searchValue={search}
            searchColumn="dispatch_note"
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
