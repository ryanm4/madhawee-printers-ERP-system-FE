"use client"

import { Edit2 } from "lucide-react"
import { RecordViewSkeleton } from "@/components/shared/page-skeletons";
import { format } from "date-fns"
import { parseLocalDate } from "@/hooks/sql-date-time"
import { useState, useEffect } from "react"

import { Button } from "@/components/ui/button"
import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb"
import { useRouter, useParams } from "next/navigation"
import { CustomerApi } from "@/modules/customer/api"
import { PURCHASE_ORDER, PURCHASE_ORDER_ID } from "@/modules/purchase-order/types"
import { purchaseOrderApi } from "@/modules/purchase-order/api"
import { jobTicketsApi } from "@/modules/job-tickets/api"
import { JOB_TICKET_DETAIL } from "@/modules/job-tickets/types"

import { usePermissions } from "@/hooks/use-permissions"
import { StatusChanger } from "@/components/shared/status-changer"
import { toast } from "sonner"
import { getErrorMessage } from "@/lib/error-utils"
import { statusActions } from "@/lib/status-actions"
import { updateJobTicketStatus } from "@/modules/job-tickets/update-status"
import {
    Detail,
    DetailGrid,
    ViewError,
    ViewHeader,
    ViewSection,
    ViewTable,
    sentenceCase,
} from "@/components/shared/record-view"

interface RawMaterial {
    size: string;
    quantity: number;
    status: string;
    remarks: string;
}

interface PaperSet {
    paper: string;
    coating: string;
    rawMaterials: RawMaterial[];
}

interface InkRow {
    ink: string;
    quantity: string;
    status: string;
    remarks: string;
}

const notSet = <span className="text-muted-foreground">Not set</span>
const orNotSet = (value?: string | number | null) => (value === undefined || value === null || value === "" ? notSet : value)

/** dd MMM yyyy for SQL dates; anything unparseable is shown as saved */
const showDate = (value?: string | Date | null) => {
    if (!value) return null
    try {
        const date = value instanceof Date ? value : parseLocalDate(String(value))
        return Number.isNaN(date.getTime()) ? String(value) : format(date, "dd MMM yyyy")
    } catch {
        return String(value)
    }
}

/** Paper sets with only the raw materials that belong to each paper */
const toPaperSets = (data: JOB_TICKET_DETAIL): PaperSet[] =>
    (((data as Record<string, unknown>).paperCoatingData || data.paperCoating || []) as Array<Record<string, unknown>>).map((p) => {
        let paperValue = String(p.paper || "")
        const materials = (Array.isArray(p.materials) ? p.materials : []) as Array<Record<string, unknown>>
        if (!paperValue && materials.length > 0 && materials[0].material_type && materials[0].material_name) {
            paperValue = `${materials[0].material_type} ${materials[0].material_name}`
        }
        const filtered = materials.filter((m) => {
            if (!paperValue) return true
            return `${m.material_type || ""} ${m.material_name || ""}`.trim().toLowerCase() === paperValue.trim().toLowerCase()
        })
        return {
            paper: paperValue,
            coating: String(p.coating || ""),
            rawMaterials: filtered.map((rm) => ({
                size: String(rm.size || ""),
                quantity: Number(rm.quantity || 0),
                status: String(rm.status || ""),
                remarks: String(rm.remarks || ""),
            })),
        }
    })

/** Ink lines without the duplicates the API sometimes returns */
const toInks = (data: JOB_TICKET_DETAIL): InkRow[] =>
    (Array.isArray(data.inks) ? data.inks : [])
        .filter((v, i, a) => a.findIndex((t) => t.ink === v.ink && t.quantity === v.quantity && t.status === v.status && t.remarks === v.remarks) === i)
        .map((i) => ({
            ink: i.ink,
            quantity: i.quantity !== null && i.quantity !== undefined ? String(i.quantity) : "",
            status: i.status || "",
            remarks: i.remarks || "",
        }))

function JobViewTicket() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const permissions = usePermissions();
    const { canModifyJobTicket } = permissions;

    const [job, setJob] = useState<JOB_TICKET_DETAIL | null>(null);
    const [po, setPo] = useState<PURCHASE_ORDER_ID | null>(null);
    const [customerName, setCustomerName] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        const fetchJobTicket = async () => {
            if (!id) return;
            try {
                setIsLoading(true);
                const response = await jobTicketsApi.getById(id);
                if (response.status !== 200) {
                    setFailed(true);
                    return;
                }
                const data = response.data;
                setJob(data);
                setCustomerName(data.customer?.company_name || "");

                // The order the job belongs to supplies its received date, TC no and batch ref
                let poId = data.po_id ? String(data.po_id) : "";
                if (!poId && data.customer_po) {
                    if (!isNaN(Number(data.customer_po))) {
                        poId = String(data.customer_po);
                    } else {
                        const list = await purchaseOrderApi.getAll();
                        const match = (list.data as PURCHASE_ORDER[]).find((p) => String(p.customer_po) === String(data.customer_po));
                        if (match) poId = String(match.po_id);
                    }
                }
                if (poId) {
                    try {
                        const poResponse = await purchaseOrderApi.getById(poId);
                        if (poResponse.status === 200) {
                            setPo(poResponse.data);
                            if (poResponse.data.customer?.name) setCustomerName(poResponse.data.customer.name);
                        }
                    } catch (err) {
                        console.error("Error fetching PO details in view", err);
                    }
                }

                if (!data.customer?.company_name && data.customer_id) {
                    try {
                        const customerResponse = await CustomerApi.getById(String(data.customer_id));
                        setCustomerName((name) => name || customerResponse.data.company_name);
                    } catch (err) {
                        console.error("Error fetching customer in view", err);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch job ticket', error);
                setFailed(true);
            } finally {
                setIsLoading(false);
            }
        };

        fetchJobTicket();
    }, [id]);

    const paperSets = job ? toPaperSets(job) : [];
    const inks = job ? toInks(job) : [];
    const orderReceived = po?.po_date ?? job?.order_received_date;
    const tcNo = po?.TC_E_PR_No || job?.tc_no;
    const batchRef = po?.batch_ref || job?.batch_ref;
    const hasPlates = job && [job.old_plate_quantity, job.old_plate_status, job.old_plate_remarks, job.new_plate_quantity, job.new_plate_status, job.new_plate_remarks]
        .some((v) => v !== undefined && v !== null && v !== "");

    return (
        <div className="mt-3 flex flex-1 flex-col gap-5 p-4 pt-0 sm:p-6 sm:pt-0">
            <PageTitleWithBreadcrumb
                title="View Job Ticket"
                breadcrumbs={[
                    { title: "Dashboard", href: "/dashboard" },
                    { title: "Job Ticket", href: "/job-ticket" },
                    { title: "View", href: "#" },
                ]}
            />

            <ViewHeader
                title={job && (job.job_number || `Job ${job.job_id}`)}
                status={job?.status}
                statusType="JOB_TICKET"
                subtitle={
                    job && (
                        <>
                            <span className="font-medium text-[#1B2433]">{job.job_name}</span>
                            {customerName && <> for {customerName}</>}
                        </>
                    )
                }
                actions={
                    <>
                        <Button variant="outline" type="button" onClick={() => router.push("/job-ticket")}>Back</Button>
                        {job && (
                            <StatusChanger
                                current={job.status}
                                actions={statusActions.jobTicket(job.status, permissions)}
                                onChange={async (to) => {
                                    try {
                                        await updateJobTicketStatus(job, to);
                                        setJob({ ...job, status: to });
                                        toast.success(`Job is now ${sentenceCase(to).toLowerCase()}`);
                                        return true;
                                    } catch (error) {
                                        toast.error(getErrorMessage(error, "Couldn't change the status"));
                                        return false;
                                    }
                                }}
                            />
                        )}
                        {canModifyJobTicket && (
                            <Button type="button" onClick={() => router.push(`/job-ticket/${id}/edit`)}>
                                <Edit2 className="h-4 w-4" /> Edit Job Ticket
                            </Button>
                        )}
                    </>
                }
            />
            {isLoading && !job && <RecordViewSkeleton />}

            {failed && !isLoading && (
                <ViewError>Couldn&apos;t load this job ticket. Go back to the list and open it again.</ViewError>
            )}

            {job && (
                <>
                    <div className="grid gap-5 lg:grid-cols-3">
                        <ViewSection title="Job ticket details" className="lg:col-span-2">
                            <DetailGrid columns={3}>
                                <Detail
                                    label="PO number"
                                    value={
                                        (po?.customer_po || job.customer_po) && (
                                            po ? (
                                                <a href={`/purchase-order/${po.po_id}/view`} className="hover:text-[#223F7A] hover:underline">
                                                    {po.customer_po}
                                                </a>
                                            ) : job.customer_po
                                        )
                                    }
                                />
                                <Detail label="Item" value={job.item_code} />
                                <Detail label="Job number" value={job.job_number} />
                                <Detail label="Customer" value={customerName} />
                                <Detail label="Job name" value={job.job_name} className="col-span-2" />
                                <Detail label="Order received date" value={showDate(orderReceived)} />
                                <Detail label="Job open date" value={showDate(job.job_open_date || job.created_on)} />
                                <Detail label="Delivery date" value={showDate(job.delivery_date)} />
                            </DetailGrid>
                        </ViewSection>

                        <ViewSection title="Product">
                            <DetailGrid columns={2}>
                                <Detail label="Product type" value={job.product_type} />
                                <Detail label="Quantity" value={job.quantity ? Number(job.quantity).toLocaleString() : null} />
                                <Detail label="Wastage" value={job.wastage ? `${job.wastage}%` : null} />
                                <Detail label="Packing date" value={showDate(job.packing_date)} />
                                <Detail label="Expiry date" value={showDate(job.expiry_date)} />
                                <Detail label="TC no" value={tcNo} />
                                <Detail label="Batch ref" value={batchRef} />
                                <Detail label="Remarks" value={job.remarks} className="col-span-2" />
                            </DetailGrid>
                        </ViewSection>
                    </div>

                    <ViewSection title={`Paper and raw material (${paperSets.length} ${paperSets.length === 1 ? "set" : "sets"})`}>
                        {paperSets.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No paper has been added to this job.</p>
                        ) : (
                            <div className="flex flex-col gap-6">
                                {paperSets.map((set, index) => (
                                    <div key={index} className="min-w-0">
                                        <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                                            <h3 className="text-sm font-semibold text-[#1B2433]">
                                                Set {index + 1}: {set.paper || "Paper not set"}
                                            </h3>
                                            <span className="text-[13px] text-muted-foreground">
                                                Coating: {set.coating || "none"}
                                            </span>
                                        </div>
                                        <ViewTable
                                            rows={set.rawMaterials}
                                            rowKey={(_, i) => i}
                                            empty="No raw materials for this paper."
                                            columns={[
                                                { header: "Raw material size", cell: (rm) => <span className="font-medium">{rm.size || "Not set"}</span> },
                                                { header: "Quantity", align: "right", cell: (rm) => rm.quantity.toLocaleString() },
                                                { header: "Status", cell: (rm) => orNotSet(rm.status && sentenceCase(rm.status)) },
                                                { header: "Remarks", muted: true, cell: (rm) => rm.remarks || "None" },
                                            ]}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </ViewSection>

                    <div className="grid gap-5 lg:grid-cols-2">
                        <ViewSection title="CTP plates">
                            {hasPlates ? (
                                <ViewTable
                                    rows={[
                                        { label: "Old plates", quantity: job.old_plate_quantity, status: job.old_plate_status, remarks: job.old_plate_remarks },
                                        { label: "New plates", quantity: job.new_plate_quantity, status: job.new_plate_status, remarks: job.new_plate_remarks },
                                    ]}
                                    rowKey={(row) => row.label}
                                    columns={[
                                        { header: "Plates", cell: (row) => <span className="font-medium">{row.label}</span> },
                                        { header: "Quantity", align: "right", cell: (row) => orNotSet(row.quantity) },
                                        { header: "Status", cell: (row) => orNotSet(row.status && sentenceCase(row.status)) },
                                        { header: "Remarks", muted: true, cell: (row) => row.remarks || "None" },
                                    ]}
                                />
                            ) : (
                                <p className="text-sm text-muted-foreground">No plate details recorded.</p>
                            )}
                        </ViewSection>

                        <ViewSection title={`Ink and others (${inks.length})`}>
                            <ViewTable
                                rows={inks}
                                rowKey={(_, i) => i}
                                empty="No inks recorded."
                                columns={[
                                    { header: "Ink and others", cell: (ink) => <span className="font-medium">{ink.ink}</span> },
                                    { header: "Quantity", align: "right", cell: (ink) => orNotSet(ink.quantity) },
                                    { header: "Status", cell: (ink) => orNotSet(ink.status && sentenceCase(ink.status)) },
                                    { header: "Remarks", muted: true, cell: (ink) => ink.remarks || "None" },
                                ]}
                            />
                        </ViewSection>
                    </div>
                </>
            )}
        </div>
    )
}

export default JobViewTicket
