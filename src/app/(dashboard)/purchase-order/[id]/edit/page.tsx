"use client";
import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb";
import { getErrorMessage } from "@/lib/error-utils";
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
import { CalendarIcon, Edit2, Loader2, PlusIcon, Trash2 } from "lucide-react";
import { FullPageLoader } from "@/components/shared/loader";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { PurchaseOrderStatus, PurchaseOrderType } from "@/config/enum";
import { useEffect, useState } from "react";
import { CustomerApi } from "@/modules/customer/api";
import { CUSTOMER } from "@/modules/customer/types";
import { QUOTATIONS } from "@/modules/quotations/types";
import { quotationApi } from "@/modules/quotations/api";
import { purchaseOrderApi } from "@/modules/purchase-order/api";
import { toast } from "sonner";
import {
  CREATE_PURCHASE_ORDER,
  PURCHASE_ORDER,
} from "@/modules/purchase-order/types";
import { Combobox } from "@/components/shared/combobox";
import { getUser } from "@/lib/auth";

type PurchaseOrderFormValues = z.infer<typeof purchaseOrderScheme>;

function EditPurchaseOrder() {
  const router = useRouter();
  const params = useParams();
  const [customer, setCustomer] = useState<CUSTOMER[]>([]);
  const [quotationList, setQuotationList] = useState<QUOTATIONS[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<{
    name: string;
    email: string;
    avatar: string;
  } | null>(null);
  const id = params.id as string;
  useEffect(() => {
    getCustomerList();
    getQuotationList();
    const userData = getUser();
    if (userData) {
      setUser({
        name: userData.name || "User",
        email: userData.email,
        avatar: "",
      });
    }
  }, [id]);

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
    currency: "LKR",
    itemDetails: [
      { itemCode: "", description: "", quantity: "", unit: "", price: "" },
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
    try {
      setIsSubmitting(true);

      const poTypeMap: Record<PurchaseOrderType, number> = {
        [PurchaseOrderType.TIEP]: 1,
        [PurchaseOrderType.NON_TIEP]: 2,
        [PurchaseOrderType.MP]: 3,
      };
      const formatDate = (date: Date) => {
        return date.toISOString().split("T")[0]; // "YYYY-MM-DD" format
      };

      const payload: CREATE_PURCHASE_ORDER = {
        quote_id: data.quotationId ? parseInt(data.quotationId) : 0,
        customer_id: data.customer ? parseInt(data.customer) : 0,
        po_type_id: poTypeMap[data.purchaseOrderType] || 1,
        batch_ref: data.batchRef,
        sales_ref: data.salesRef,
        po_date:
          data.poDate instanceof Date ? formatDate(data.poDate) : data.poDate,
        TC_E_PR_No: data.tceprNo,
        updated_on: new Date(),
        updated_by: user?.name || "User",
        status: PurchaseOrderStatus.CREATED,
        customer_po: data.customer_po,
        currency: data.currency,
        po_items: data.itemDetails.map((item: any) => ({
          item_code: item.itemCode,
          description: item.description,
          quantity: String(item.quantity),
          uom: item.unit,
          price: String(item.price),
        })),
      };

      const response = await purchaseOrderApi.update(Number(id), payload);

      toast("Purchase Order Updated", {
        description: `Purchase Order ${data.customer_po} has been updated successfully.`,
      });

      form.reset(baseDefaultValues);
      form.clearErrors();

      // Navigate to purchase order list
      router.push("/purchase-order");
    } catch (error) {
      console.error("Failed to submit PO:", error);
      toast("Failed to Update Purchase Order", {
        description: getErrorMessage(error, "An error occurred while updating the purchase order. Please try again."),
      });
    } finally {
      setIsSubmitting(false);
    }
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
        setLoading(true);
        const response = await purchaseOrderApi.getById(id);
        if (response.status === 200) {
          const poData = response.data;

          form.reset({
            customer: String(poData.customer.customer_id),
            customerPhone: poData.customer.phone,
            customerAddress: poData.customer.address,
            customerEmail: poData.customer.email,
            customer_po: String(poData.customer_po), // Assuming po_id maps to purchaseOrderNo or similar
            quotationId: String(poData.quote_id),
            tceprNo: poData.TC_E_PR_No,
            purchaseOrderType: poData.po_type_id as PurchaseOrderType,
            batchRef: poData.batch_ref,
            salesRef: (poData as any).sales_ref || "",
            poDate: new Date(poData.po_date),
            currency: (poData as any).currency || "LKR",
            itemDetails: poData.po_items.map((item) => ({
              itemCode: item.item_code,
              description: item.description,
              quantity: String(item.quantity),
              unit: item.uom,
              price: String(item.price),
            })),
          });
        }
      } catch (err) {
        console.error("Failed to fetch purchase order:", err);
        toast(getErrorMessage(err, "Failed to load purchase order data"));
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
        title="Edit Purchase Order Management"
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

          <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
            <Card
              className={cn(
                "w-full   shadow-sm hover:shadow-md transition-shadow flex flex-col"
              )}
            >
              <CardHeader className="flex flex-col gap-[0.5px]">
                <h3 className="text-md font-medium mb-2">Customer</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Add your customer details here
                </p>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {renderFormField("customer", ({ field }) => (
                  <FormItem>
                    <FormLabel>Customer</FormLabel>
                    <Combobox
                      items={customer.map((c) => ({
                        value: String(c.customer_id),
                        label: c.company_name,
                      }))}
                      value={field.value || ""}
                      onValueChange={(value) => {
                        field.onChange(value);

                        const selectedCustomer = customer.find(
                          (c) => String(c.customer_id) === value
                        );

                        if (selectedCustomer) {
                          form.setValue(
                            "customerAddress",
                            selectedCustomer.address
                          );
                          form.setValue(
                            "customerPhone",
                            selectedCustomer.phone
                          );
                          form.setValue(
                            "customerEmail",
                            selectedCustomer.email
                          );
                        }
                      }}
                      placeholder="Select Customer"
                      searchPlaceholder="Search customer..."
                    />
                    <FormMessage />
                  </FormItem>
                ))}
                {renderFormField("customerPhone", ({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Customer Phone" {...field} />
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
                        className="resize-none"
                        {...field}
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
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                ))}
              </CardContent>
            </Card>
            <Card
              className={cn(
                "w-full   shadow-sm hover:shadow-md transition-shadow flex flex-col"
              )}
            >
              <CardHeader className="flex flex-col gap-[0.5px]">
                <h3 className="text-md font-medium mb-2">Purchase Order</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Add your purchase order details here
                </p>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {renderFormField("customer_po", ({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Purchase Order No <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Purchase Order No" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                ))}

                {renderFormField("quotationId", ({ field }) => (
                  <FormItem>
                    <FormLabel>Quotation No</FormLabel>
                    <Combobox
                      items={quotationList.map((quote) => ({
                        value: String(quote.quote_id),
                        label: String(quote.quote_id),
                      }))}
                      value={field.value || ""}
                      onValueChange={field.onChange}
                      placeholder="Select a Quotation"
                      searchPlaceholder="Search quotation..."
                    />
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
                          onValueChange={(val) =>
                            field.onChange(Number(val) as PurchaseOrderType)
                          }
                          className="flex gap-4"
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
                                />
                                <Label htmlFor={String(type)}>
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
                        <Input placeholder="Enter TC/E/PR/No" {...field} />
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
                        <Input placeholder="Enter Batch Ref" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  ))}
                  {renderFormField("salesRef", ({ field }) => (
                    <FormItem>
                      <FormLabel>Sales Ref</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter Sales Ref" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  ))}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
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
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
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

                  {renderFormField("currency", ({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="LKR">🇱🇰 LKR</SelectItem>
                          <SelectItem value="USD">🇺🇸 USD</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  ))}
                </div>

              </CardContent>
            </Card>
          </div>

          <Card
            className={cn(
              "w-full   shadow-sm hover:shadow-md transition-shadow flex flex-col"
            )}
          >
            <CardHeader className="flex flex-col gap-[0.5px]">
              <h3 className="text-md font-medium mb-2">Item Details</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Add your Item Details here
              </p>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    appendItemDetails({
                      itemCode: "",
                      description: "",
                      quantity: "",
                      unit: "",
                      price: "",
                    })
                  }
                >
                  <PlusIcon />
                  Add More
                </Button>
              </div>
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
                              <Input placeholder="Enter Item Code" {...field} />
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
                                onChange={(e) =>
                                  field.onChange(e.target.value)
                                }
                                onBlur={field.onBlur}
                                name={field.name}
                                ref={field.ref}
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
                              <Input placeholder="Enter Unit" {...field} />
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
                                onChange={(e) =>
                                  field.onChange(e.target.value)
                                }
                                onBlur={field.onBlur}
                                name={field.name}
                                ref={field.ref}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )
                      )}
                    </div>
                    <div className="flex space-x-2 items-start pt-5">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => { }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => removeItemDetails(index)}
                        disabled={itemDetailsFields.length <= 1} // Disable if only one item
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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

export default EditPurchaseOrder;
