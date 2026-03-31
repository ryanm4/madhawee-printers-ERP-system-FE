"use client";
import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb";
import { getErrorMessage } from "@/lib/error-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { grnApi } from "@/modules/inventory/grn/api";
import { PlusIcon, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { DataTable } from "./_components/grn_table";
import { grnColumns } from "./_components/grn_columns";
import { GRN } from "@/modules/inventory/grn/types";
import { toast } from "sonner";
import { EmptyState } from "@/components/shared/empty-page";
import { ExportButton } from "@/components/shared/export-button";
import { PageLoader } from "@/components/shared/loader";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
import { useMemo } from "react";

import { generateGRNPdf } from "@/modules/inventory/grn/pdf-utils";

function GRNManagement() {
  const router = useRouter();
  const [data, setData] = useState<GRN[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await grnApi.getAll();

      if (response.status === 200) {
        setData(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch GRN data", error);
      toast(getErrorMessage(error, "Failed to fetch GRN data"));
    } finally {
      setIsLoading(false);
    }
  };

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedGrnId, setSelectedGrnId] = useState<string | number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handlers = useMemo(() => ({
    onView: (id: number | string) => {
      router.push(`/inventory/grn/${id}`);
    },
    onEdit: (id: number | string) => {
      router.push(`/inventory/grn/${id}/edit`);
    },
    onDelete: (id: number | string) => {
      setSelectedGrnId(id);
      setIsDeleteDialogOpen(true);
    },
    onDownload: (grn: GRN) => {
      generateGRNPdf(grn);
      toast.success("Downloading GRN PDF...");
    },
  }), [router]);

  const columns = useMemo(() => grnColumns(handlers), [handlers]);

  const handleDelete = async () => {
    if (!selectedGrnId) return;
    try {
      setIsDeleting(true);
      const response = await grnApi.delete(selectedGrnId.toString());
      if (response.status === 200 || response.status === 204) {
        toast.success("GRN deleted successfully");
        fetchData();
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete GRN"));
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setSelectedGrnId(null);
    }
  };

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-[24px] pt-0 mt-3">
        <PageTitleWithBreadcrumb
          title="Goods Received Notes (GRN)"
          breadcrumbs={[
            { title: "Dashboard", href: "/dashboard" },
            { title: "Inventory", href: "/inventory" },
          ]}
        />
        <div className="flex flex-row justify-end gap-[24px]">
          <div className="relative w-[320px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by Supplier or PO"
              className="w-full pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <ExportButton data={data} filename="grn-list" />
          <Button onClick={() => router.push("/inventory/grn/create")}>
            <PlusIcon /> Create New GRN
          </Button>
        </div>
        {isLoading ? (
          <PageLoader />
        ) : data.length === 0 ? (
          <EmptyState
            title="No GRN Found"
            description="You haven't recorded any Goods Received Notes yet."
            createLabel="Create New GRN"
            createPath="/inventory/grn/create"
          />
        ) : (
          <DataTable
            columns={columns}
            data={data}
            searchValue={search}
          />
        )}
      </div>

      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Delete GRN"
        description="Are you sure you want to delete this Good Received Note? This action cannot be undone."
        loading={isDeleting}
      />
    </>
  );
}

export default GRNManagement;
