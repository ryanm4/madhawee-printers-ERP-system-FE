"use client";
import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb";
import { getErrorMessage } from "@/lib/error-utils";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { createQuotationSchema } from "@/modules/quotations/validation";
import { cn } from "@/lib/utils";
import { useParams, useRouter } from "next/navigation";
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
import { CalendarIcon, Check, Loader2, PlusIcon, Trash2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { CustomerApi } from "@/modules/customer/api";
import { CUSTOMER } from "@/modules/customer/types";
import { quotationApi } from "@/modules/quotations/api";
import { toast } from "sonner";
import {
  CREATE_QUOTATION_REQUEST,
  UPDATE_QUOTATION_REQUEST,
} from "@/modules/quotations/types";
import { Combobox } from "@/components/shared/combobox";
import { Checkbox } from "@/components/ui/checkbox";
import {
  QuotationType,
  QuotationTaxType,
  QuotationStatus,
} from "@/config/enum";
import { getUser } from "@/lib/auth";
import { FullPageLoader } from "@/components/shared/loader";

type QuotationFormValues = z.infer<typeof createQuotationSchema>;

function EditQuotation({
  user: initialUser,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}) {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [user, setUser] = useState<{
    name: string;
    email: string;
    avatar: string;
  }>(initialUser);
  const [customer, setCustomer] = useState<CUSTOMER[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quoteDate, setQuoteDate] = useState<Date>(new Date());
  const [showAccountDetails, setShowAccountDetails] = useState(false);

  useEffect(() => {
    getCustomerList();
  }, []);

  const getCustomerList = async () => {
    try {
      setLoading(true);
      const response = await CustomerApi.getAll();
      setCustomer(response.data);
    } catch (error) {
      console.error("Failed to fetch customers", error);
      toast(getErrorMessage(error, "Failed to load customers"));
    } finally {
      setLoading(false);
    }
  };

  const baseDefaultValues: Partial<QuotationFormValues> = {
    customer_id: 0,
    type_id: QuotationType.NORMAL,
    delivery_days: "",
    tax_type_id: QuotationTaxType.NONE,
    currency: "LKR",
    contact_person: "",
    notes: "",
    status: QuotationStatus.PENDING,
    sub_total: "0",
    no_of_items: "0",
    total_without_tax: "0",
    net_total: "0",
    created_by: user?.name || "",
    updated_by: user?.name || "",
    items: [
      {
        item_id: 0,
        item_category: "",
        item_qty: "0",
        item_description: "",
        item_unit_price: "0",
        item_unit_discount: "0",
        item_total_price: "0",
      },
    ],
  };

  const form = useForm<QuotationFormValues>({
    resolver: zodResolver(createQuotationSchema),
    defaultValues: baseDefaultValues as any,
  });

  useEffect(() => {
    const userData = getUser();
    if (userData) {
      const name = userData.name || "User";
      setUser({
        name: name,
        email: userData.email,
        avatar: "", // GET_ALL_USER doesn't have avatar
      });
      form.setValue("created_by", name);
      form.setValue("updated_by", name);
    }
  }, [form]);

  const {
    fields: itemFields,
    append: appendItem,
    remove: removeItem,
  } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchTaxType = form.watch("tax_type_id");

  // Helper to calculate totals
  const calculateTotals = (currentItems: any[], taxTypeId: number) => {
    let subTotal = 0;
    const updatedItems = currentItems.map((item) => {
      const qty = parseFloat(item.item_qty || "0");
      const price = parseFloat(item.item_unit_price || "0");
      const total = qty * price;
      subTotal += total;
      return {
        ...item,
        item_total_price: total.toFixed(2),
      };
    });

    // Calculate net total based on tax type
    let netTotal = subTotal;
    if (taxTypeId === QuotationTaxType.VAT) {
      // VAT
      netTotal = subTotal * 1.15;
    }

    return {
      subTotal: subTotal.toFixed(2),
      netTotal: netTotal.toFixed(2),
      noOfItems: String(currentItems.length),
      totalWithoutTax: subTotal.toFixed(2),
    };
  };

  // Handle tax type change with recalculation
  const handleTaxTypeChange = (value: number) => {
    form.setValue("tax_type_id", value);
    const currentItems = form.getValues("items");
    const totals = calculateTotals(currentItems, value);

    form.setValue("sub_total", totals.subTotal);
    form.setValue("net_total", totals.netTotal);
  };

  // Synchronize totals whenever items array structure changes
  useEffect(() => {
    const currentItems = form.getValues("items");
    const currentTaxType = form.getValues("tax_type_id");
    const totals = calculateTotals(currentItems, currentTaxType);

    form.setValue("sub_total", totals.subTotal);
    form.setValue("no_of_items", totals.noOfItems);
    form.setValue("total_without_tax", totals.totalWithoutTax);
    form.setValue("net_total", totals.netTotal);
  }, [itemFields.length, watchTaxType]); // Trigger on length change or tax type change

  // Handle item change with recalculation
  const handleItemChange = (
    index: number,
    field: "item_qty" | "item_unit_price",
    value: string
  ) => {
    // Strip leading zeros unless it's just "0"
    let sanitizedValue = value.replace(/^0+(?!$)/, "");
    if (sanitizedValue === "" && value !== "") sanitizedValue = "0";

    form.setValue(`items.${index}.${field}`, sanitizedValue);

    // Calculate row total immediately
    const qty = parseFloat(
      field === "item_qty"
        ? sanitizedValue
        : form.getValues(`items.${index}.item_qty`) || "0"
    );
    const price = parseFloat(
      field === "item_unit_price"
        ? sanitizedValue
        : form.getValues(`items.${index}.item_unit_price`) || "0"
    );
    const rowTotal = (qty * price).toFixed(2);
    form.setValue(`items.${index}.item_total_price`, rowTotal);

    // Recalculate global totals
    const currentItems = form.getValues("items");
    const currentTaxType = form.getValues("tax_type_id");
    const totals = calculateTotals(currentItems, currentTaxType);

    form.setValue("sub_total", totals.subTotal);
    form.setValue("no_of_items", totals.noOfItems);
    form.setValue("total_without_tax", totals.totalWithoutTax);
    form.setValue("net_total", totals.netTotal);
  };

  async function onSubmit(data: QuotationFormValues) {
    try {
      setIsSubmitting(true);

      const payload: UPDATE_QUOTATION_REQUEST = {
        quote_id: parseInt(id),
        customer_id: data.customer_id,
        type_id: data.type_id,
        delivery_days: data.delivery_days,
        tax_type_id: data.tax_type_id,
        currency: data.currency,
        contact_person: data.contact_person,
        notes: data.notes || "",
        status: data.status,
        sub_total: data.sub_total,
        no_of_items: data.no_of_items,
        total_without_tax: data.total_without_tax,
        net_total: data.net_total,
        updated_by: user?.name || "admin",
        updated_on: new Date(),
        items: data.items.map((item) => ({
          item_id: item.item_id,
          item_category: item.item_category,
          item_qty: item.item_qty,
          item_description: item.item_description,
          item_unit_price: item.item_unit_price,
          item_unit_discount: item.item_unit_discount || "0",
          item_total_price: item.item_total_price,
        })),
      };

      const response = await quotationApi.update(id, payload);

      toast("Quotation Updated", {
        description: `Quotation has been updated successfully.`,
      });

      form.reset(baseDefaultValues as any);
      form.clearErrors();

      router.push("/quotation-management");
    } catch (error) {
      console.error("Failed to submit quotation:", error);
      toast("Failed to Update Quotation", {
        description: getErrorMessage(error, "An error occurred while updating the quotation. Please try again."),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const renderFormField = <TName extends FieldPath<QuotationFormValues>>(
    name: TName,
    render: Parameters<
      typeof FormField<QuotationFormValues, TName>
    >[0]["render"]
  ) => <FormField control={form.control} name={name} render={render} />;

  useEffect(() => {
    const fetchQuotation = async () => {
      try {
        setLoading(true);
        const response = await quotationApi.getById(id);
        if (response.status === 200) {
          const quoteData = response.data;

          form.reset({
            customer_id: quoteData.customer_id,
            type_id: quoteData.type_id,
            delivery_days: quoteData.delivery_days,
            tax_type_id: quoteData.tax_type_id,
            currency: quoteData.currency,
            contact_person: quoteData.contact_person,
            notes: quoteData.notes || "",
            status: quoteData.status,
            sub_total: quoteData.sub_total,
            no_of_items: quoteData.no_of_items,
            total_without_tax: quoteData.total_without_tax,
            net_total: quoteData.net_total,
            created_by: quoteData.created_by,
            updated_by: user?.name || quoteData.updated_by,
            items:
              (quoteData as any).items?.map((item: any) => ({
                item_id: item.item_id,
                item_category: item.item_category,
                item_qty: String(item.item_qty),
                item_description: item.item_description || "",
                item_unit_price: item.item_unit_price,
                item_unit_discount: item.item_unit_discount || "0",
                item_total_price: item.item_total_price,
              })) || [],
          });
          setQuoteDate(new Date(quoteData.created_on));
        }
      } catch (err) {
        console.error("Failed to fetch quotation:", err);
        toast(getErrorMessage(err, "Failed to load quotation data"));
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchQuotation();
    }
  }, [id, form]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-[24px] pt-0 mt-3">
      {loading && <FullPageLoader />}
      <PageTitleWithBreadcrumb
        title="Edit Quotation"
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard" },
          { title: "Quotation Management", href: "/quotation-management" },
        ]}
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-0">
          <div className="flex items-center justify-end gap-[16px] sm:justify-end w-full mt-6">
            <Button
              size="lg"
              variant="outline"
              type="button"
              onClick={() => router.push("/quotation-management")}
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
                "Update Quotation"
              )}
            </Button>
          </div>

          {/* Card 1: Customer Selection */}
          <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
            <Card
              className={cn(
                "w-full shadow-sm hover:shadow-md transition-shadow flex flex-col"
              )}
            >
              <CardHeader className="flex flex-col gap-[0.5px]">
                <h3 className="text-md font-medium mb-2">Customer Details</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Select customer and enter details
                </p>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Quote Date */}
                  <FormItem>
                    <FormLabel>Quote Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn("w-full pl-3 text-left font-normal")}
                          >
                            {quoteDate
                              ? format(quoteDate, "PPP")
                              : format(new Date(), "PPP")}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={quoteDate}
                          onSelect={(date) => date && setQuoteDate(date)}
                          captionLayout="dropdown"
                        />
                      </PopoverContent>
                    </Popover>
                  </FormItem>

                  {/* Customer */}
                  {renderFormField("customer_id", ({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Customer (Company){" "}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <Combobox
                        items={customer.map((c) => ({
                          value: String(c.customer_id),
                          label: c.company_name,
                        }))}
                        value={field.value === 0 ? "" : String(field.value)}
                        onValueChange={(value) => {
                          field.onChange(parseInt(value));
                          const selectedCustomer = customer.find(
                            (c) => String(c.customer_id) === value
                          );
                          if (selectedCustomer) {
                            // Auto-populate contact person
                            form.setValue(
                              "contact_person",
                              selectedCustomer.contact_person || ""
                            );
                          }
                        }}
                        placeholder="Select company"
                        searchPlaceholder="Search customer..."
                      />
                      <FormMessage />
                    </FormItem>
                  ))}
                </div>

                {/* Company Address */}
                <FormItem>
                  <FormLabel>Company Address</FormLabel>
                  <Textarea
                    placeholder="Company Address"
                    className="resize-none"
                    value={
                      customer.find(
                        (c) => c.customer_id === form.watch("customer_id")
                      )?.address || ""
                    }
                    readOnly
                  />
                </FormItem>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Contact Person */}
                  {renderFormField("contact_person", ({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Person</FormLabel>
                      <FormControl>
                        <Input placeholder="Select contact person" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  ))}

                  {/* Mobile Number */}
                  <FormItem>
                    <FormLabel>Mobile Number</FormLabel>
                    <Input
                      placeholder="Mobile Number"
                      value={
                        customer.find(
                          (c) => c.customer_id === form.watch("customer_id")
                        )?.phone || ""
                      }
                      readOnly
                    />
                  </FormItem>
                </div>
              </CardContent>
            </Card>

            {/* Card 2: Quotation Overview */}
            <Card
              className={cn(
                "w-full shadow-sm hover:shadow-md transition-shadow flex flex-col"
              )}
            >
              <CardHeader className="flex flex-col gap-[0.5px]">
                <h3 className="text-md font-medium mb-2">Quotation Overview</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Configure quotation settings
                </p>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Quotation Type */}
                  {renderFormField("type_id", ({ field }) => {
                    const quotationTypeLabels: Record<QuotationType, string> = {
                      [QuotationType.NORMAL]: "Normal",
                      [QuotationType.OPTIONAL]: "Optional",
                    };
                    return (
                      <FormItem>
                        <FormLabel>
                          Quotation Type <span className="text-red-500">*</span>
                        </FormLabel>
                        <RadioGroup
                          value={String(field.value)}
                          onValueChange={(val) => field.onChange(Number(val))}
                          className="flex gap-4"
                        >
                          {Object.values(QuotationType)
                            .filter((v) => typeof v === "number")
                            .map((type) => (
                              <div
                                key={type as number}
                                className="flex items-center gap-2"
                              >
                                <RadioGroupItem
                                  value={String(type)}
                                  id={`quotation-type-${type}`}
                                />
                                <Label htmlFor={`quotation-type-${type}`}>
                                  {quotationTypeLabels[type as QuotationType]}
                                </Label>
                              </div>
                            ))}
                        </RadioGroup>
                        <FormMessage />
                      </FormItem>
                    );
                  })}

                  {/* Delivery Days */}
                  {renderFormField("delivery_days", ({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Delivery Days <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Tax Type */}
                  {renderFormField("tax_type_id", ({ field }) => {
                    const taxTypeLabels: Record<QuotationTaxType, string> = {
                      [QuotationTaxType.NONE]: "None",
                      [QuotationTaxType.VAT]: "VAT",
                      [QuotationTaxType.SVAT]: "SVAT",
                    };
                    return (
                      <FormItem>
                        <FormLabel>
                          Tax Type <span className="text-red-500">*</span>
                        </FormLabel>
                        <RadioGroup
                          value={String(field.value)}
                          onValueChange={(val) =>
                            handleTaxTypeChange(Number(val))
                          }
                          className="flex gap-4"
                        >
                          {Object.values(QuotationTaxType)
                            .filter((v) => typeof v === "number")
                            .map((type) => (
                              <div
                                key={type as number}
                                className="flex items-center gap-2"
                              >
                                <RadioGroupItem
                                  value={String(type)}
                                  id={`tax-type-${type}`}
                                />
                                <Label htmlFor={`tax-type-${type}`}>
                                  {taxTypeLabels[type as QuotationTaxType]}
                                </Label>
                              </div>
                            ))}
                        </RadioGroup>
                        <FormMessage />
                      </FormItem>
                    );
                  })}

                  {/* Currency */}
                  {renderFormField("currency", ({ field }) => (
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
                          <SelectItem value="LKR">
                            🇱🇰 LKR - Sri Lankan Rupee (Rs)
                          </SelectItem>
                          <SelectItem value="USD">
                            🇺🇸 USD - US Dollar ($)
                          </SelectItem>
                          <SelectItem value="EUR">🇪🇺 EUR - Euro (€)</SelectItem>
                          <SelectItem value="GBP">
                            🇬🇧 GBP - British Pound (£)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  ))}
                </div>

                {/* Show Account Details in PDF */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="showAccountDetails"
                    checked={showAccountDetails}
                    onCheckedChange={(checked) =>
                      setShowAccountDetails(checked as boolean)
                    }
                  />
                  <label
                    htmlFor="showAccountDetails"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Show Account Details in PDF
                  </label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Include account details in the printed quotation
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Card 3: Item Table */}
          <Card
            className={cn(
              "w-full shadow-sm hover:shadow-md transition-shadow flex flex-col"
            )}
          >
            <CardHeader className="flex flex-col gap-[0.5px]">
              <h3 className="text-md font-medium mb-2">Items</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Add items to the quotation
              </p>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {/* Item Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 text-sm font-medium">
                        Item
                      </th>
                      <th className="text-left p-2 text-sm font-medium">
                        Description
                      </th>
                      <th className="text-left p-2 text-sm font-medium">
                        Quantity
                      </th>
                      <th className="text-left p-2 text-sm font-medium">
                        Rate (Rs)
                      </th>
                      <th className="text-left p-2 text-sm font-medium">
                        Total (VAT exclusive) (Rs)
                      </th>
                      <th className="text-left p-2 text-sm font-medium">
                        Total (VAT inclusive) (Rs)
                      </th>
                      <th className="text-left p-2 text-sm font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {itemFields.map((item, index) => {
                      const qty = parseFloat(
                        form.watch(`items.${index}.item_qty`) || "0"
                      );
                      const price = parseFloat(
                        form.watch(`items.${index}.item_unit_price`) || "0"
                      );
                      const totalExclusive = qty * price;
                      const totalInclusive =
                        watchTaxType === 2
                          ? totalExclusive * 1.15
                          : totalExclusive;

                      return (
                        <tr key={item.id} className="border-b">
                          <td className="p-2">
                            {renderFormField(
                              `items.${index}.item_category`,
                              ({ field }) => (
                                <FormItem>
                                  <Select
                                    onValueChange={(val) => {
                                      field.onChange(val);
                                      // Set a corresponding item_id based on the selection
                                      const idMap: Record<string, number> = {
                                        item1: 1,
                                        item2: 2,
                                        item3: 3,
                                      };
                                      form.setValue(
                                        `items.${index}.item_id`,
                                        idMap[val] || 0
                                      );
                                    }}
                                    value={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="w-[150px]">
                                        <SelectValue placeholder="Select an item" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="item1">
                                        Item 1
                                      </SelectItem>
                                      <SelectItem value="item2">
                                        Item 2
                                      </SelectItem>
                                      <SelectItem value="item3">
                                        Item 3
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormItem>
                              )
                            )}
                          </td>
                          <td className="p-2">
                            {renderFormField(
                              `items.${index}.item_description`,
                              ({ field }) => (
                                <FormItem>
                                  <Textarea
                                    placeholder="Type your message here."
                                    className="resize-none min-w-[200px]"
                                    {...field}
                                  />
                                </FormItem>
                              )
                            )}
                          </td>
                          <td className="p-2">
                            {renderFormField(
                              `items.${index}.item_qty`,
                              ({ field }) => (
                                <FormItem>
                                  <Input
                                    type="number"
                                    placeholder="0"
                                    className="w-[80px]"
                                    {...field}
                                    onChange={(e) =>
                                      handleItemChange(
                                        index,
                                        "item_qty",
                                        e.target.value
                                      )
                                    }
                                  />
                                </FormItem>
                              )
                            )}
                          </td>
                          <td className="p-2">
                            {renderFormField(
                              `items.${index}.item_unit_price`,
                              ({ field }) => (
                                <FormItem>
                                  <Input
                                    type="number"
                                    placeholder="0"
                                    className="w-[100px]"
                                    {...field}
                                    onChange={(e) =>
                                      handleItemChange(
                                        index,
                                        "item_unit_price",
                                        e.target.value
                                      )
                                    }
                                  />
                                </FormItem>
                              )
                            )}
                          </td>
                          <td className="p-2">
                            <Input
                              type="text"
                              value={`Rs ${totalExclusive.toFixed(2)}`}
                              className="w-[120px]"
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              type="text"
                              value={`Rs ${totalInclusive.toFixed(2)}`}
                              className="w-[120px]"
                            />
                          </td>
                          <td className="p-2">
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-green-600"
                                onClick={() => {
                                  // Explicitly trigger recalculation when checked
                                  const currentItems = form.getValues("items");
                                  const currentTaxType =
                                    form.getValues("tax_type_id");
                                  const totals = calculateTotals(
                                    currentItems,
                                    currentTaxType
                                  );

                                  form.setValue("sub_total", totals.subTotal);
                                  form.setValue(
                                    "no_of_items",
                                    totals.noOfItems
                                  );
                                  form.setValue(
                                    "total_without_tax",
                                    totals.totalWithoutTax
                                  );
                                  form.setValue("net_total", totals.netTotal);
                                  toast("Totals updated");
                                }}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-red-600"
                                onClick={() => removeItem(index)}
                                disabled={itemFields.length <= 1}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Add Product Button */}
              <div className="flex justify-start">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    appendItem({
                      item_id: 0,
                      item_category: "",
                      item_qty: "0",
                      item_description: "",
                      item_unit_price: "0",
                      item_unit_discount: "0",
                      item_total_price: "0",
                    })
                  }
                  className="bg-primary text-white hover:bg-primary/80"
                >
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Add Product
                </Button>
              </div>

              {/* Notes */}
              {renderFormField("notes", ({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <Textarea
                    placeholder="Enter note..."
                    className="resize-none"
                    {...field}
                  />
                  <FormMessage />
                </FormItem>
              ))}

              {/* Calculation Summary */}
              <div className="flex justify-end">
                <div className="w-full md:w-1/2 space-y-2 border-t pt-4">
                  <div className="flex justify-between text-sm">
                    <span>Sub Total (Without TAX):</span>
                    <span className="font-medium">
                      Rs {form.watch("sub_total") || "0"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>No. of Items:</span>
                    <span className="font-medium">
                      {form.watch("no_of_items") || "0"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total Amount (Without TAX):</span>
                    <span className="font-medium">
                      Rs {form.watch("total_without_tax") || "0"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-bold border-t pt-2">
                    <span>Net Total:</span>
                    <span>Rs {form.watch("net_total") || "0"}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}

export default EditQuotation;
