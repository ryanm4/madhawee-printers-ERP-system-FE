"use client";
import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb";
import { RecordViewSkeleton } from "@/components/shared/page-skeletons";
import { getErrorMessage } from "@/lib/error-utils";
import { Button } from "@/components/ui/button";
import { useRouter, useParams } from "next/navigation";
import { Edit } from "lucide-react";
import { useEffect, useState } from "react";
import { issueNotesApi } from "@/modules/issue-notes/api";
import { IssueNote } from "@/modules/issue-notes/types";
import { jobTicketsApi } from "@/modules/job-tickets/api";
import { inventoryApi } from "@/modules/inventory/api";
import { GET_ALL_INVENTORY } from "@/modules/inventory/types";
import { toast } from "sonner";
import { usePermissions } from "@/hooks/use-permissions";
import {
  Detail,
  DetailGrid,
  ViewHeader,
  ViewSection,
  ViewTable,
  formatViewDate,
} from "@/components/shared/record-view";

interface IssuedItem {
  key: number | string;
  name: string;
  detail?: string;
  quantity: number;
  unit?: string;
}

/** Find the stock item an issued line refers to, by id first and then by name */
const findInventoryItem = (inventory: GET_ALL_INVENTORY[], item: Record<string, unknown>) =>
  inventory.find((i) => i.item_id === item.item_id) ||
  inventory.find(
    (i) =>
      i.item_name === item.item_name ||
      `${i.item_sub_category} ${i.item_name}` === item.item_name ||
      `${i.item_sub_category} ${i.item_name} ${i.size || ""}`.trim() === item.item_name ||
      `${i.item_name} ${i.size || ""}`.trim() === item.item_name
  );

function ViewIssueNote() {
  const router = useRouter();
  const { id } = useParams();
  const { canModifyIssueNote } = usePermissions();

  const [note, setNote] = useState<IssueNote | null>(null);
  const [items, setItems] = useState<IssuedItem[]>([]);
  const [job, setJob] = useState<{ number?: string; name?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchIssueNote = async () => {
      try {
        setLoading(true);
        const [response, inventoryResponse] = await Promise.all([
          issueNotesApi.getById(id as string),
          inventoryApi.getAll(),
        ]);
        const data: IssueNote = response.data;
        const inventory: GET_ALL_INVENTORY[] = inventoryResponse.data ?? [];
        setNote(data);
        setItems(
          (data.items ?? []).map((item, index) => {
            const inv = findInventoryItem(inventory, item);
            return {
              key: item.id ?? index,
              name: inv?.item_name || (item.item_name as string) || `Item #${item.item_id}`,
              detail: [inv?.item_sub_category, inv?.size].filter(Boolean).join(", "),
              quantity: Number(item.quantity) || 0,
              unit: inv?.unit_of_measure,
            };
          })
        );

        if (data.job_id) {
          try {
            const jobResponse = await jobTicketsApi.getById(data.job_id);
            const j = jobResponse.data as unknown as { job_number?: string; job_name?: string };
            setJob({ number: j.job_number || `Job #${data.job_id}`, name: j.job_name || data.job_name });
          } catch (err) {
            console.error("Failed to fetch job details:", err);
            setJob({ number: `Job #${data.job_id}`, name: data.job_name });
          }
        }
      } catch (error) {
        toast.error(getErrorMessage(error, "Failed to fetch Issue Note details"));
        router.push("/issue-notes");
      } finally {
        setLoading(false);
      }
    };
    fetchIssueNote();
  }, [id, router]);

  return (
    <div className="mt-3 flex flex-1 flex-col gap-5 p-4 pt-0 sm:p-6 sm:pt-0">
      <PageTitleWithBreadcrumb
        title="View Issue Material"
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard" },
          { title: "Issue Material", href: "/issue-notes" },
        ]}
      />

      <ViewHeader
        title={note && `Issue note ${note.id}`}
        subtitle={
          note && (
            <>
              {formatViewDate(note.date) ? <>Issued {formatViewDate(note.date)}</> : "Issued"}
              {note.collector_name && (
                <> to <span className="font-medium text-[#1B2433]">{note.collector_name}</span></>
              )}
              {job?.number && <>, for {job.number}</>}
            </>
          )
        }
        actions={
          <>
            <Button variant="outline" type="button" onClick={() => router.push("/issue-notes")}>
              Back to List
            </Button>
            {canModifyIssueNote && (
              <Button type="button" onClick={() => router.push(`/issue-notes/${id}/edit`)}>
                <Edit className="h-4 w-4" /> Edit Note
              </Button>
            )}
          </>
        }
      />
      {loading && !note && <RecordViewSkeleton />}

      {note && (
        <div className="grid gap-5 lg:grid-cols-5">
          <ViewSection title="Issue note details" className="lg:col-span-2">
            <DetailGrid columns={2}>
              <Detail label="Date" value={formatViewDate(note.date)} />
              <Detail label="Collector name" value={note.collector_name} />
              <Detail
                label="Related job"
                value={
                  job && (
                    <>
                      {job.number}
                      {job.name && <span className="block font-normal text-muted-foreground">{job.name}</span>}
                    </>
                  )
                }
                className="col-span-2"
              />
              <Detail label="Remarks" value={note.remarks} className="col-span-2" />
            </DetailGrid>
          </ViewSection>

          <ViewSection title={`Items issued (${items.length})`} className="lg:col-span-3">
            <ViewTable
              rows={items}
              rowKey={(item) => item.key}
              empty="No items were issued on this note."
              columns={[
                {
                  header: "Item name",
                  cell: (item) => (
                    <>
                      <span className="font-medium">{item.name}</span>
                      {item.detail && <span className="block text-[13px] text-muted-foreground">{item.detail}</span>}
                    </>
                  ),
                },
                {
                  header: "Quantity",
                  align: "right",
                  cell: (item) => (
                    <>
                      {item.quantity.toLocaleString()}
                      {item.unit && <span className="text-muted-foreground"> {item.unit}</span>}
                    </>
                  ),
                },
              ]}
            />
          </ViewSection>
        </div>
      )}
    </div>
  );
}

export default ViewIssueNote;
