"use client";
import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb";
import { getErrorMessage } from "@/lib/error-utils";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useParams, useRouter } from "next/navigation";
import { getCurrencySymbol, Currency } from "@/lib/currencyUtils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { CustomerApi } from "@/modules/customer/api";
import { CUSTOMER } from "@/modules/customer/types";
import { quotationApi } from "@/modules/quotations/api";
import { toast } from "sonner";
import { QUOTATIONS, QuotationItems, UPDATE_QUOTATION_REQUEST } from "@/modules/quotations/types";
import { QuotationTaxType, QuotationStatus } from "@/config/enum";
import { FullPageLoader } from "@/components/shared/loader";
import { generateQuotationPDF } from "@/components/pdf-generator";
import { Loader2, Printer, CheckCircle, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getUser } from "@/lib/auth";

// ── Read-only field wrapper ──────────────────────────────────────────────────
function ReadOnlyField({
    label,
    value,
    className,
}: {
    label: string;
    value?: string | number | null;
    className?: string;
}) {
    return (
        <div className={cn("flex flex-col gap-1", className)}>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {label}
            </label>
            <div className="min-h-9 rounded-md border border-input bg-muted/40 px-3 py-2 text-sm text-foreground">
                {value ?? <span className="text-muted-foreground italic">—</span>}
            </div>
        </div>
    );
}

// ── Status badge colour mapping ──────────────────────────────────────────────
function StatusPill({ status }: { status: string }) {
    const map: Record<string, string> = {
        CREATED: "bg-blue-100 text-blue-700 border-blue-200",
        ACCEPTED: "bg-green-100 text-green-700 border-green-200",
        REJECTED: "bg-red-100 text-red-700 border-red-200",
    };
    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold",
                map[status] ?? "bg-gray-100 text-gray-700 border-gray-200",
            )}
        >
            {status}
        </span>
    );
}

// ── Tax type label ────────────────────────────────────────────────────────────
const taxTypeLabel = (id: number) => {
    if (id === QuotationTaxType.VAT) return "VAT (18%)";
    if (id === QuotationTaxType.TIEP) return "TIEP (18%)";
    return "None";
};

const quotationTypeLabel = (id: number) =>
    id === 1 ? "Normal" : id === 2 ? "Optional" : String(id);

// ── Main component ────────────────────────────────────────────────────────────
function ViewQuotation() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [quotation, setQuotation] = useState<QUOTATIONS | null>(null);
    const [customer, setCustomer] = useState<CUSTOMER | null>(null);
    const [loading, setLoading] = useState(false);
    const [isAccepting, setIsAccepting] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);

    // ── Fetch quotation ───────────────────────────────────────────────────────
    useEffect(() => {
        if (!id) return;
        const fetchQuotation = async () => {
            try {
                setLoading(true);
                const res = await quotationApi.getById(id);
                if (res.status === 200) {
                    setQuotation(res.data);

                    // Fetch related customer for contact details
                    if (res.data.customer_id) {
                        try {
                            const custRes = await CustomerApi.getById(
                                res.data.customer_id.toString(),
                            );
                            if (custRes.data) setCustomer(custRes.data);
                        } catch {
                            // non-fatal – customer details will fall back to quotation data
                        }
                    }
                }
            } catch (err) {
                toast.error(getErrorMessage(err, "Failed to load quotation data"));
            } finally {
                setLoading(false);
            }
        };
        fetchQuotation();
    }, [id]);

    // ── Derived display values ────────────────────────────────────────────────
    const currency = (quotation?.currency ?? "LKR") as Currency;
    const currencySymbol = getCurrencySymbol(currency);
    const taxId = Number(quotation?.tax_type_id ?? QuotationTaxType.NONE);
    const hasTax = taxId === QuotationTaxType.VAT || taxId === QuotationTaxType.TIEP;

    const contactPhone = (() => {
        if (!customer || !quotation?.contact_person) return quotation?.contact_person ?? "";
        const contacts = Array.isArray(customer.contacts) ? customer.contacts : [];
        return contacts.find((c) => c.name === quotation.contact_person)?.phone ?? "";
    })();

    // ── Accept handler ────────────────────────────────────────────────────────
    const handleAccept = async () => {
        if (!quotation) return;
        try {
            setIsAccepting(true);
            const currentUser = getUser();
            const taxId = Number(quotation.tax_type_id);
            const payload: UPDATE_QUOTATION_REQUEST = {
                quote_id: quotation.quote_id,
                customer_id: Number(quotation.customer_id),
                type_id: Number(quotation.type_id),
                delivery_days: quotation.delivery_days,
                validity_period: quotation.validity_period,
                tax_type_id: taxId,
                currency: quotation.currency,
                contact_person: quotation.contact_person ?? null,
                marketing_person: quotation.marketing_person ?? null,
                notes: quotation.notes || "",
                status: QuotationStatus.ACCEPTED,
                // Only include tax totals if tax is applied
                ...(taxId !== 2 && {
                    sub_total: quotation.sub_total,
                    total_without_tax: quotation.total_without_tax,
                }),
                no_of_items: quotation.no_of_items,
                net_total: quotation.net_total,
                updated_by: currentUser?.name ?? "User",
                updated_on: new Date(),
                items: (quotation.items ?? []).map((item) => ({
                    item_id: item.item_id,
                    item_category: item.item_category,
                    item_qty: String(item.item_qty),
                    item_description: item.item_description,
                    item_unit_price: String(item.item_unit_price),
                    item_unit_discount: String(item.item_unit_discount || "0"),
                    item_total_price: String(item.item_total_price),
                })),
            };
            await quotationApi.update(id, payload);
            setQuotation((prev) => (prev ? { ...prev, status: QuotationStatus.ACCEPTED } : prev));
            toast.success("Quotation Accepted", {
                description: "The quotation status has been updated to Accepted.",
            });
        } catch (err) {
            toast.error(getErrorMessage(err, "Failed to accept quotation"));
        } finally {
            setIsAccepting(false);
        }
    };

    // ── Print handler ─────────────────────────────────────────────────────────
    const handlePrint = async () => {
        if (!quotation) return;
        try {
            setIsPrinting(true);

            // Merge best-available customer data into the PDF payload
            const pdfData: QUOTATIONS & { items: QuotationItems[] } = {
                ...quotation,
                company_name: customer?.company_name ?? quotation.company_name,
                customer_address: customer?.address ?? quotation.customer_address,
                customer_phone: customer?.phone ?? quotation.customer_phone,
                customer_email: customer?.email ?? quotation.customer_email,
                contact_person: quotation.contact_person,
                items: quotation.items ?? [],
            };

            await generateQuotationPDF(pdfData);
        } catch (err) {
            toast.error(getErrorMessage(err, "Failed to generate PDF"));
        } finally {
            setIsPrinting(false);
        }
    };

    // ── Render ────────────────────────────────────────────────────────────────
    if (loading) return <FullPageLoader />;

    if (!quotation) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 p-12">
                <p className="text-muted-foreground">Quotation not found.</p>
                <Button variant="outline" onClick={() => router.push("/quotation-management")}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to list
                </Button>
            </div>
        );
    }

    const isAccepted = quotation.status === QuotationStatus.ACCEPTED;

    return (
        <div className="flex flex-1 flex-col gap-4 p-[24px] pt-0 mt-3">
            {/* ── Header ───────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <PageTitleWithBreadcrumb
                    title="View Quotation"
                    breadcrumbs={[
                        { title: "Dashboard", href: "/dashboard" },
                        { title: "Quotation Management", href: "/quotation-management" },
                    ]}
                />
                <div className="flex items-center gap-2">
                    <StatusPill status={quotation.status} />
                </div>
            </div>

            <div className="space-y-4">
                {/* ── Card 1: Customer Details ──────────────────────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="shadow-sm">
                        <CardHeader className="flex flex-col gap-0.5">
                            <h3 className="text-md font-medium">Customer Details</h3>
                            <p className="text-xs text-muted-foreground">Customer information</p>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <ReadOnlyField
                                    label="Quote Date"
                                    value={
                                        quotation.created_on
                                            ? format(new Date(quotation.created_on), "PPP")
                                            : "—"
                                    }
                                />
                                <ReadOnlyField
                                    label="Customer (Company)"
                                    value={customer?.company_name ?? quotation.company_name}
                                />
                            </div>

                            <ReadOnlyField
                                label="Company Address"
                                value={customer?.address ?? quotation.customer_address}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <ReadOnlyField
                                    label="Contact Person"
                                    value={quotation.contact_person}
                                />
                                <ReadOnlyField label="Mobile Number" value={contactPhone} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* ── Card 2: Quotation Overview ──────────────────────────── */}
                    <Card className="shadow-sm">
                        <CardHeader className="flex flex-col gap-0.5">
                            <h3 className="text-md font-medium">Quotation Overview</h3>
                            <p className="text-xs text-muted-foreground">Quotation configuration</p>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <ReadOnlyField
                                    label="Quotation Type"
                                    value={quotationTypeLabel(quotation.type_id)}
                                />
                                <ReadOnlyField
                                    label="Delivery Days"
                                    value={quotation.delivery_days}
                                />
                                <ReadOnlyField
                                    label="Validity Period (Days)"
                                    value={quotation.validity_period}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <ReadOnlyField label="Tax Type" value={taxTypeLabel(taxId)} />
                                <ReadOnlyField label="Currency" value={quotation.currency} />
                            </div>

                            <ReadOnlyField
                                label="Marketing Person"
                                value={quotation.marketing_person}
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* ── Card 3: Items ─────────────────────────────────────────── */}
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-col gap-0.5">
                        <h3 className="text-md font-medium">Items</h3>
                        <p className="text-xs text-muted-foreground">Quotation line items</p>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <div className="overflow-x-auto rounded-md border">
                            <table className="w-full border-collapse text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="text-left p-3 font-medium text-muted-foreground">#</th>
                                        <th className="text-left p-3 font-medium text-muted-foreground">Item</th>
                                        <th className="text-left p-3 font-medium text-muted-foreground">Description</th>
                                        <th className="text-right p-3 font-medium text-muted-foreground">Qty</th>
                                        <th className="text-right p-3 font-medium text-muted-foreground">
                                            Rate ({currencySymbol})
                                        </th>
                                        <th className="text-right p-3 font-medium text-muted-foreground">
                                            Total excl. ({currencySymbol})
                                        </th>
                                        {hasTax && (
                                            <th className="text-right p-3 font-medium text-muted-foreground">
                                                Total incl. ({currencySymbol})
                                            </th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {(quotation.items ?? []).map((item, idx) => {
                                        const qty = parseFloat(item.item_qty || "0");
                                        const price = parseFloat(item.item_unit_price || "0");
                                        const excl = qty * price;
                                        const incl = hasTax ? excl * 1.18 : excl;
                                        return (
                                            <tr key={idx} className="border-b last:border-0 hover:bg-muted/30">
                                                <td className="p-3 text-muted-foreground">{idx + 1}</td>
                                                <td className="p-3">{item.item_category || "—"}</td>
                                                <td className="p-3 max-w-[240px]">
                                                    <p className="whitespace-pre-wrap break-words">
                                                        {item.item_description || "—"}
                                                    </p>
                                                </td>
                                                <td className="p-3 text-right">{item.item_qty}</td>
                                                <td className="p-3 text-right">{item.item_unit_price}</td>
                                                <td className="p-3 text-right">
                                                    {Number(excl.toFixed(4))}
                                                </td>
                                                {hasTax && (
                                                    <td className="p-3 text-right">
                                                        {Number(incl.toFixed(4))}
                                                    </td>
                                                )}
                                            </tr>
                                        );
                                    })}
                                    {(!quotation.items || quotation.items.length === 0) && (
                                        <tr>
                                            <td
                                                colSpan={hasTax ? 7 : 6}
                                                className="p-6 text-center text-muted-foreground italic"
                                            >
                                                No items found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Notes */}
                        {quotation.notes && (
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                    Notes
                                </label>
                                <div className="rounded-md border border-input bg-muted/40 px-3 py-2 text-sm whitespace-pre-wrap">
                                    {quotation.notes}
                                </div>
                            </div>
                        )}

                        {/* Totals summary */}
                        <div className="flex justify-end">
                            <div className="w-full md:w-64 space-y-2 border-t pt-4">
                                {hasTax && (
                                    <>
                                        <div className="flex justify-between text-sm text-muted-foreground">
                                            <span>Sub Total (excl. tax):</span>
                                            <span>{currencySymbol} {quotation.sub_total ?? "0"}</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-muted-foreground">
                                            <span>{taxId === QuotationTaxType.VAT ? "VAT" : "TIEP"} (18%):</span>
                                            <span>
                                                {currencySymbol}{" "}
                                                {Number(
                                                    (parseFloat(quotation.sub_total ?? "0") * 0.18).toFixed(4),
                                                )}
                                            </span>
                                        </div>
                                    </>
                                )}
                                <div className="flex justify-between text-sm">
                                    <span>No. of Items:</span>
                                    <span className="font-medium">{quotation.no_of_items ?? "0"}</span>
                                </div>
                                <div className="flex justify-between text-sm font-bold border-t pt-2">
                                    <span>Net Total:</span>
                                    <span>
                                        {currencySymbol} {quotation.net_total ?? "0"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* ── Action bar ───────────────────────────────────────────── */}
                <div className="flex items-center justify-end gap-3 mt-2">
                    <Button
                        variant="outline"
                        onClick={() => router.push("/quotation-management")}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>

                    {/* Print button — only available once ACCEPTED */}
                    {isAccepted && (
                        <Button
                            variant="outline"
                            onClick={handlePrint}
                            disabled={isPrinting}
                        >
                            {isPrinting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Generating…
                                </>
                            ) : (
                                <>
                                    <Printer className="mr-2 h-4 w-4" />
                                    Print
                                </>
                            )}
                        </Button>
                    )}

                    {/* Accept button — only shown when not already accepted */}
                    {!isAccepted && (
                        <Button
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={handleAccept}
                            disabled={isAccepting}
                        >
                            {isAccepting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Accepting…
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Accept Quotation
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ViewQuotation;
