"use client";
import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb";
import { RecordViewSkeleton } from "@/components/shared/page-skeletons";
import { getErrorMessage } from "@/lib/error-utils";
import { Button } from "@/components/ui/button";
import { useRouter, useParams } from "next/navigation";
import { Edit } from "lucide-react";
import { useEffect, useState } from "react";
import { grnApi } from "@/modules/grn/api";
import { toast } from "sonner";
import { GRN, GRNItem } from "@/modules/grn/types";
import { usePermissions } from "@/hooks/use-permissions";
import { inventoryApi } from "@/modules/inventory/api";
import { GET_ALL_INVENTORY } from "@/modules/inventory/types";
import {
  Detail,
  DetailGrid,
  ViewHeader,
  ViewSection,
  ViewTable,
  formatAmount,
  formatViewDate,
  sentenceCase,
} from "@/components/shared/record-view";

interface ReceivedItem {
  key: number | string;
  name: string;
  unit?: string;
  quantity: number;
  rate: number;
  amount: number;
}

/** Match a received line to its stock item; GRNs store the item by its display name */
const findInventoryItem = (inventory: GET_ALL_INVENTORY[], name: string) =>
  inventory.find(
    (inv) =>
      inv.item_name === name ||
      `${inv.item_sub_category} ${inv.item_name}` === name ||
      `${inv.item_sub_category} ${inv.item_name} (${inv.size || ""})` === name ||
      `${inv.item_sub_category} ${inv.item_name} ${inv.size || ""}`.trim() === name ||
      `${inv.item_name} ${inv.size || ""}`.trim() === name ||
      `${inv.item_name} (${inv.size || ""})` === name
  );

function ViewGRN() {
  const router = useRouter();
  const { id } = useParams();
  const { canModifyGRN } = usePermissions();

  const [grn, setGrn] = useState<GRN | null>(null);
  const [items, setItems] = useState<ReceivedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchGRN = async () => {
      try {
        setLoading(true);
        const [grnResponse, inventoryResponse] = await Promise.all([
          grnApi.getById(id as string),
          inventoryApi.getAll(),
        ]);
        const data: GRN = grnResponse.data;
        const inventory: GET_ALL_INVENTORY[] = inventoryResponse.data ?? [];
        setGrn(data);
        setItems(
          (data.items ?? []).map((item: GRNItem, index) => {
            const inv = findInventoryItem(inventory, item.item_name);
            const name = inv
              ? inv.size
                ? `${inv.item_sub_category} ${inv.item_name} (${inv.size})`
                : `${inv.item_sub_category} ${inv.item_name}`
              : item.item_name;
            return {
              key: item.id ?? index,
              name,
              unit: inv?.unit_of_measure,
              quantity: Number(item.quantity) || 0,
              rate: Number(item.rate) || 0,
              amount: Number(item.amount) || 0,
            };
          })
        );
      } catch (error) {
        toast.error(getErrorMessage(error, "Failed to fetch GRN details"));
        router.push("/grn");
      } finally {
        setLoading(false);
      }
    };
    fetchGRN();
  }, [id, router]);

  const currency = grn?.currency || "LKR";
  const total = items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="mt-3 flex flex-1 flex-col gap-5 p-4 pt-0 sm:p-6 sm:pt-0">
      <PageTitleWithBreadcrumb
        title="View Goods Received Note (GRN)"
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard" },
          { title: "Receive Goods", href: "/grn" },
        ]}
      />

      <ViewHeader
        title={grn && `GRN ${grn.id}`}
        subtitle={
          grn && (
            <>
              From <span className="font-medium text-[#1B2433]">{grn.supplier_name || "unknown supplier"}</span>
              {formatViewDate(grn.received_date) && <>, received {formatViewDate(grn.received_date)}</>}
            </>
          )
        }
        actions={
          <>
            <Button variant="outline" type="button" onClick={() => router.push("/grn")}>
              Back to List
            </Button>
            {canModifyGRN && (
              <Button type="button" onClick={() => router.push(`/grn/${id}/edit`)}>
                <Edit className="h-4 w-4" /> Edit GRN
              </Button>
            )}
          </>
        }
      />
      {loading && !grn && <RecordViewSkeleton />}

      {grn && (
        <>
          <div className="grid gap-5 lg:grid-cols-2">
            <ViewSection title="Basic information">
              <DetailGrid columns={2}>
                <Detail label="Related PO" value={grn.related_po} />
                <Detail label="Received date" value={formatViewDate(grn.received_date)} />
                <Detail label="Supplier name" value={grn.supplier_name} />
                <Detail label="Stock location" value={grn.stock_location} />
              </DetailGrid>
            </ViewSection>

            <ViewSection title="Payment and invoice">
              <DetailGrid columns={2}>
                <Detail label="Payee name" value={grn.payee_name} />
                <Detail label="Supplier invoice no" value={grn.supplier_invoice_no} />
                <Detail label="Payment method" value={sentenceCase(grn.payment_method)} />
                <Detail label="Currency" value={grn.currency} />
                <Detail label="Remarks" value={grn.remarks} className="col-span-2" />
              </DetailGrid>
            </ViewSection>
          </div>

          <ViewSection
            title={`Items received (${items.length})`}
            aside={
              items.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  Total{" "}
                  <span className="font-semibold tabular-nums text-[#1B2433]">
                    {currency} {formatAmount(total)}
                  </span>
                </p>
              )
            }
          >
            <ViewTable
              rows={items}
              rowKey={(item) => item.key}
              empty="No items were received on this GRN."
              footer={{ label: `Total (${currency})`, value: formatAmount(total) }}
              columns={[
                { header: "Item name", cell: (item) => <span className="font-medium">{item.name}</span> },
                { header: "Unit", muted: true, cell: (item) => item.unit || "Not set" },
                { header: "Quantity", align: "right", cell: (item) => item.quantity.toLocaleString() },
                { header: `Rate (${currency})`, align: "right", cell: (item) => formatAmount(item.rate) },
                {
                  header: `Amount (${currency})`,
                  align: "right",
                  cell: (item) => <span className="font-medium">{formatAmount(item.amount)}</span>,
                },
              ]}
            />
          </ViewSection>
        </>
      )}
    </div>
  );
}

export default ViewGRN;
