"use client";
import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb";
import { getErrorMessage } from "@/lib/error-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { inventoryApi } from "@/modules/inventory/api";
import { AlertDeleteDialog } from "@/components/shared/delete_popup";
import { Check, ChevronsUpDown, PlusIcon, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { DataTable } from "./_components/inventory_table";
import { inventoryColumns } from "./_components/inventory_columns";
import { GET_ALL_INVENTORY } from "@/modules/inventory/types";
import { appToast } from "@/lib/toast-utils";
import { EmptyState } from "@/components/shared/empty-page";
import { ExportButton } from "@/components/shared/export-button";
import { PageLoader } from "@/components/shared/loader";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
import { useMemo } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

function InventoryManagement() {
  const router = useRouter();
  const [data, setData] = useState<GET_ALL_INVENTORY[]>([]);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sizeFilter, setSizeFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sizeOpen, setSizeOpen] = useState(false);
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await inventoryApi.getAll();

      if (response.status === 200) {
        const sortedData = response.data.sort((a: any, b: any) => {
          const dateA = new Date(a.created_on || a.created_at || 0).getTime();
          const dateB = new Date(b.created_on || b.created_at || 0).getTime();
          return dateB - dateA;
        });
        setData(sortedData);
      }
    } catch (error) {
      console.error("Failed to fetch inventory", error);
      appToast.error("Failed to fetch inventory", getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const [isDeleting, setIsDeleting] = useState(false);

  const handlers = useMemo(() => ({
    onEdit: (id: number) => {
      router.push(`/inventory/${id}/edit`);
    },
    onDelete: (id: number) => {
      setDeleteId(id);
    },
  }), [router]);

  const columns = useMemo(() => inventoryColumns(handlers), [handlers]);

  const handleDelete = async () => {
    if (deleteId === null) return;

    try {
      setIsDeleting(true);
      await inventoryApi.delete(deleteId);
      appToast.success("Inventory Item Deleted", "The item has been successfully removed from inventory.");
      await fetchData();
    } catch (error) {
      console.error("Failed to delete inventory item", error);
      appToast.error("Failed to Delete Item", getErrorMessage(error));
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const sizeOptions = Array.from(
    new Set(data.map((item) => item.size).filter(Boolean))
  ).sort();
  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-[24px] pt-0 mt-3">
        <PageTitleWithBreadcrumb
          title="Inventory Management"
          breadcrumbs={[{ title: "Dashboard", href: "/dashboard" }]}
        />
        <div className="flex flex-row justify-end gap-[24px]">
          <div className="relative w-[320px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Item Name"
              className="w-full pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Popover open={sizeOpen} onOpenChange={setSizeOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={sizeOpen}
                className="w-[200px] justify-between"
              >
                {sizeFilter !== "all" ? sizeFilter : "All Sizes"}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandInput placeholder="Search size..." />
                <CommandList>
                  <CommandEmpty>No size found.</CommandEmpty>
                  <CommandGroup>
                    <div
                      style={{ maxHeight: "240px", overflowY: "auto" }}
                      onWheel={(e) => e.stopPropagation()}
                    >
                      {/* "All Sizes" reset option */}
                      <CommandItem
                        value="all"
                        onSelect={() => {
                          setSizeFilter("all");
                          setSizeOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            sizeFilter === "all" ? "opacity-100" : "opacity-0"
                          )}
                        />
                        All Sizes
                      </CommandItem>

                      {sizeOptions.map((size) => (
                        <CommandItem
                          key={size}
                          value={size}
                          onSelect={(current) => {
                            setSizeFilter(
                              current === sizeFilter ? "all" : current
                            );
                            setSizeOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              sizeFilter === size ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {size}
                        </CommandItem>
                      ))}
                    </div>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <ExportButton data={data} filename="inventory-list" />
          <Button onClick={() => router.push("/inventory/create")}>
            <PlusIcon /> Create New
          </Button>
        </div>
        {isLoading ? (
          <PageLoader />
        ) : data.length === 0 ? (
          <EmptyState
            title="Inventory Empty"
            description="There are no items in your inventory. Add your stocks and materials to start tracking them."
            createLabel="Create New Inventory"
            createPath="/inventory/create"
          />
        ) : (
          <DataTable
            columns={columns}
            data={data}
            searchValue={search}
            searchColumn="item_name"
            filters={[{ id: "size", value: sizeFilter }]}
          />
        )}
      </div>

      <DeleteConfirmationDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Inventory Item"
        description="Are you sure you want to delete this inventory item? This action cannot be undone."
        loading={isDeleting}
      />
    </>
  );
}

export default InventoryManagement;
