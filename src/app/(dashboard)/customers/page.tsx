"use client";
import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusIcon, Search } from "lucide-react";
import { DataTable } from "./_components/customer-table";
import { customerColumns } from "./_components/customer-columns";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CUSTOMER } from "@/modules/customer/types";
import { CustomerApi } from "@/modules/customer/api";
import { AlertDeleteDialog } from "@/components/shared/delete_popup";
import { appToast } from "@/lib/toast-utils";
import { EmptyState } from "@/components/shared/empty-page";
import { ExportButton } from "@/components/shared/export-button";
import { PageLoader } from "@/components/shared/loader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutPanelTop, Table2 } from "lucide-react";
import { CustomerCard } from "@/components/customer-card";

export default function CRMPage() {
  const router = useRouter();
  const [data, setData] = useState<CUSTOMER[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchData();
  }, []);
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await CustomerApi.getAll();

      if (response.status === 200) {
        setData(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch inventory");
    } finally {
      setIsLoading(false);
    }
  };

  const handlers = {
    onEdit: (id: number) => {
      router.push(`/customers/${id}/edit`);
    },
    onDelete: (id: number) => {
      setDeleteId(id);
    },
    onView: (id: number) => {
      router.push(`/customers/${id}`);
    },
  };

  const columns = customerColumns(handlers);

  const handleDelete = async () => {
    if (deleteId === null) return;

    try {
      setIsLoading(true);
      await CustomerApi.delete(deleteId);
      appToast.success("Customer Deleted", "Customer has been deleted successfully.");
      await fetchData();
    } catch (error) {
      console.error("Failed to delete inventory item");
      appToast.error("Failed to Delete Customer", "An error occurred while deleting the customer. Please try again.");
    } finally {
      setIsLoading(false);
      setDeleteId(null); // close popup
    }
  };
  return (
    <>
    <div className="flex flex-1 flex-col gap-4 p-[24px] pt-0 mt-3">
      <PageTitleWithBreadcrumb
        title="Customer Management"
        breadcrumbs={[{ title: "Dashboard", href: "/dashboard" }]}
      />
      <div className="flex flex-row justify-end gap-[24px]">
        <div className="relative w-[320px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Customer Name"
            className="w-full pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <ExportButton data={data} filename="customers-list" />
        <Button onClick={() => router.push("/customers/create")}>
          <PlusIcon /> Create New
        </Button>
      </div>
      {isLoading ? (
        <PageLoader />
      ) : data.length === 0 ? (
        <EmptyState
          title="No Customers Found"
          description="You haven't added any customers yet. Start building your customer base by creating your first entry."
          createLabel="Create New Customer"
          createPath="/customers/create"
        />
      ) : (
        <DataTable
          columns={columns}
          data={data}
          searchValue={search}
          searchColumn="company_name"
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
