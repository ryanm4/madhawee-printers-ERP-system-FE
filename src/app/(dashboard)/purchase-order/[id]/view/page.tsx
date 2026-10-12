"use client";
import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb";
import { RecordViewSkeleton } from "@/components/shared/page-skeletons";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { useRouter, useParams } from "next/navigation";
import { Edit2 } from "lucide-react";
import { format } from "date-fns";
import { PurchaseOrderType } from "@/config/enum";
import { useEffect, useState } from "react";
import { purchaseOrderApi } from "@/modules/purchase-order/api";
import { PURCHASE_ORDER_ID } from "@/modules/purchase-order/types";
import { parseLocalDate } from "@/hooks/sql-date-time";
import { usePermissions } from "@/hooks/use-permissions";
import { StatusChanger } from "@/components/shared/status-changer";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/error-utils";
import { statusActions } from "@/lib/status-actions";
import { updatePurchaseOrderStatus } from "@/modules/purchase-order/update-status";
import {
  Detail,
  ViewError,
  ViewSection,
  formatAmount,
  formatViewDate,
  sentenceCase,
} from "@/components/shared/record-view";

const poTypeLabels: Record<number, string> = {
  [PurchaseOrderType.TIEP]: "TIEP",
  [PurchaseOrderType.NON_TIEP]: "NON-TIEP",
  [PurchaseOrderType.MP]: "MP",
};

function ViewPurchaseOrder() {
  const router = useRouter();
  const permissions = usePermissions();
  const { canModifyPO } = permissions;
  const params = useParams();
  const id = params.id as string;

  const [po, setPo] = useState<PURCHASE_ORDER_ID | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchPurchaseOrder = async () => {
      try {
        setLoading(true);
        const response = await purchaseOrderApi.getById(id);
        if (response.status === 200) setPo(response.data);
        else setFailed(true);
      } catch (err) {
        console.error("Failed to fetch purchase order:", err);
        setFailed(true);
      } finally {
        setLoading(false);
      }
    };
    fetchPurchaseOrder();
  }, [id]);

  const currency = po?.currency || "LKR";
  const items = (po?.po_items ?? []).map((item) => {
    const quantity = Number(item.quantity) || 0;
    const price = Number(item.price) || 0;
    return { ...item, quantity, price, amount: quantity * price };
  });
  const total = items.reduce((sum, item) => sum + item.amount, 0);
  const jobs = po?.jobs ?? [];
  const status = po?.status || po?.po_status;

  return (
    <div className="mt-3 flex flex-1 flex-col gap-5 p-4 pt-0 sm:p-6 sm:pt-0">
      <PageTitleWithBreadcrumb
        title="View Purchase Order"
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard" },
          { title: "Purchase Order Management", href: "/purchase-order" },
        ]}
      />

      {/* What this order is, and what you can do with it */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        {po && (
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-bold tracking-tight text-[#1B2433]">{po.customer_po}</h2>
              {status && (
                <StatusBadge
                  status={status}
                  label={sentenceCase(status)}
                  type="PURCHASE_ORDER"
                  className="rounded-md px-2.5 py-1 text-xs font-semibold normal-case tracking-normal"
                />
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              From <span className="font-medium text-[#1B2433]">{po.customer?.name}</span>
              {formatViewDate(po.po_date) && <>, dated {formatViewDate(po.po_date)}</>}
            </p>
          </div>
        )}
        <div className="ml-auto flex items-center gap-3">
          <Button variant="outline" type="button" onClick={() => router.push("/purchase-order")}>
            Back to List
          </Button>
          {po && (
            <StatusChanger
              current={status ?? ""}
              actions={statusActions.purchaseOrder(status ?? "", (po.jobs ?? []).map((job) => job.status), permissions)}
              onChange={async (to) => {
                try {
                  await updatePurchaseOrderStatus(po, to);
                  setPo({ ...po, status: to, po_status: to });
                  toast.success(`Order is now ${sentenceCase(to).toLowerCase()}`);
                  return true;
                } catch (error) {
                  toast.error(getErrorMessage(error, "Couldn't change the status"));
                  return false;
                }
              }}
            />
          )}
          {canModifyPO && (
            <Button type="button" onClick={() => router.push(`/purchase-order/${id}/edit`)}>
              <Edit2 className="h-4 w-4" /> Edit Purchase Order
            </Button>
          )}
        </div>
      </div>

      {loading && !po && <RecordViewSkeleton />}

      {failed && !loading && (
        <ViewError>Couldn&apos;t load this purchase order. Go back to the list and open it again.</ViewError>
      )}

      {po && (
        <>
          <div className="grid gap-5 lg:grid-cols-3">
            <ViewSection title="Purchase order" className="lg:col-span-2">
              <dl className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
                <Detail label="Purchase order no" value={po.customer_po} />
                <Detail label="Quotation no" value={po.quote_id ? String(po.quote_id) : null} />
                <Detail label="Purchase order type" value={poTypeLabels[Number(po.po_type_id)]} />
                <Detail label="PO date" value={formatViewDate(po.po_date)} />
                <Detail label="Currency" value={currency} />
                <Detail label="Sales ref" value={po.sales_ref} />
                <Detail label="Batch ref" value={po.batch_ref} />
                <Detail label="TC/E/PR/No" value={po.TC_E_PR_No} />
              </dl>
            </ViewSection>

            <ViewSection title="Customer">
              <dl className="flex flex-col gap-5">
                <Detail label="Customer" value={po.customer?.name} />
                <Detail
                  label="Phone"
                  value={
                    po.customer?.phone && (
                      <a href={`tel:${po.customer.phone}`} className="hover:text-[#223F7A] hover:underline">
                        {po.customer.phone}
                      </a>
                    )
                  }
                />
                <Detail
                  label="Email"
                  value={
                    po.customer?.email && (
                      <a href={`mailto:${po.customer.email}`} className="hover:text-[#223F7A] hover:underline">
                        {po.customer.email}
                      </a>
                    )
                  }
                />
                <Detail label="Address" value={po.customer?.address} />
              </dl>
            </ViewSection>
          </div>

          <ViewSection
            title={`Items (${items.length})`}
            aside={
              items.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  Total{" "}
                  <span className="font-semibold text-[#1B2433] tabular-nums">
                    {currency} {formatAmount(total)}
                  </span>
                </p>
              )
            }
          >
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground">This purchase order has no items.</p>
            ) : (
              <>
                {/* Wide screens: a table */}
                <table className="hidden w-full text-sm md:table">
                  <thead>
                    <tr className="text-left text-[13px] text-muted-foreground">
                      <th className="pb-3 pr-4 font-normal">Item type</th>
                      <th className="pb-3 pr-4 font-normal">Description</th>
                      <th className="pb-3 pr-4 text-right font-normal">Quantity</th>
                      <th className="pb-3 pr-4 font-normal">Unit</th>
                      <th className="pb-3 pr-4 text-right font-normal">Price</th>
                      <th className="pb-3 text-right font-normal">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEF1F5] border-t border-[#EEF1F5]">
                    {items.map((item, index) => (
                      <tr key={item.po_item_id ?? index} className="align-top">
                        <td className="py-3 pr-4 text-muted-foreground">{item.item_code || "Not set"}</td>
                        <td className="py-3 pr-4 font-medium text-[#1B2433]">{item.description}</td>
                        <td className="py-3 pr-4 text-right tabular-nums">{item.quantity.toLocaleString()}</td>
                        <td className="py-3 pr-4 text-muted-foreground">{item.uom || "Not set"}</td>
                        <td className="py-3 pr-4 text-right tabular-nums">{item.price.toLocaleString()}</td>
                        <td className="py-3 text-right font-medium tabular-nums text-[#1B2433]">
                          {formatAmount(item.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-[#E4E8F0]">
                      <td colSpan={5} className="pt-3 pr-4 text-right text-muted-foreground">
                        Total ({currency})
                      </td>
                      <td className="pt-3 text-right font-semibold tabular-nums text-[#1B2433]">
                        {formatAmount(total)}
                      </td>
                    </tr>
                  </tfoot>
                </table>

                {/* Phones: one block per item */}
                <ul className="divide-y divide-[#EEF1F5] md:hidden">
                  {items.map((item, index) => (
                    <li key={item.po_item_id ?? index} className="py-3 first:pt-0">
                      <p className="text-sm font-medium text-[#1B2433]">{item.description}</p>
                      <p className="mt-0.5 text-[13px] text-muted-foreground">{item.item_code}</p>
                      <p className="mt-2 flex justify-between text-sm tabular-nums">
                        <span className="text-muted-foreground">
                          {item.quantity.toLocaleString()} {item.uom} at {item.price.toLocaleString()}
                        </span>
                        <span className="font-medium text-[#1B2433]">{formatAmount(item.amount)}</span>
                      </p>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </ViewSection>

          <ViewSection title={`Job tickets (${jobs.length})`}>
            {jobs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No job tickets have been created for this order yet.</p>
            ) : (
              <ul className="divide-y divide-[#EEF1F5]">
                {jobs.map((job) => (
                  <li key={job.job_id} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#1B2433]">{job.job_name}</p>
                      <p className="mt-0.5 text-[13px] text-muted-foreground">
                        {job.job_number}, opened{" "}
                        {job.job_open_date ? format(parseLocalDate(job.job_open_date), "dd MMM yyyy") : "date not set"}
                      </p>
                    </div>
                    <StatusBadge
                      status={job.status}
                      label={sentenceCase(job.status)}
                      type="JOB_TICKET"
                      className="shrink-0 rounded-md px-2 py-0.5 text-xs font-medium normal-case tracking-normal"
                    />
                  </li>
                ))}
              </ul>
            )}
          </ViewSection>
        </>
      )}
    </div>
  );
}

export default ViewPurchaseOrder;
