"use client";
import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb";
import { getErrorMessage } from "@/lib/error-utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  ITEM_CATEGORY,
  ITEM_SUB_CATEGORY,
  UNIT_OF_MEASSURE,
} from "@/config/enum";
import { cn } from "@/lib/utils";
import { inventoryApi } from "@/modules/inventory/api";
import { CREATE_INVENTORY } from "@/modules/inventory/types";
import { inventoryManagementScheme } from "@/modules/inventory/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { getUser } from "@/lib/auth";
import { FieldPath, useForm, ControllerProps } from "react-hook-form";
import { appToast } from "@/lib/toast-utils";
import { z } from "zod";
import { FullPageLoader } from "@/components/shared/loader";

type InventoryManagementFormValues = z.infer<typeof inventoryManagementScheme>;

function EditInventoryManagement() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<{
    name: string;
    email: string;
    avatar: string;
  } | null>(null);
  const params = useParams();
  const id = params.id as string;

  const baseDefaultValues: InventoryManagementFormValues = {
    item_category: "",
    item_sub_category: "",
    item_name: "",
    width: "",
    height: "",
    size: "",
    quantity: 0,
    unit_of_measure: "",
    reorder_level: "",
    status: "",
    remarks: "",
  };

  const form = useForm<InventoryManagementFormValues>({
    resolver: zodResolver(inventoryManagementScheme),
    defaultValues: baseDefaultValues,
  });

  useEffect(() => {
    const userData = getUser();
    if (userData) {
      setUser({
        name: userData.name || "User",
        email: userData.email ?? "",
        avatar: "",
      });
    }
  }, []);

  useEffect(() => {
    async function fetchInventoryData() {
      try {
        setIsLoading(true);
        const response = await inventoryApi.getById(id);
        const data = response.data;

        // Parse size into width and height
        let width = "";
        let height = "";
        if (data.size && data.size.includes("x")) {
          const parts = data.size.split("x").map((p) => p.trim());
          width = parts[0] || "";
          height = parts[1] || "";
        } else if (data.size) {
          width = data.size;
        }

        // ✅ Populate form with fetched data
        form.reset({
          item_category: data.item_category,
          item_sub_category: data.item_sub_category,
          item_name: data.item_name,
          width: width,
          height: height,
          size: data.size,
          quantity: Number(data.quantity),
          unit_of_measure: data.unit_of_measure,
          reorder_level: data.reorder_level,
          status: data.status,
          remarks: data.remarks || "",
        });
      } catch (error) {
        console.error("Failed to fetch inventory:", error);
        appToast.error("Failed to load inventory data", getErrorMessage(error));
        router.push("/inventory");
      } finally {
        setIsLoading(false);
      }
    }

    if (id) {
      fetchInventoryData();
    }
  }, [id, form, router]);

  async function onSubmit(data: InventoryManagementFormValues) {
    try {
      setIsLoading(true);
      const payload: CREATE_INVENTORY = {
        item_category: data.item_category,
        item_sub_category: data.item_sub_category,
        item_name: data.item_name,
        size:
          data.width && data.height
            ? `${data.width} x ${data.height}`
            : data.size || "-",
        width: data.width ?? "",
        height: data.height ?? "",
        quantity: String(data.quantity),
        unit_of_measure: data.unit_of_measure,
        reorder_level: data.reorder_level,
        status: data.status,
        remarks: data.remarks ?? "",
        updated_by: user?.name || "User",
      };
      await inventoryApi.update(id, payload);

      appToast.updated(
        "Inventory Item Updated",
        "The inventory item has been updated successfully.",
      );
      form.reset(baseDefaultValues);
      form.clearErrors();
      router.push("/inventory");
    } catch (error) {
      console.error("Failed to update inventory:", error);
      appToast.error(
        "Failed to Update Inventory Item",
        getErrorMessage(
          error,
          "An error occurred while updating the inventory item. Please try again.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }

  const renderFormField = <
    TName extends FieldPath<InventoryManagementFormValues>,
  >(
    name: TName,
    render: ControllerProps<InventoryManagementFormValues, TName>["render"],
  ) => (
    <FormField<InventoryManagementFormValues, TName>
      control={form.control}
      name={name}
      render={render}
    />
  );

  return (
    <div className="flex flex-1 flex-col gap-4 p-[24px] pt-0 mt-3">
      {isLoading && <FullPageLoader />}
      <PageTitleWithBreadcrumb
        title="Edit Stock"
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard" },
          { title: "Stock List", href: "/inventory" },
        ]}
      />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6  pb-0"
        >
          <Card
            className={cn(
              "w-full   shadow-sm hover:shadow-md transition-shadow flex flex-col",
            )}
          >
            <CardHeader className="flex flex-col gap-[0.5px]">
              <h3 className="text-md font-medium mb-2">Stock Details</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Edit your stock details here
              </p>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              {/* Row 1: Categories */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderFormField("item_category", ({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Item Category <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Item Category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(ITEM_CATEGORY).map(([key, value]) => (
                          <SelectItem key={key} value={value}>
                            {value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                ))}
                {renderFormField("item_sub_category", ({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Item Sub Category <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Item Sub Category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(ITEM_SUB_CATEGORY).map(
                          ([key, value]) => (
                            <SelectItem key={key} value={value}>
                              {value}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                ))}
              </div>

              {/* Row 2: Name */}
              <div className="grid grid-cols-1 gap-4">
                {renderFormField("item_name", ({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Item Name <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter Item Name"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                ))}
              </div>

              {/* Row 3: Width, Height and Quantity */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
                  {renderFormField("width", ({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Width (cm) <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="W" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  ))}
                  <div className="pb-3 text-muted-foreground font-bold text-xs">
                    x
                  </div>
                  {renderFormField("height", ({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Height (cm) <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="H" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  ))}
                </div>
                {renderFormField("quantity", ({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Item Quantitiy <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter Item Quantity"
                        value={field.value}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                ))}
              </div>

              {/* Row 4: UOM, Reorder Level, Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {renderFormField("unit_of_measure", ({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Unit of Measure <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || undefined}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Unit of Meassure" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(UNIT_OF_MEASSURE).map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                ))}
                {renderFormField("reorder_level", ({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Re-order Level <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Re-order Level" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                ))}
                {renderFormField("status", ({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Status <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                        <SelectItem value="INACTIVE">INACTIVE</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                ))}
              </div>

              {/* Row 5: Remarks */}
              <div className="grid grid-cols-1 gap-4">
                {renderFormField("remarks", ({ field }) => (
                  <FormItem>
                    <FormLabel>Remarks</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter Remarks"
                        className="h-20 min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                ))}
              </div>
            </CardContent>
          </Card>
          <div className="flex items-center justify-end gap-[16px] sm:justify-end w-full mt-6">
            <Button
              size="lg"
              variant="outline"
              type="button"
              onClick={() => router.push("/inventory")}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              size="lg"
              type="submit"
              className="bg-primary text-white"
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "Update"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default EditInventoryManagement;
