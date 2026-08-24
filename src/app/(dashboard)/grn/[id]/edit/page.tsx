"use client";
import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb";
import { getErrorMessage } from "@/lib/error-utils";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { grnSchema } from "@/modules/grn/validation";
import { cn } from "@/lib/utils";
import { useRouter, useParams } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Loader2, PlusIcon, Trash2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format, parseISO } from "date-fns";
import { useEffect, useState } from "react";
import { grnApi } from "@/modules/grn/api";
import { appToast } from "@/lib/toast-utils";
import { getUser } from "@/lib/auth";
import { FullPageLoader } from "@/components/shared/loader";
import { RestrictedRouteGuard } from "@/components/shared/restricted-route-guard";
import { usePermissions } from "@/hooks/use-permissions";
import { SupplierCombobox } from "../../_components/supplier-combobox";
import { inventoryApi } from "@/modules/inventory/api";
import { Combobox } from "@/components/shared/combobox";
import { GET_ALL_INVENTORY } from "@/modules/inventory/types";
import { GRNItem } from "@/modules/grn/types";
import { useCallback } from "react";

type GRNFormValues = {
  related_po: string;
  received_date: Date;
  supplier_name: string;
  stock_location: string;
  payee_name?: string;
  payment_method: "CASH" | "CREDIT";
  currency: string;
  supplier_invoice_no: string;
  remarks?: string;
  items: {
    item_name: string;
    quantity: number;
    rate: number;
    amount: number;
  }[];
};

function EditGRN() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const { canModifyGRN } = usePermissions();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [inventoryItems, setInventoryItems] = useState<
    { value: string; label: string }[]
  >([]);
  const [inventoryData, setInventoryData] = useState<GET_ALL_INVENTORY[]>([]);

  const form = useForm<GRNFormValues>({
    resolver: zodResolver(grnSchema) as any,
    defaultValues: {
      related_po: "",
      received_date: new Date(),
      supplier_name: "",
      stock_location: "Main Warehouse",
      payee_name: "",
      payment_method: "CASH",
      currency: "LKR",
      supplier_invoice_no: "",
      remarks: "",
      items: [{ item_name: "", quantity: 0, rate: 0, amount: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const selectedCurrency = form.watch("currency") || "LKR";

  useEffect(() => {
    const userData = getUser();
    if (userData) {
      setUser({ name: userData.name || "User" });
    }
    if (id) {
      fetchGRN();
    }

    const fetchInventory = async () => {
      try {
        const response = await inventoryApi.getAll();
        if (response.status === 200) {
          const uniqueItems = Array.from(
            new Map(
              response.data.map((item: GET_ALL_INVENTORY) => [
                `${item.item_sub_category}${item.item_name}-${item.size || ""}`,
                item,
              ])
            ).values()
          );

          setInventoryData(response.data);
          setInventoryItems(
            uniqueItems.map((item: GET_ALL_INVENTORY) => {
              const label = item.size
                ? `${item.item_sub_category} ${item.item_name} (${item.size})`
                : item.item_name;
              return {
                value: item.item_id.toString(),
                label: label,
              };
            })
          );
        }
      } catch (error) {
        console.error("Failed to fetch inventory items", error);
      }
    };
    fetchInventory();
  }, [id]);

  const fetchGRN = useCallback(async () => {
    try {
      setLoading(true);
      const [grnResponse, inventoryResponse] = await Promise.all([
        grnApi.getById(id as string),
        inventoryApi.getAll(),
      ]);

      if (grnResponse.status === 200 && inventoryResponse.status === 200) {
        const data = grnResponse.data;
        const inventory = inventoryResponse.data;

        form.reset({
          related_po: data.related_po || "",
          received_date: parseISO(data.received_date),
          supplier_name: data.supplier_name || "",
          stock_location: data.stock_location || "",
          payee_name: data.payee_name || "",
          payment_method:
            data.payment_method === "CREDIT" || data.payment_method === "CASH"
              ? data.payment_method
              : "CASH",
          currency: data.currency || "",
          supplier_invoice_no: data.supplier_invoice_no || "",
          remarks: data.remarks || "",
          items: data.items.map((item: GRNItem) => {
            const invItem = inventory.find(
              (inv) =>
                inv.item_name === item.item_name ||
                `${inv.item_sub_category} ${inv.item_name}` === item.item_name ||
                `${inv.item_sub_category} ${inv.item_name} (${inv.size || ""})` === item.item_name ||
                `${inv.item_sub_category} ${inv.item_name} ${inv.size || ""}`.trim() === item.item_name ||
                `${inv.item_name} ${inv.size || ""}`.trim() === item.item_name ||
                `${inv.item_name} (${inv.size || ""})` === item.item_name
            );
            return {
              item_name: invItem?.item_id.toString() || item.item_name,
              quantity: Number(item.quantity),
              rate: Number(item.rate),
              amount: Number(item.amount),
            };
          }),
        });
      }
    } catch (error) {
      appToast.error(getErrorMessage(error, "Failed to fetch GRN details"));
      router.push("/grn");
    } finally {
      setLoading(false);
    }
  }, [id, form, router]);

  async function onSubmit(values: GRNFormValues) {
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      const payload = {
        ...values,
        received_date: format(values.received_date, "yyyy-MM-dd HH:mm:ss"),
        updated_by: user?.name || "User",
        items: values.items.map((item) => {
          // Find the inventory item by item_id to get the item_name
          const invItem = inventoryData.find(
            (inv: GET_ALL_INVENTORY) => inv.item_id.toString() === item.item_name
          );
          return {
            item_id: invItem ? invItem.item_id : Number(item.item_name),
            quantity: item.quantity,
            rate: item.rate,
            amount: item.amount,
            item_name: invItem ? `${invItem.item_sub_category || ""} ${invItem.item_name}${invItem.size ? ` ${invItem.size}` : ""}`.trim() : item.item_name,
          };
        }),
      };

      const response = await grnApi.update(id as string, payload);

      if (response.status === 200) {
        appToast.updated("GRN Updated successfully");
        router.push("/grn");
      }
    } catch (error) {
      appToast.error(getErrorMessage(error, "Failed to update GRN"));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) return <FullPageLoader />;

  if (!canModifyGRN) {
    return <RestrictedRouteGuard />;
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-[24px] pt-0 mt-3">
      <PageTitleWithBreadcrumb
        title="Edit Goods Received Note (GRN)"
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard" },
          { title: "Edit", href: "#" },
        ]}
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium">Basic Information</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="related_po"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Related PO</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="received_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>
                        Received Date <span className="text-red-500">*</span>
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="supplier_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Supplier Name <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <SupplierCombobox
                          value={field.value}
                          onValueChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stock_location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Stock Location <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium">Payment & Invoice</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="payee_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Payee Name <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="payment_method"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Payment Method <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="CASH">CASH</SelectItem>
                            <SelectItem value="CREDIT">CREDIT</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Currency <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="LKR">LKR</SelectItem>
                            <SelectItem value="USD">USD</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="supplier_invoice_no"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Supplier Invoice No{" "}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="remarks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Remarks</FormLabel>
                      <FormControl>
                        <Textarea className="resize-none" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h3 className="text-lg font-medium">Items List</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({ item_name: "", quantity: 0, rate: 0, amount: 0 })
                }
              >
                <PlusIcon className="mr-2 h-4 w-4" /> Add Item
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {fields.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex gap-4 items-start p-4 border rounded-lg bg-muted/20 relative"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 flex-1">
                      <FormField
                        control={form.control}
                        name={`items.${index}.item_name`}
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Item Name</FormLabel>
                            <Combobox
                              items={inventoryItems}
                              value={field.value}
                              onValueChange={field.onChange}
                              placeholder="Select Item"
                              searchPlaceholder="Search item..."
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {(() => {
                        const selectedItemId = form.watch(`items.${index}.item_name`);
                        const matchedInvItem = inventoryData.find(
                          (inv) =>
                            inv.item_id.toString() === selectedItemId ||
                            inv.item_name === selectedItemId ||
                            `${inv.item_sub_category} ${inv.item_name}` === selectedItemId ||
                            `${inv.item_sub_category} ${inv.item_name} (${inv.size || ""})` === selectedItemId ||
                            `${inv.item_sub_category} ${inv.item_name} ${inv.size || ""}`.trim() === selectedItemId ||
                            `${inv.item_name} ${inv.size || ""}`.trim() === selectedItemId ||
                            `${inv.item_name} (${inv.size || ""})` === selectedItemId
                        );
                        return (
                          <FormItem>
                            <FormLabel>Unit</FormLabel>
                            <FormControl>
                              <Input value={matchedInvItem?.unit_of_measure || "-"} disabled className="bg-muted/50" />
                            </FormControl>
                          </FormItem>
                        );
                      })()}
                      <FormField
                        control={form.control}
                        name={`items.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantity</FormLabel>
                            <FormControl>
                              <Input min={0} type="number" step="any"
                                {...field}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  field.onChange(val);
                                  const rate = form.getValues(
                                    `items.${index}.rate`
                                  );
                                  form.setValue(
                                    `items.${index}.amount`,
                                    val * rate
                                  );
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`items.${index}.rate`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Rate ({selectedCurrency})</FormLabel>
                            <FormControl>
                              <Input min={0} type="number" step="any"
                                {...field}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  field.onChange(val);
                                  const qty = form.getValues(
                                    `items.${index}.quantity`
                                  );
                                  form.setValue(
                                    `items.${index}.amount`,
                                    val * qty
                                  );
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`items.${index}.amount`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Amount ({selectedCurrency})</FormLabel>
                            <FormControl>
                              <Input min={0} type="number" step="any" {...field} readOnly />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive mt-8"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <div className="flex items-center justify-end gap-[16px] mt-6">
            <Button
              size="lg"
              variant="outline"
              type="button"
              onClick={() => router.push("/grn")}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              size="lg"
              type="submit"
              className="bg-primary text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default EditGRN;
