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
import { CalendarIcon, Edit } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format, parseISO } from "date-fns";
import { useEffect, useState } from "react";
import { grnApi } from "@/modules/grn/api";
import { toast } from "sonner";
import { FullPageLoader } from "@/components/shared/loader";
import { GRNItem } from "@/modules/grn/types";
import { useCallback } from "react";

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

function ViewGRN() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);

  const form = useForm<GRNFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(grnSchema) as any,
    defaultValues: {
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
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "items",
  });


  const fetchGRN = useCallback(async () => {
    try {
      setLoading(true);
      const response = await grnApi.getById(id as string);
      if (response.status === 200) {
        const data = response.data;
        form.reset({
          releated_po: data.releated_po,
          received_date: parseISO(data.received_date),
          supplier_name: data.supplier_name,
          stock_location: data.stock_location,
          payee_name: data.payee_name,
          payment_method: (data.payment_method === "CARD" || data.payment_method === "CASH") ? data.payment_method : "CASH",
          currency: data.currency,
          supplier_invoice_no: data.supplier_invoice_no,
          remarks: data.remarks || "",
          items: data.items.map((item: GRNItem) => ({
            item_name: item.item_name,
            quantity: Number(item.quantity),
            rate: Number(item.rate),
            amount: Number(item.amount)
          }))
        });
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to fetch GRN details"));
      router.push("/grn");
    } finally {
      setLoading(false);
    }
  }, [id, form, router]);
  useEffect(() => {
    if (id) {
      fetchGRN();
    }
  }, [id, fetchGRN]);
  const readonlyClass = "disabled:opacity-100 disabled:text-black disabled:cursor-default bg-muted/50";

  if (loading) return <FullPageLoader />;

  return (
    <div className="flex flex-1 flex-col gap-4 p-[24px] pt-0 mt-3">
      <PageTitleWithBreadcrumb
        title="View Goods Received Note (GRN)"
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard" },
          { title: "View", href: "#" },
        ]}
      />

      <Form {...form}>
        <form className="space-y-6">
          <div className="flex items-center justify-end gap-3 w-full mt-6">
            <Button
              variant="outline"
              type="button"
              onClick={() => router.push("/grn")}
            >
              Back to List
            </Button>
            <Button
              type="button"
              onClick={() => router.push(`/grn/${id}/edit`)}
              className="bg-primary hover:bg-primary/90"
            >
              <Edit className="mr-2 h-4 w-4" /> Edit GRN
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium">Basic Information</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="releated_po"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Related PO</FormLabel>
                      <FormControl>
                        <Input {...field} disabled className={readonlyClass} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="received_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Received Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn("w-full pl-3 text-left font-normal", readonlyClass)}
                              disabled
                            >
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value} initialFocus disabled />
                        </PopoverContent>
                      </Popover>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="supplier_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplier Name</FormLabel>
                      <FormControl>
                        <Input {...field} disabled className={readonlyClass} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stock_location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock Location</FormLabel>
                      <FormControl>
                        <Input {...field} disabled className={readonlyClass} />
                      </FormControl>
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
                      <FormLabel>Payee Name</FormLabel>
                      <FormControl>
                        <Input {...field} disabled className={readonlyClass} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="payment_method"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Method</FormLabel>
                        <Select value={field.value} disabled>
                          <FormControl>
                            <SelectTrigger className={readonlyClass}>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="CASH">CASH</SelectItem>
                            <SelectItem value="CARD">CARD</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <FormControl>
                          <Input {...field} disabled className={readonlyClass} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="supplier_invoice_no"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplier Invoice No</FormLabel>
                      <FormControl>
                        <Input {...field} disabled className={readonlyClass} />
                      </FormControl>
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
                        <Textarea className={cn("resize-none", readonlyClass)} {...field} disabled />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h3 className="text-lg font-medium">Items List</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {fields.map((item, index) => (
                  <div key={item.id} className="flex gap-4 items-start p-4 border rounded-lg bg-muted/10 relative">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
                      <FormField
                        control={form.control}
                        name={`items.${index}.item_name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Item Name</FormLabel>
                            <FormControl><Input {...field} disabled className={readonlyClass} /></FormControl>
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
                              <Input type="number" {...field} disabled className={readonlyClass} />
                            </FormControl>
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
                              <Input type="number" {...field} disabled className={readonlyClass} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`items.${index}.amount`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Amount</FormLabel>
                            <FormControl><Input type="number" {...field} disabled className={readonlyClass} /></FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}

export default ViewGRN;
