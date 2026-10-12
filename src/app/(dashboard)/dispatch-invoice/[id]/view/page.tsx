"use client";
import { useParams, useRouter } from "next/navigation";
import { RecordViewSkeleton } from "@/components/shared/page-skeletons";
import { getErrorMessage } from "@/lib/error-utils";
import React, { useEffect, useState } from "react";
import { dispatchInventoryApi } from "@/modules/dispatch-invoice/api";
import { ALL_DISPATCH } from "@/modules/dispatch-invoice/types";
import { jobTicketsApi } from "@/modules/job-tickets/api";
import { toast } from "sonner";
import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb";
import { Button } from "@/components/ui/button";
import { Edit2 } from "lucide-react";
import { usePermissions } from "@/hooks/use-permissions";
import {
  Detail,
  DetailGrid,
  ViewError,
  ViewHeader,
  ViewSection,
  formatViewDate,
} from "@/components/shared/record-view";

function ViewDispatchAndInvoice() {
  const router = useRouter();
  const { canModify } = usePermissions();
  const params = useParams();
  const id = params.id as string;

  const [dispatch, setDispatch] = useState<ALL_DISPATCH | null>(null);
  const [job, setJob] = useState<{ name?: string; quantity?: number | string }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const fetchDispatch = async () => {
      try {
        setIsLoading(true);
        const response = await dispatchInventoryApi.getById(id);
        if (response.status !== 200) {
          setFailed(true);
          return;
        }
        const d = response.data;
        setDispatch(d);
        setJob({ name: d.job_name, quantity: d.job_quantity });

        // Older records may not carry the job's name and quantity; look the job up instead
        if (d.job_id && (!d.job_name || !d.job_quantity)) {
          try {
            const jobResponse = await jobTicketsApi.getById(d.job_id);
            const j = jobResponse.data as unknown as { job_name?: string; quantity?: number };
            setJob({ name: d.job_name || j.job_name, quantity: d.job_quantity || j.quantity });
          } catch (err) {
            console.error("Failed to fetch job:", err);
          }
        }
      } catch (err) {
        console.error("Failed to fetch dispatch:", err);
        toast.error(getErrorMessage(err, "Failed to load dispatch record"));
        setFailed(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchDispatch();
  }, [id]);

  const d = dispatch;

  return (
    <div className="mt-3 flex flex-1 flex-col gap-5 p-4 pt-0 sm:p-6 sm:pt-0">
      <PageTitleWithBreadcrumb
        title="View Dispatch and Invoice Management"
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard" },
          { title: "Dispatch and Invoice Management", href: "/dispatch-invoice" },
        ]}
      />

      <ViewHeader
        title={d && (d.dispatch_note || `Dispatch ${d.dispatch_id}`)}
        status={d?.status}
        statusType="DISPATCH_INVOICE"
        subtitle={
          d && (
            <>
              To <span className="font-medium text-[#1B2433]">{d.customer_name}</span>
              {formatViewDate(d.dispatch_date) && <>, dispatched {formatViewDate(d.dispatch_date)}</>}
            </>
          )
        }
        actions={
          <>
            <Button variant="outline" type="button" onClick={() => router.push("/dispatch-invoice")}>
              Back to List
            </Button>
            {canModify && (
              <Button type="button" onClick={() => router.push(`/dispatch-invoice/${id}/edit`)}>
                <Edit2 className="h-4 w-4" /> Edit Dispatch
              </Button>
            )}
          </>
        }
      />
      {isLoading && !dispatch && <RecordViewSkeleton />}

      {failed && !isLoading && (
        <ViewError>Couldn&apos;t load this dispatch. Go back to the list and open it again.</ViewError>
      )}

      {d && (
        <div className="grid gap-5 lg:grid-cols-2">
          <ViewSection title="Dispatch details">
            <DetailGrid columns={2}>
              <Detail label="Dispatch note" value={d.dispatch_note} />
              <Detail label="Dispatch date" value={formatViewDate(d.dispatch_date)} />
              <Detail label="Dispatch quantity" value={d.dispatch_qty ? Number(d.dispatch_qty).toLocaleString() : null} />
              <Detail label="No. of bundles" value={d.no_of_bundles ? Number(d.no_of_bundles).toLocaleString() : null} />
              <Detail label="Dispatch description" value={d.description} className="col-span-2" />
            </DetailGrid>
          </ViewSection>

          <ViewSection title="Customer and job">
            <DetailGrid columns={2}>
              <Detail label="Job" value={job.name || (d.job_id ? `Job-${d.job_id}` : null)} />
              <Detail label="Job quantity" value={job.quantity ? Number(job.quantity).toLocaleString() : null} />
              <Detail label="Customer name" value={d.customer_name} />
              <Detail label="Customer phone" value={d.customer_phone} />
              <Detail label="Customer address" value={d.customer_address} />
              <Detail label="Delivery address" value={d.delivery_address} />
            </DetailGrid>
          </ViewSection>
        </div>
      )}
    </div>
  );
}

export default ViewDispatchAndInvoice;
