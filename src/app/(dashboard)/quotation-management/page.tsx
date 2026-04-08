"use client";
import React, { useEffect, useState } from "react";
import { getUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb";
import { getErrorMessage } from "@/lib/error-utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { QUOTATIONS } from "@/modules/quotations/types";
import { quotationColumns } from "./_components/quotation_columns";
import { quotationApi } from "@/modules/quotations/api";
import { CustomerApi } from "@/modules/customer/api";
import { DataTable } from "./_components/quotation_table";
import { AlertDeleteDialog } from "@/components/shared/delete_popup";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutPanelTop, PlusIcon, Search, Table2 } from "lucide-react";
import { QuotationCard } from "@/components/quotation-card";
import { appToast } from "@/lib/toast-utils";
import { EmptyState } from "@/components/shared/empty-page";
import { generateQuotationPDF } from "@/components/pdf-generator";
import { ExportButton } from "@/components/shared/export-button";
import { PageLoader } from "@/components/shared/loader";

function QuotationsManagement() {
  const router = useRouter();
  const [data, setData] = useState<QUOTATIONS[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const handlers = {
    onEdit: (id: string | number) => {
      router.push(`/quotation-management/${id}/edit`);
    },
    onDelete: (id: string | number) => {
      setDeleteId(Number(id));
    },
    async onDownload(id: string | number) {
      try {
        const response = await quotationApi.getById(Number(id));
        if (response.data) {
          let pdfData = { ...response.data };

          if (response.data.customer_id) {
            try {
              const customerRes = await CustomerApi.getById(
                response.data.customer_id.toString()
              );
              if (customerRes.data) {
                const customer = customerRes.data;
                // Merge customer details into pdfData, preferring customer API data
                pdfData = {
                  ...pdfData,
                  company_name: customer.company_name || pdfData.company_name,
                  customer_address:
                    customer.address || pdfData.customer_address,
                  customer_phone: customer.phone || pdfData.customer_phone,
                  customer_email: customer.email || pdfData.customer_email,
                  contact_person:
                    customer.contact_person || pdfData.contact_person,
                };
              }
            } catch (custError) {
              console.warn(
                "Failed to fetch customer details for PDF, using quotation data",
                custError
              );
            }
          }

          await generateQuotationPDF(pdfData);
        } else {
          appToast.error("Data Error", "Failed to load quotation details");
        }
      } catch (error) {
        console.error("PDF Download Error:", error);
        appToast.error("Download Error", getErrorMessage(error));
      }
    },
    async onStatusChange(id: string | number, status: string) {
      try {
        setLoading(true);
        const response = await quotationApi.getById(Number(id));
        if (response.data) {
          const data = response.data as any;
          const payload = {
            quote_id: Number(data.quote_id),
            customer_id: Number(data.customer_id),
            type_id: Number(data.type_id),
            delivery_days: data.delivery_days,
            tax_type_id: Number(data.tax_type_id),
            currency: data.currency,
            contact_person: data.contact_person,
            notes: data.notes || "",
            status: status,
            sub_total: data.sub_total,
            no_of_items: data.no_of_items,
            total_without_tax: data.total_without_tax,
            net_total: data.net_total,
            updated_by: data.updated_by || getUser()?.name || "User",
            items: (data.items || []).map((item: any) => ({
              item_id: item.item_id,
              item_category: item.item_category,
              item_qty: String(item.item_qty),
              item_description: item.item_description,
              item_unit_price: String(item.item_unit_price),
              item_unit_discount: String(item.item_unit_discount || "0"),
              item_total_price: String(item.item_total_price),
            })),
          };
          await quotationApi.update(Number(id), payload as any);
          appToast.success("Status Updated", `Quotation status updated to ${status}`);
          await fetchData();
        } else {
          appToast.error("Update Error", "Failed to fetch quotation details for status update");
        }
      } catch (error) {
        console.error("Status Update Error:", error);
        appToast.error("Update Failed", getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    },
  };

  const columns = quotationColumns(handlers);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await quotationApi.getAll();

      if (response.status === 200) {
        setData(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch quotation", error);
      appToast.error("Fetch Error", getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    try {
      setLoading(true);
      await quotationApi.delete(deleteId);
      appToast.success("Quotation Deleted", "Quotation has been deleted successfully.");
      await fetchData();
    } catch (error) {
      console.error(error);
      appToast.error("Delete Failed", getErrorMessage(error));
    } finally {
      setLoading(false);
      setDeleteId(null);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-[24px] pt-0 mt-3">
      <PageTitleWithBreadcrumb
        title="Quotations Management"
        breadcrumbs={[{ title: "Dashboard", href: "/dashboard" }]}
      />
      <div className="flex flex-row justify-end gap-[24px]">
        <div className="relative w-[320px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Quotation Number"
            className="w-full pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <ExportButton data={data} filename="quotations-list" />
        <Button onClick={() => router.push("/quotation-management/create")}>
          <PlusIcon /> Create New
        </Button>
      </div>
      {loading ? (
        <PageLoader />
      ) : data.length === 0 ? (
        <EmptyState
          title="No Quotations Yet"
          description="You haven't created any quotations yet. Get started by creating your first quotation."
          createLabel="Create New Quotation"
          createPath="/quotation-management/create"
        />
      ) : (
        <DataTable
          columns={columns}
          data={data}
          searchValue={search}
          searchColumn="quote_id"
        />
      )}
      <AlertDeleteDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        handleSubmit={handleDelete}
      />
    </div>
  );
}

export default QuotationsManagement;
