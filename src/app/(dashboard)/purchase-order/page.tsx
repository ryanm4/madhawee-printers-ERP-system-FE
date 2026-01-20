"use client"
import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb";
import { PurchaseOrderCard } from "@/components/purchase-order-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { LayoutPanelTop, PlusIcon, Search, Table2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";


import { purchaseOrderApi } from "@/modules/purchase-order/api";
import { PURCHASE_ORDER } from "@/modules/purchase-order/types";


function PurchaseOrderPage() {

  const [data, setData] = useState<PURCHASE_ORDER[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter()

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await purchaseOrderApi.getAll();
      console.log(response)
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch POs');
    } finally {
      setLoading(false);
    }
  };


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
            {data.map((item: PURCHASE_ORDER) => (
              <PurchaseOrderCard
                key={item.po_id}
                po_id={item.po_id}
                companyName={item.customer.name}
                contactEmail={item.customer.email}
                poNumber={item.po_id}
                poDate={item.po_date}
                deliveryDate={item.delivery_date}
                jobs={item.jobs}
                totalJobs={item.jobs.length}
                additionalJobs={item.jobs.length}
                status={item.status}
              />
            ))}
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
