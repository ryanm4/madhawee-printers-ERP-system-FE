"use client";

import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb";
import { RecordViewSkeleton } from "@/components/shared/page-skeletons";
import { getErrorMessage } from "@/lib/error-utils";
import { Button } from "@/components/ui/button";
import { GET_ALL_INVENTORY } from "@/modules/inventory/types";
import { inventoryApi } from "@/modules/inventory/api";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { appToast } from "@/lib/toast-utils";
import { usePermissions } from "@/hooks/use-permissions";
import { cn } from "@/lib/utils";
import {
  Detail,
  DetailGrid,
  ViewHeader,
  ViewSection,
  formatAmount,
} from "@/components/shared/record-view";

/** Sizes saved as "x" or "-" mean there is no size */
const cleanSize = (size?: string) => {
  const s = size?.trim();
  return !s || s === "x" || s === "-" ? null : s;
};

function ViewInventoryItem() {
  const router = useRouter();
  const params = useParams();
  const { canModifyInventoryItem } = usePermissions();
  const id = params.id as string;

  const [item, setItem] = useState<GET_ALL_INVENTORY | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchInventoryData() {
      try {
        setIsLoading(true);
        const response = await inventoryApi.getById(id);
        const data = (Array.isArray(response.data) ? response.data[0] : response.data) as GET_ALL_INVENTORY;
        setItem(data);
      } catch (error) {
        console.error("Failed to fetch inventory item:", error);
        appToast.error("Failed to load inventory data", getErrorMessage(error));
        router.push("/inventory");
      } finally {
        setIsLoading(false);
      }
    }

    if (id) fetchInventoryData();
  }, [id, router]);

  const quantity = Number(item?.quantity) || 0;
  const reorderLevel = Number(item?.reorder_level) || 0;
  const unitPrice = Number(item?.unit_price) || 0;
  const unit = item?.unit_of_measure || "";
  const belowReorder = reorderLevel > 0 && quantity <= reorderLevel;
  const size = cleanSize(item?.size);

  return (
    <div className="mt-3 flex flex-1 flex-col gap-5 p-4 pt-0 sm:p-6 sm:pt-0">
      <PageTitleWithBreadcrumb
        title="View Inventory Item"
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard" },
          { title: "Inventory", href: "/inventory" },
          { title: "View Item", href: `/inventory/${id}` },
        ]}
      />

      <ViewHeader
        title={item?.item_name}
        status={item?.status}
        statusType="INVENTORY"
        subtitle={item && [item.item_category, item.item_sub_category, size].filter(Boolean).join(", ")}
        actions={
          <>
            <Button variant="outline" type="button" onClick={() => router.push("/inventory")}>
              Back to List
            </Button>
            {canModifyInventoryItem && (
              <Button type="button" onClick={() => router.push(`/inventory/${id}/edit`)}>
                Edit Item
              </Button>
            )}
          </>
        }
      />
      {isLoading && !item && <RecordViewSkeleton />}

      {item && (
        <div className="grid gap-5 lg:grid-cols-5">
          <ViewSection title="Stock" className="lg:col-span-2">
            <p className="text-[13px] text-muted-foreground">Quantity in stock</p>
            <p className="mt-1 text-3xl font-bold tracking-tight tabular-nums text-[#1B2433]">
              {quantity.toLocaleString()}
              {unit && <span className="ml-1.5 text-base font-medium text-muted-foreground">{unit}</span>}
            </p>
            <p className={cn("mt-2 text-sm", belowReorder ? "font-medium text-[#B45309]" : "text-muted-foreground")}>
              {reorderLevel > 0
                ? belowReorder
                  ? `At or below the reorder level of ${reorderLevel.toLocaleString()}. Reorder soon.`
                  : `Reorder level is ${reorderLevel.toLocaleString()}.`
                : "No reorder level set."}
            </p>
            <DetailGrid columns={2} className="mt-5 border-t border-[#EEF1F5] pt-5">
              <Detail label="Unit price" value={unitPrice ? formatAmount(unitPrice) : null} />
              <Detail label="Stock value" value={unitPrice ? formatAmount(unitPrice * quantity) : null} />
            </DetailGrid>
          </ViewSection>

          <ViewSection title="Item details" className="lg:col-span-3">
            <DetailGrid columns={2}>
              <Detail label="Item category" value={item.item_category} />
              <Detail label="Sub category" value={item.item_sub_category} />
              <Detail label="Item name" value={item.item_name} />
              <Detail label="Size" value={size} />
              <Detail label="Unit of measure" value={unit} />
              <Detail label="Reorder level" value={reorderLevel ? reorderLevel.toLocaleString() : null} />
              <Detail label="Remarks" value={item.remarks} className="col-span-2" />
            </DetailGrid>
          </ViewSection>
        </div>
      )}
    </div>
  );
}

export default ViewInventoryItem;
