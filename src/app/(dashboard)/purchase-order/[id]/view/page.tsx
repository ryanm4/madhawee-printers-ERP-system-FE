"use client";
import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { purchaseOrderScheme } from "@/modules/purchase-order/validation";
import { cn } from "@/lib/utils";
import { useRouter, useParams } from "next/navigation";
import { FieldPath, useFieldArray, useForm } from "react-hook-form";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Edit2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { PurchaseOrderType } from "@/config/enum";
import { useEffect, useState } from "react";
import { CustomerApi } from "@/modules/customer/api";
import { CUSTOMER } from "@/modules/customer/types";
import { QUOTATIONS } from "@/modules/quotations/types";
import { quotationApi } from "@/modules/quotations/api";
import { purchaseOrderApi } from "@/modules/purchase-order/api";


import { FullPageLoader } from "@/components/shared/loader";

type PurchaseOrderFormValues = z.infer<typeof purchaseOrderScheme>;

function ViewPurchaseOrder() {
  const router = useRouter();
  const params = useParams();
  const [customer, setCustomer] = useState<CUSTOMER[]>([]);
  const [quotationList, setQuotationList] = useState<QUOTATIONS[]>([]);
  const [loading, setLoading] = useState(false);

  const id = params.id as string;
  useEffect(() => {
    getCustomerList();
    getQuotationList();
  }, []);

  const getCustomerList = async () => {
    try {
      setLoading(true);
      const response = await CustomerApi.getAll();
      setCustomer(response.data);
    } catch (error) {
      console.error("Failed to fetch customers");
    } finally {
      setLoading(false);
    }
  };

  const getQuotationList = async () => {
    try {
      setLoading(true);
      const response = await quotationApi.getAll();
      setQuotationList(response.data);
    } catch (error) {
      console.error("Failed to fetch quotations");
    } finally {
      setLoading(false);
    }
  };

  const baseDefaultValues: PurchaseOrderFormValues = {
    customer: "",
    customerAddress: "",
    customerEmail: "",
    customerPhone: "",
    customer_po: "",
    quotationId: "",
    tceprNo: "",
    purchaseOrderType: PurchaseOrderType.TIEP,
    batchRef: "",
    salesRef: "",
    poDate: new Date(),
    itemDetails: [
      { itemCode: "", description: "", quantity: "", unit: 0, price: "" },
    ],
  };

  const form = useForm<PurchaseOrderFormValues>({
    resolver: zodResolver(purchaseOrderScheme),
    defaultValues: baseDefaultValues,
  });

  const {
    fields: itemDetailsFields,
    append: appendItemDetails,
    remove: removeItemDetails,
  } = useFieldArray({
    control: form.control,
    name: "itemDetails",
  });

  async function onSubmit(data: PurchaseOrderFormValues) {
    // This is a view page, onSubmit won't be called, but we keep it for form compatibility
  }

  // Helper to render FormField with correct typing
  const renderFormField = <TName extends FieldPath<PurchaseOrderFormValues>>(
    name: TName,
    render: Parameters<
      typeof FormField<PurchaseOrderFormValues, TName>
    >["0"]["render"]
  ) => <FormField control={form.control} name={name} render={render} />;

  useEffect(() => {
    const fetchPurchaseOrder = async () => {
      try {
        setLoading(true); 3

        const response = await purchaseOrderApi.getById(id);
        if (response.status === 200) {
          const poData = response.data;

          form.reset({
            customer: String(poData.customer.customer_id),
            customerPhone: poData.customer.phone,
            customerAddress: poData.customer.address,
            customerEmail: poData.customer.email,
            customer_po: String(poData.customer_po),
            quotationId: String(poData.quote_id),
            tceprNo: poData.TC_E_PR_No,
            purchaseOrderType: poData.po_type_id as PurchaseOrderType,
            batchRef: poData.batch_ref,
            salesRef: poData.sales_ref || "",
            poDate: new Date(poData.po_date),
            itemDetails: poData.po_items.map((item) => ({
              itemCode: item.item_code,
              description: item.description,
              quantity: String(item.quantity),
              unit: Number(item.uom),
              price: String(item.price),
            })),
          });
        }
      } catch (err) {
        console.error("Failed to fetch purchase order:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPurchaseOrder();
    }
  }, [id, form]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-[24px] pt-0 mt-3">
      {loading && <FullPageLoader />}
      <PageTitleWithBreadcrumb
        title="View Purchase Order"
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard" },
          { title: "Purchase Order Management", href: "/purchase-order" },
        ]}
      />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6  pb-0"
        >
          <div className="flex items-center justify-end gap-[16px] sm:justify-end w-full mt-6">
            <Button
              size="lg"
              variant="outline"
              type="button"
              onClick={() => router.push("/purchase-order")}
            >
              Back to List
            </Button>
            <Button
              size="lg"
              type="button"
              className="bg-primary hover:bg-primary/90"
              onClick={() => router.push(`/purchase-order/${id}/edit`)}
            >
              <Edit2 className="mr-2 h-4 w-4" /> Edit Purchase Order
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
            <Card
              className={cn(
                "w-full shadow-sm hover:shadow-md transition-shadow flex flex-col"
              )}
            >
              <CardHeader className="flex flex-col gap-[0.5px]">
                <h3 className="text-md font-medium mb-2">Customer</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  View customer details
                </p>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {renderFormField("customer", ({ field }) => (
                  <FormItem>
                    <FormLabel>Customer</FormLabel>
                    <Select value={field.value} disabled={true}>
                      <FormControl>
                        <SelectTrigger className="w-full disabled:opacity-100 disabled:text-black disabled:cursor-default">
                          <SelectValue placeholder="Select Customer" />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent>
                        {customer.map((cust) => (
                          <SelectItem
                            key={cust.customer_id}
                            value={String(cust.customer_id)}
                          >
                            {cust.company_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                ))}
                {renderFormField("customerPhone", ({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Phone</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter Customer Phone"
                        {...field}
                        disabled={true}
                        className="disabled:opacity-100 disabled:text-black disabled:cursor-default"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                ))}
                {renderFormField("customerAddress", ({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Address</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter Customer Address"
                        className="resize-none disabled:opacity-100 disabled:text-black disabled:cursor-default"
                        {...field}
                        disabled={true}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                ))}
                {renderFormField("customerEmail", ({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter Customer e-mail address..."
                        {...field}
                        disabled={true}
                        className="disabled:opacity-100 disabled:text-black disabled:cursor-default"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                ))}
              </CardContent>
            </Card>
            <Card
              className={cn(
                "w-full shadow-sm hover:shadow-md transition-shadow flex flex-col"
              )}
            >
              <CardHeader className="flex flex-col gap-[0.5px]">
                <h3 className="text-md font-medium mb-2">Purchase Order</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  View purchase order details
                </p>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {renderFormField("customer_po", ({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Purchase Order No <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter Purchase Order No"
                        {...field}
                        disabled={true}
                        className="disabled:opacity-100 disabled:text-black disabled:cursor-default"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                ))}

                {renderFormField("quotationId", ({ field }) => (
                  <FormItem>
                    <FormLabel>Quotation No</FormLabel>
                    <Select value={field.value} disabled={true}>
                      <FormControl>
                        <SelectTrigger className="w-full disabled:opacity-100 disabled:text-black disabled:cursor-default">
                          <SelectValue placeholder="Select a Quotation" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {quotationList.map(
                          (quote: QUOTATIONS, index: number) => (
                            <SelectItem
                              key={quote.quote_id || index}
                              value={String(quote.quote_id)}
                            >
                              {quote.quote_id}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                ))}

                <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                  {renderFormField("purchaseOrderType", ({ field }) => {
                    const poTypeLabels: Record<PurchaseOrderType, string> = {
                      [PurchaseOrderType.TIEP]: "TIEP",
                      [PurchaseOrderType.NON_TIEP]: "NON-TIEP",
                      [PurchaseOrderType.MP]: "MP",
                    };
                    return (
                      <FormItem>
                        <FormLabel>
                          Purchase Order Type{" "}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <RadioGroup
                          value={String(field.value)}
                          className="flex gap-4"
                          disabled={true}
                        >
                          {Object.values(PurchaseOrderType)
                            .filter(
                              (v): v is PurchaseOrderType =>
                                typeof v === "number"
                            )
                            .map((type) => (
                              <div
                                key={type}
                                className="flex items-center gap-2"
                              >
                                <RadioGroupItem
                                  value={String(type)}
                                  id={String(type)}
                                  className="disabled:opacity-100 text-black"
                                />
                                <Label
                                  htmlFor={String(type)}
                                  className="disabled:opacity-100 disabled:text-black disabled:cursor-default"
                                >
                                  {poTypeLabels[type]}
                                </Label>
                              </div>
                            ))}
                        </RadioGroup>
                        <FormMessage />
                      </FormItem>
                    );
                  })}
                  {renderFormField("tceprNo", ({ field }) => (
                    <FormItem>
                      <FormLabel>TC/E/PR/No</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter TC/E/PR/No"
                          {...field}
                          disabled={true}
                          className="disabled:opacity-100 disabled:text-black disabled:cursor-default"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  ))}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                  {renderFormField("batchRef", ({ field }) => (
                    <FormItem>
                      <FormLabel>Batch Ref</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter Batch Ref"
                          {...field}
                          disabled={true}
                          className="disabled:opacity-100 disabled:text-black disabled:cursor-default"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  ))}
                  {renderFormField("salesRef", ({ field }) => (
                    <FormItem>
                      <FormLabel>Sales Ref</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter Sales Ref"
                          {...field}
                          disabled={true}
                          className="disabled:opacity-100 disabled:text-black disabled:cursor-default"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  ))}
                </div>

                {renderFormField("poDate", ({ field }) => (
                  <FormItem>
                    <FormLabel>
                      PO Date <span className="text-red-500">*</span>
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal disabled:opacity-100 disabled:text-black disabled:cursor-default",
                              !field.value && "text-muted-foreground"
                            )}
                            disabled={true}
                          >
                            {field.value
                              ? format(field.value, "PPP")
                              : format(new Date(), "PPP")}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          captionLayout="dropdown"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card
            className={cn(
              "w-full shadow-sm hover:shadow-md transition-shadow flex flex-col"
            )}
          >
            <CardHeader className="flex flex-col gap-[0.5px]">
              <h3 className="text-md font-medium mb-2">Item Details</h3>
              <p className="text-xs text-muted-foreground mb-4">
                View Item Details
              </p>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div>
                {itemDetailsFields.map((item, index) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-[1fr_auto] gap-2 mb-2 items-start"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 flex-1">
                      {renderFormField(
                        `itemDetails.${index}.itemCode`,
                        ({ field }) => (
                          <FormItem>
                            <FormLabel>Item Code</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter Item Code"
                                {...field}
                                disabled={true}
                                className="disabled:opacity-100 disabled:text-black disabled:cursor-default"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )
                      )}
                      {renderFormField(
                        `itemDetails.${index}.description`,
                        ({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Description{" "}
                              <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter Description"
                                {...field}
                                disabled={true}
                                className="disabled:opacity-100 disabled:text-black disabled:cursor-default"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )
                      )}
                      {renderFormField(
                        `itemDetails.${index}.quantity`,
                        ({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Quantity <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Enter Quantity"
                                value={field.value}
                                onChange={(e) => field.onChange(e.target.value)}
                                onBlur={field.onBlur}
                                name={field.name}
                                ref={field.ref}
                                disabled={true}
                                className="disabled:opacity-100 disabled:text-black disabled:cursor-default"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )
                      )}
                      {renderFormField(
                        `itemDetails.${index}.unit`,
                        ({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Unit <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter Unit"
                                {...field}
                                disabled={true}
                                className="disabled:opacity-100 disabled:text-black disabled:cursor-default"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )
                      )}
                      {renderFormField(
                        `itemDetails.${index}.price`,
                        ({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Price <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Enter Price"
                                value={field.value}
                                onChange={(e) => field.onChange(e.target.value)}
                                onBlur={field.onBlur}
                                name={field.name}
                                ref={field.ref}
                                disabled={true}
                                className="disabled:opacity-100 disabled:text-black disabled:cursor-default"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )
                      )}
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

export default ViewPurchaseOrder;
