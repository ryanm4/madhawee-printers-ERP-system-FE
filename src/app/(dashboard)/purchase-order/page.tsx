
import PageTitleWithBreadcrumb from "@/common/PageTitileWithBreadCrumb";
import { Button } from "@/components/ui/button";
import { ButtonGroup, ButtonGroupSeparator } from "@/components/ui/button-group";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusIcon, Search } from "lucide-react";
import React from "react";

function PurchaseOrderPage() {
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

          <Button>
            <PlusIcon /> Create New
          </Button>

          <TabsList>
            <TabsTrigger value="Grid-View">Grid View</TabsTrigger>
            <TabsTrigger value="Table-View">Table View</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="Grid-View">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="bg-muted/50 aspect-video rounded-xl" />
            <div className="bg-muted/50 aspect-video rounded-xl" />
            <div className="bg-muted/50 aspect-video rounded-xl" />
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
