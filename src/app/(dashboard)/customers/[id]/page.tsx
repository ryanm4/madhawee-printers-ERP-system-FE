"use client";

import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb";
import { RecordViewSkeleton } from "@/components/shared/page-skeletons";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { CustomerType } from "@/config/enum";
import { CustomerApi } from "@/modules/customer/api";
import { CUSTOMER } from "@/modules/customer/types";
import { toast } from "sonner";
import { usePermissions } from "@/hooks/use-permissions";
import {
  Detail,
  DetailGrid,
  ViewHeader,
  ViewSection,
  ViewTable,
  sentenceCase,
} from "@/components/shared/record-view";

type Contact = { id?: number; name?: string; email?: string; phone?: string };

function ViewCustomerRelationship() {
  const router = useRouter();
  const { canModifyCustomer } = usePermissions();
  const params = useParams();
  const id = params.id as string;

  const [customer, setCustomer] = useState<CUSTOMER | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCustomer() {
      try {
        setIsLoading(true);
        const response = await CustomerApi.getById(id);
        setCustomer(response.data);
      } catch (error) {
        console.error("Failed to fetch customer:", error);
        toast.error("Failed to load customer data");
        router.push("/customers");
      } finally {
        setIsLoading(false);
      }
    }

    if (id) fetchCustomer();
  }, [id, router]);

  const c = customer;
  const contacts: Contact[] = (Array.isArray(c?.contacts) ? (c.contacts as Contact[]) : []).filter(
    (cp) => cp.name || cp.email || cp.phone
  );
  // Credit period only applies to suppliers
  const isCustomerOnly = c?.customer_type === CustomerType.CUSTOMER;
  const hasLogo = typeof c?.logo_url === "string" && /^(https?:|data:image|\/)/.test(c.logo_url);

  return (
    <div className="mt-3 flex flex-1 flex-col gap-5 p-4 pt-0 sm:p-6 sm:pt-0">
      <PageTitleWithBreadcrumb
        title="View Customer"
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard" },
          { title: "Customer", href: "/customers" },
        ]}
      />

      <ViewHeader
        title={c?.company_name}
        status={c?.status}
        statusType="CUSTOMER"
        subtitle={c && sentenceCase(c.customer_type)}
        actions={
          <>
            <Button variant="outline" type="button" onClick={() => router.push("/customers")}>
              Back to List
            </Button>
            {canModifyCustomer && (
              <Button type="button" onClick={() => router.push(`/customers/${id}/edit`)}>
                <Edit className="h-4 w-4" /> Edit Customer
              </Button>
            )}
          </>
        }
      />
      {isLoading && !customer && <RecordViewSkeleton />}

      {c && (
        <div className="grid gap-5 lg:grid-cols-2">
          <ViewSection
            title="Customer"
            aside={
              hasLogo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.logo_url} alt={`${c.company_name} logo`} className="h-10 max-w-[120px] object-contain" />
              )
            }
          >
            <DetailGrid columns={2}>
              <Detail label="Customer / Supplier" value={sentenceCase(c.customer_type)} />
              <Detail label="Company name" value={c.company_name} />
              <Detail
                label="Company phone"
                value={c.phone && <a href={`tel:${c.phone}`} className="hover:text-[#223F7A] hover:underline">{c.phone}</a>}
              />
              <Detail
                label="Company email"
                value={c.email && <a href={`mailto:${c.email}`} className="hover:text-[#223F7A] hover:underline">{c.email}</a>}
              />
              <Detail label="Customer address" value={c.address} className="col-span-2" />
              <Detail label="VAT type" value={c.vat_type} />
              <Detail label="VAT no" value={c.vat_no} />
              <Detail
                label="Credit period (for suppliers)"
                value={isCustomerOnly ? "Not applicable to customers" : c.credit_period}
              />
            </DetailGrid>
          </ViewSection>

          <ViewSection title={`Point of contacts (${contacts.length})`}>
            <ViewTable
              rows={contacts}
              rowKey={(cp, i) => cp.id ?? i}
              empty="No contact people have been added."
              columns={[
                { header: "Name", cell: (cp) => <span className="font-medium">{cp.name || "Not set"}</span> },
                {
                  header: "Email",
                  cell: (cp) =>
                    cp.email ? (
                      <a href={`mailto:${cp.email}`} className="break-all hover:text-[#223F7A] hover:underline">{cp.email}</a>
                    ) : (
                      <span className="text-muted-foreground">Not set</span>
                    ),
                },
                {
                  header: "Phone",
                  cell: (cp) =>
                    cp.phone ? (
                      <a href={`tel:${cp.phone}`} className="hover:text-[#223F7A] hover:underline">{cp.phone}</a>
                    ) : (
                      <span className="text-muted-foreground">Not set</span>
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

export default ViewCustomerRelationship;
