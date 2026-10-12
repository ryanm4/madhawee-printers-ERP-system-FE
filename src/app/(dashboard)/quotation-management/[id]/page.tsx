"use client";
import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb";
import { RecordViewSkeleton } from "@/components/shared/page-skeletons";
import { getErrorMessage } from "@/lib/error-utils";
import { Button } from "@/components/ui/button";
import { useParams, useRouter } from "next/navigation";
import { getCurrencySymbol, Currency } from "@/lib/currencyUtils";
import { useEffect, useState } from "react";
import { CustomerApi } from "@/modules/customer/api";
import { CUSTOMER } from "@/modules/customer/types";
import { quotationApi } from "@/modules/quotations/api";
import { toast } from "sonner";
import { QUOTATIONS, QuotationItems } from "@/modules/quotations/types";
import { QuotationTaxType, QuotationStatus } from "@/config/enum";
import { generateQuotationPDF } from "@/components/pdf-generator";
import { Loader2, Printer, ArrowLeft } from "lucide-react";
import { getClientPermissions } from "@/lib/permissions";
import { StatusChanger } from "@/components/shared/status-changer";
import { statusActions } from "@/lib/status-actions";
import { updateQuotationStatus } from "@/modules/quotations/update-status";
import {
    Detail,
    DetailGrid,
    ViewError,
    ViewHeader,
    ViewSection,
    ViewTable,
    formatViewDate,
} from "@/components/shared/record-view";

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
    const [loading, setLoading] = useState(true);  // starts loading: the page fetches as soon as it opens
    const [isPrinting, setIsPrinting] = useState(false);

    const permissions = getClientPermissions();

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
        if (!customer || !quotation?.contact_person) return "";
        const contacts = Array.isArray(customer.contacts) ? customer.contacts : [];
        return contacts.find((c) => c.name === quotation.contact_person)?.phone ?? "";
    })();

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
    if (loading) {
        return (
            <div className="mt-3 flex flex-1 flex-col gap-5 p-4 pt-0 sm:p-6 sm:pt-0">
                <PageTitleWithBreadcrumb
                    title="View Quotation"
                    breadcrumbs={[
                        { title: "Dashboard", href: "/dashboard" },
                        { title: "Quotation Management", href: "/quotation-management" },
                    ]}
                />
                <RecordViewSkeleton />
            </div>
        );
    }

    if (!quotation) {
        return (
            <div className="mt-3 flex flex-1 flex-col gap-5 p-4 pt-0 sm:p-6 sm:pt-0">
                <PageTitleWithBreadcrumb
                    title="View Quotation"
                    breadcrumbs={[
                        { title: "Dashboard", href: "/dashboard" },
                        { title: "Quotation Management", href: "/quotation-management" },
                    ]}
                />
                <ViewError>Couldn&apos;t find this quotation. Go back to the list and open it again.</ViewError>
                <Button variant="outline" className="self-start" onClick={() => router.push("/quotation-management")}>
                    <ArrowLeft className="h-4 w-4" /> Back to list
                </Button>
            </div>
        );
    }

    const isAccepted = quotation.status === QuotationStatus.ACCEPTED;
    const companyName = customer?.company_name ?? quotation.company_name;
    const quoteDate = formatViewDate(quotation.created_on as string | undefined);
    const items = quotation.items ?? [];
    const money = (value: number) => Number(value.toFixed(4)).toLocaleString(undefined, { maximumFractionDigits: 4 });

    return (
        <div className="mt-3 flex flex-1 flex-col gap-5 p-4 pt-0 sm:p-6 sm:pt-0">
            <PageTitleWithBreadcrumb
                title="View Quotation"
                breadcrumbs={[
                    { title: "Dashboard", href: "/dashboard" },
                    { title: "Quotation Management", href: "/quotation-management" },
                ]}
            />

            <ViewHeader
                title={`Quotation ${quotation.quote_id}`}
                status={quotation.status}
                statusType="QUOTATION"
                subtitle={
                    <>
                        For <span className="font-medium text-[#1B2433]">{companyName}</span>
                        {quoteDate && <>, dated {quoteDate}</>}
                    </>
                }
                actions={
                    <>
                        <Button variant="outline" onClick={() => router.push("/quotation-management")}>
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </Button>

                        {/* Print button — only available once ACCEPTED */}
                        {isAccepted && (
                            <Button variant="outline" onClick={handlePrint} disabled={isPrinting}>
                                {isPrinting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Generating…
                                    </>
                                ) : (
                                    <>
                                        <Printer className="h-4 w-4" />
                                        Print
                                    </>
                                )}
                            </Button>
                        )}

                        <StatusChanger
                            current={quotation.status}
                            actions={statusActions.quotation(quotation.status, permissions)}
                            onChange={async (to) => {
                                try {
                                    await updateQuotationStatus(quotation, to);
                                    setQuotation((prev) => (prev ? { ...prev, status: to } : prev));
                                    toast.success(`Quotation ${to === QuotationStatus.ACCEPTED ? "accepted" : "rejected"}`);
                                    return true;
                                } catch (err) {
                                    toast.error(getErrorMessage(err, "Couldn't change the status"));
                                    return false;
                                }
                            }}
                        />
                    </>
                }
            />

            <div className="grid gap-5 lg:grid-cols-2">
                <ViewSection title="Customer details">
                    <DetailGrid columns={2}>
                        <Detail label="Quote date" value={quoteDate} />
                        <Detail label="Customer (company)" value={companyName} />
                        <Detail
                            label="Company address"
                            value={customer?.address ?? quotation.customer_address}
                            className="col-span-2"
                        />
                        <Detail label="Contact person" value={quotation.contact_person} />
                        <Detail
                            label="Mobile number"
                            value={
                                contactPhone && (
                                    <a href={`tel:${contactPhone}`} className="hover:text-[#223F7A] hover:underline">
                                        {contactPhone}
                                    </a>
                                )
                            }
                        />
                    </DetailGrid>
                </ViewSection>

                <ViewSection title="Quotation overview">
                    <DetailGrid columns={3}>
                        <Detail label="Quotation type" value={quotationTypeLabel(quotation.type_id)} />
                        <Detail label="Delivery days" value={quotation.delivery_days} />
                        <Detail label="Validity period (days)" value={quotation.validity_period} />
                        <Detail label="Tax type" value={taxTypeLabel(taxId)} />
                        <Detail label="Currency" value={quotation.currency} />
                        <Detail label="Marketing person" value={quotation.marketing_person} />
                    </DetailGrid>
                </ViewSection>
            </div>

            <ViewSection
                title={`Items (${items.length})`}
                aside={
                    <p className="text-sm text-muted-foreground">
                        Net total{" "}
                        <span className="font-semibold tabular-nums text-[#1B2433]">
                            {currencySymbol} {quotation.net_total ?? "0"}
                        </span>
                    </p>
                }
            >
                <ViewTable
                    rows={items}
                    rowKey={(_, idx) => idx}
                    empty="No items found"
                    columns={[
                        {
                            header: "Item",
                            cell: (item, idx) => (
                                <>
                                    <span className="font-medium">{item.item_category || `Item ${idx + 1}`}</span>
                                    {item.item_description && (
                                        <span className="mt-0.5 block whitespace-pre-wrap break-words text-[13px] text-muted-foreground md:hidden">
                                            {item.item_description}
                                        </span>
                                    )}
                                </>
                            ),
                        },
                        {
                            header: "Description",
                            className: "max-w-[320px] whitespace-pre-wrap break-words",
                            cell: (item) => item.item_description || <span className="text-muted-foreground">Not set</span>,
                        },
                        { header: "Qty", align: "right", cell: (item) => item.item_qty },
                        { header: `Rate (${currencySymbol})`, align: "right", cell: (item) => item.item_unit_price },
                        {
                            header: `Total excl. (${currencySymbol})`,
                            align: "right",
                            cell: (item) =>
                                money(parseFloat(item.item_qty || "0") * parseFloat(item.item_unit_price || "0")),
                        },
                        ...(hasTax
                            ? [
                                  {
                                      header: `Total incl. (${currencySymbol})`,
                                      align: "right" as const,
                                      cell: (item: QuotationItems) => (
                                          <span className="font-medium">
                                              {money(
                                                  parseFloat(item.item_qty || "0") *
                                                      parseFloat(item.item_unit_price || "0") *
                                                      1.18
                                              )}
                                          </span>
                                      ),
                                  },
                              ]
                            : []),
                    ]}
                />

                <div className="mt-5 flex flex-col gap-5 border-t border-[#EEF1F5] pt-5 md:flex-row md:items-start md:justify-between">
                    <dl className="min-w-0 md:max-w-[60%]">
                        <Detail label="Notes" value={quotation.notes} />
                    </dl>

                    <dl className="w-full space-y-2 text-sm md:w-72">
                        {hasTax && (
                            <>
                                <div className="flex justify-between text-muted-foreground">
                                    <dt>Sub total (excl. tax)</dt>
                                    <dd className="tabular-nums">{currencySymbol} {quotation.sub_total ?? "0"}</dd>
                                </div>
                                <div className="flex justify-between text-muted-foreground">
                                    <dt>{taxId === QuotationTaxType.VAT ? "VAT" : "TIEP"} (18%)</dt>
                                    <dd className="tabular-nums">
                                        {currencySymbol}{" "}
                                        {Number((parseFloat(quotation.sub_total ?? "0") * 0.18).toFixed(4))}
                                    </dd>
                                </div>
                            </>
                        )}
                        <div className="flex justify-between text-muted-foreground">
                            <dt>No. of items</dt>
                            <dd className="tabular-nums">{quotation.no_of_items ?? "0"}</dd>
                        </div>
                        <div className="flex justify-between border-t border-[#E4E8F0] pt-2 text-base font-semibold text-[#1B2433]">
                            <dt>Net total</dt>
                            <dd className="tabular-nums">{currencySymbol} {quotation.net_total ?? "0"}</dd>
                        </div>
                    </dl>
                </div>
            </ViewSection>
        </div>
    );
}

export default ViewQuotation;
