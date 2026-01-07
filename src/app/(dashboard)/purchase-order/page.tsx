"use client"
import PageTitleWithBreadcrumb from "@/common/PageTitileWithBreadCrumb";
import { PurchaseOrderCard } from "@/components/purchase-order-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { LayoutPanelTop, PlusIcon, Search, Table2 } from "lucide-react";
import React from "react";
import { useRouter } from "next/navigation";

function PurchaseOrderPage() {

  const router = useRouter()
  return (
    <div className="flex flex-1 flex-col gap-4 p-[24px] pt-0 mt-3">
      <PageTitleWithBreadcrumb
        title="Purchase Order Management"
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard" }
        ]}
      />
      <Tabs defaultValue="Grid-View" className="w-full flex-1 flex flex-col gap-4">
        <div className="flex flex-row justify-end gap-[24px]">
          <div className="relative w-[320px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="PO Number"
              className="w-full pl-8"
            />
          </div>



          <TabsList>
            <TabsTrigger value="Grid-View"><LayoutPanelTop /></TabsTrigger>
            <TabsTrigger value="Table-View"><Table2 /></TabsTrigger>
          </TabsList>
          <Button onClick={() => router.push("/purchase-order/create")}>
            <PlusIcon /> Create New
          </Button>
        </div>

        <TabsContent value="Grid-View">
          <div className="grid gap-[24px] grid-cols-[repeat(auto-fit,minmax(412px,1fr))]">
            <PurchaseOrderCard
              po_id="po-212201"
              companyName="Korean SPA Packaging (PVT) LTD"
              contactEmail="sydney.moore@korenspa.com"
              poNumber="PO-212201"
              poDate="2025-11-20"
              deliveryDate="2025-12-23"
              jobs={[
                { id: "1", code: "JO-2312", name: "Test Job", status: "Started", date: "2025-12-10" },
                { id: "2", code: "JO-2315", name: "Test Job 1", status: "Pending", date: "2025-12-10" },
              ]}
              totalJobs={4}
              additionalJobs={2}
              status="Created"
            />
            <PurchaseOrderCard
              po_id="po-212202"
              companyName="Korean SPA Packaging (PVT) LTD"
              contactEmail="sydney.moore@korenspa.com"
              poNumber="PO-212202"
              poDate="2025-11-21"
              deliveryDate="2025-12-24"
              jobs={[
                { id: "3", code: "JO-2316", name: "Brochure Design", status: "Started", date: "2025-12-11" },
                { id: "4", code: "JO-2317", name: "Packaging V2", status: "In Reviews", date: "2025-12-12" },
              ]}
              totalJobs={3}
              additionalJobs={1}
              status="Created"
            />
            <PurchaseOrderCard
              po_id="po-212203"
              companyName="Korean SPA Packaging (PVT) LTD"
              contactEmail="sydney.moore@korenspa.com"
              poNumber="PO-212203"
              poDate="2025-11-22"
              deliveryDate="2025-12-25"
              jobs={[
                { id: "5", code: "JO-2318", name: "Label Print", status: "Done", date: "2025-12-13" },
                { id: "6", code: "JO-2319", name: "Box Mockup", status: "Pending", date: "2025-12-14" },
              ]}
              totalJobs={5}
              additionalJobs={3}
              status="Created"
            />
            <PurchaseOrderCard
              po_id="po-212203"
              companyName="Korean SPA Packaging (PVT) LTD"
              contactEmail="sydney.moore@korenspa.com"
              poNumber="PO-212203"
              poDate="2025-11-22"
              deliveryDate="2025-12-25"
              jobs={[
                { id: "5", code: "JO-2318", name: "Label Print", status: "Done", date: "2025-12-13" },
                { id: "6", code: "JO-2319", name: "Box Mockup", status: "Pending", date: "2025-12-14" },
              ]}
              totalJobs={5}
              additionalJobs={3}
              status="Created"
            />
            <PurchaseOrderCard
              po_id="po-212203"
              companyName="Korean SPA Packaging (PVT) LTD"
              contactEmail="sydney.moore@korenspa.com"
              poNumber="PO-212203"
              poDate="2025-11-22"
              deliveryDate="2025-12-25"
              jobs={[
                { id: "5", code: "JO-2318", name: "Label Print", status: "Done", date: "2025-12-13" },
                { id: "6", code: "JO-2319", name: "Box Mockup", status: "Pending", date: "2025-12-14" },
              ]}
              totalJobs={5}
              additionalJobs={3}
              status="Created"
            />
            <PurchaseOrderCard
              po_id="po-212203"
              companyName="Korean SPA Packaging (PVT) LTD"
              contactEmail="sydney.moore@korenspa.com"
              poNumber="PO-212203"
              poDate="2025-11-22"
              deliveryDate="2025-12-25"
              jobs={[
                { id: "5", code: "JO-2318", name: "Label Print", status: "Done", date: "2025-12-13" },
                { id: "6", code: "JO-2319", name: "Box Mockup", status: "Pending", date: "2025-12-14" },
              ]}
              totalJobs={5}
              additionalJobs={3}
              status="Created"
            />
          </div>
          <div className="relative flex flex-col items-center justify-center gap-4 py-4 mt-8 md:flex-row">
            <div className="text-sm text-muted-foreground md:absolute md:left-0">
              Page 1 of 10
            </div>
            <Pagination className="w-auto mx-0">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive>1</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">2</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">3</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">10</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </TabsContent>

        <TabsContent value="Table-View">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="bg-muted/50 aspect-video rounded-xl" />
            <div className="bg-muted/50 aspect-video rounded-xl" />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default PurchaseOrderPage;
