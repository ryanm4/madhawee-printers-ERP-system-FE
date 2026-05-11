"use client";
import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb";
import { getErrorMessage } from "@/lib/error-utils";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { grnSchema } from "@/modules/grn/validation";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
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
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { grnApi } from "@/modules/grn/api";
import { appToast } from "@/lib/toast-utils";
import { getUser } from "@/lib/auth";
import { SupplierCombobox } from "../_components/supplier-combobox";
import { FullPageLoader } from "@/components/shared/loader";
import { inventoryApi } from "@/modules/inventory/api";
import { Combobox } from "@/components/shared/combobox";
import { GET_ALL_INVENTORY } from "@/modules/inventory/types";

type GRNFormValues = {
  releated_po: string;
  received_date: Date;
  supplier_name: string;
  stock_location: string;
  payee_name?: string;
  payment_method: "CASH" | "CARD";
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

function CreateGRN() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<{ name: string } | null>(null);

  const [inventoryItems, setInventoryItems] = useState<
    { value: string; label: string }[]
  >([]);

  useEffect(() => {
    const userData = getUser();
    if (userData) {
      setUser({ name: userData.name || "User" });
    }

    const fetchInventory = async () => {
      try {
        const response = await inventoryApi.getAll();
        if (response.status === 200) {
          const uniqueItems = Array.from(
            new Map(
              response.data.map((item: GET_ALL_INVENTORY) => [`${item.item_name}-${item.size || ""}`, item])
            ).values()
          );

          setInventoryItems(
            uniqueItems.map((item: GET_ALL_INVENTORY) => ({
              value: item.item_name,
              label: item.size
                ? `${item.item_name} (${item.size})`
                : item.item_name,
            }))
          );
        }
      } catch (error) {
        console.error("Failed to fetch inventory items", error);
      }
    };
    fetchInventory();
  }, []);

  const defaultValues: GRNFormValues = {
    releated_po: "",
    received_date: new Date(),
    supplier_name: "",
    stock_location: "Main Warehouse",
    payee_name: "",
    payment_method: "CASH",
    currency: "LKR",
    supplier_invoice_no: "",
    remarks: "",
    items: [{ item_name: "", quantity: 0, rate: 0, amount: 0 }],
  };

  const form = useForm<GRNFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(grnSchema) as any,
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  async function onSubmit(values: GRNFormValues) {
    try {
      setIsSubmitting(true);

      const payload = {
        ...values,
        received_date: format(values.received_date, "yyyy-MM-dd HH:mm:ss"),
        created_by: user?.name || "User",
      };

      const response = await grnApi.create(payload);

      if (response.status === 201 || response.status === 200) {
        appToast.success("GRN Created successfully");
        router.push("/grn");
      }
    } catch (error) {
      console.error("Failed to create GRN:", error);
      appToast.error(getErrorMessage(error, "Failed to create GRN"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-[24px] pt-0 mt-3">
      {isSubmitting && <FullPageLoader />}
      <PageTitleWithBreadcrumb
        title="Create Goods Received Note (GRN)"
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard" },

        ]}
      />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
        >


          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium">Basic Information</h3>
                <p className="text-sm text-muted-foreground">
                  General details of the GRN
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="releated_po"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Related PO <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter PO Number" {...field} />
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
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
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
                        <Input placeholder="Enter Stock Location" {...field} />
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
                <p className="text-sm text-muted-foreground">
                  Financial and tracking details
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="payee_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Payee Name
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter Payee Name" {...field} />
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
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select method" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="CASH">CASH</SelectItem>
                            <SelectItem value="CARD">CARD</SelectItem>
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
                        <FormControl>
                          <Input placeholder="LKR" {...field} />
                        </FormControl>
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
                        <Input placeholder="Enter Invoice Number" {...field} />
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
                        <Textarea
                          placeholder="Enter any notes"
                          className="resize-none"
                          {...field}
                        />
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
              <div>
                <h3 className="text-lg font-medium">Items List</h3>
                <p className="text-sm text-muted-foreground">
                  Add items received in this GRN
                </p>
              </div>
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
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
                      <FormField
                        control={form.control}
                        name={`items.${index}.item_name`}
                        render={({ field }) => (
                          <FormItem className="flex flex-col ">
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
                      <FormField
                        control={form.control}
                        name={`items.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantity</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="0"
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
                            <FormLabel>Rate</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="0.00"
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
                            <FormLabel>Amount</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="0.00"
                                {...field}
                                readOnly
                              />
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
                  Creating...
                </>
              ) : (
                "Create"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default CreateGRN;
