"use client";
import React, { useEffect, useState } from "react";
import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb";
import { getErrorMessage } from "@/lib/error-utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Combobox } from "@/components/shared/combobox";
import { PRODUCT_TYPES, REPORT_TYPES } from "@/config/enum";
import { cn } from "@/lib/utils";
import { CustomerApi } from "@/modules/customer/api";
import { CUSTOMER } from "@/modules/customer/types";
import { ReportsApi } from "@/modules/reports/api";
import { userApi } from "@/modules/users/api";
import { GET_ALL_USER } from "@/modules/users/types";
import { ReportsTable } from "./_components/reports-table";
import { PageLoader } from "@/components/shared/loader";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Zod Schemas
const GeneralReportSchema = z.object({
  reportType: z.string().min(1, "Report Type is required"),
  fromDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "From date must be YYYY-MM-DD"),
  toDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "To date must be YYYY-MM-DD"),
  customer_id: z.number().optional(),
  product_type: z.string().optional(),
});

const InventoryReportSchema = z.object({
  report_type: z.string().min(1, "Report Type is required"),
  from_date: z.string().optional(),
  to_date: z.string().optional(),
});

const SalesReportSchema = z.object({
  report_type: z.string().min(1, "Report Type is required"),
  from_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "From date must be YYYY-MM-DD"),
  to_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "To date must be YYYY-MM-DD"),
});

const QuotationReportSchema = z.object({
  reportType: z.string().min(1, "Report Type is required"),
  fromDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "From date must be YYYY-MM-DD"),
  toDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "To date must be YYYY-MM-DD"),
});

// Report Type Dropdown Items
const INVENTORY_REPORT_TYPES = [
  { value: "CURRENT_STOCK", label: "Current Stock Levels" },
  { value: "STOCK_VALUE", label: "Total Stock Value" },
  { value: "STOCK_AGING", label: "Stock Aging Report" },
  { value: "LOW_STOCK", label: "Low Stock Report" },
  { value: "GRN_REPORT", label: "GRN Report" },
  { value: "GRN_VALUE_WEEKLY", label: "GRN Value Report per Week" },
  { value: "GRN_VALUE_MONTHLY", label: "GRN Value Report per Month" },
  { value: "MATERIAL_CONSUMPTION_SUMMARY", label: "Material Consumption Summary" },
  { value: "MATERIAL_CONSUMPTION_BY_JOB", label: "Material Consumption by Job" },
];

const SALES_REPORT_TYPES = [
  { value: "SALES_DAILY", label: "Daily Sales" },
  { value: "SALES_WEEKLY", label: "Weekly Sales" },
  { value: "SALES_MONTHLY", label: "Monthly Sales" },
  { value: "SALES_BY_CUSTOMER", label: "Sales by Customer" },
  { value: "SALES_BY_PRODUCT", label: "Sales by Product" },
  { value: "SALES_BY_SALESPERSON", label: "Sales by Salesperson" },
];

const QUOTATION_REPORT_TYPES = [
  { value: "QUOTATION_WEEKLY", label: "Total Quotations Issued per Week" },
  { value: "QUOTATION_MONTHLY", label: "Total Quotations Issued per Month" },
  { value: "QUOTATION_SUMMARY", label: "Approved vs Rejected Quotations Summary" },
  { value: "QUOTATION_BY_CUSTOMER", label: "Quotations by Customer" },
  { value: "QUOTATION_BY_SALESPERSON", label: "Quotations by Salesperson" },
  { value: "QUOTE_TO_PO_CONVERSION", label: "Quote to PO Conversion" },
];

function ReportsPage() {
  const [customer, setCustomer] = useState<CUSTOMER[]>([]);
  const [userList, setUserList] = useState<GET_ALL_USER[]>([]);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("general");

  // Client-side filtering states for Sales Tab
  const [selectedSalesCustomerId, setSelectedSalesCustomerId] = useState<string>("");
  const [selectedSalespersonName, setSelectedSalespersonName] = useState<string>("");

  useEffect(() => {
    getCustomerList();
    getUserList();
  }, []);

  const getCustomerList = async () => {
    try {
      const response = await CustomerApi.getAll();
      setCustomer(response.data);
    } catch (error) {
      console.error("Failed to fetch customers", error);
    }
  };

  const getUserList = async () => {
    try {
      const response = await userApi.getAll();
      setUserList(response.data.users || []);
    } catch (error) {
      console.error("Failed to fetch users", error);
    }
  };

  // Forms
  const generalForm = useForm<z.infer<typeof GeneralReportSchema>>({
    resolver: zodResolver(GeneralReportSchema),
    defaultValues: {
      reportType: "",
      fromDate: format(new Date(), "yyyy-MM-dd"),
      toDate: format(new Date(), "yyyy-MM-dd"),
      customer_id: undefined,
      product_type: "",
    },
  });

  const inventoryForm = useForm<z.infer<typeof InventoryReportSchema>>({
    resolver: zodResolver(InventoryReportSchema),
    defaultValues: {
      report_type: "",
      from_date: format(new Date(), "yyyy-MM-dd"),
      to_date: format(new Date(), "yyyy-MM-dd"),
    },
  });

  const salesForm = useForm<z.infer<typeof SalesReportSchema>>({
    resolver: zodResolver(SalesReportSchema),
    defaultValues: {
      report_type: "",
      from_date: format(new Date(), "yyyy-MM-dd"),
      to_date: format(new Date(), "yyyy-MM-dd"),
    },
  });

  const quotationForm = useForm<z.infer<typeof QuotationReportSchema>>({
    resolver: zodResolver(QuotationReportSchema),
    defaultValues: {
      reportType: "",
      fromDate: format(new Date(), "yyyy-MM-dd"),
      toDate: format(new Date(), "yyyy-MM-dd"),
    },
  });

  // Reset filters when Sales Report Type changes
  const watchedSalesType = salesForm.watch("report_type");
  useEffect(() => {
    setSelectedSalesCustomerId("");
    setSelectedSalespersonName("");
  }, [watchedSalesType]);

  // Submit Handlers
  const handleGeneralSubmit = async (data: z.infer<typeof GeneralReportSchema>) => {
    try {
      setLoading(true);
      const isAdvanced = Object.keys(REPORT_TYPES).includes(data.reportType);
      const payload = {
        reportType: data.reportType,
        filters: {
          fromDate: new Date(data.fromDate),
          toDate: new Date(data.toDate),
          ...(isAdvanced && {
            customer_id: data.customer_id,
            product_type: data.product_type,
          }),
        },
      };

      const response = isAdvanced
        ? await ReportsApi.createAdvanced(payload)
        : await ReportsApi.createSummary(payload);

      setReportData(response.data || []);
      toast.success("Report Generated Successfully");
    } catch (error) {
      console.error(error);
      toast.error(getErrorMessage(error, "Failed to generate report"));
    } finally {
      setLoading(false);
    }
  };

  const handleInventorySubmit = async (data: z.infer<typeof InventoryReportSchema>) => {
    try {
      setLoading(true);
      const requiresDates = !["STOCK_VALUE", "MATERIAL_CONSUMPTION_SUMMARY"].includes(data.report_type);
      const payload = {
        report_type: data.report_type,
        ...(requiresDates && {
          from_date: data.from_date,
          to_date: data.to_date,
        }),
      };

      const response = await ReportsApi.createCustomInventory(payload);
      setReportData(response.data || []);
      toast.success("Inventory Report Generated Successfully");
    } catch (error) {
      console.error(error);
      toast.error(getErrorMessage(error, "Failed to generate inventory report"));
    } finally {
      setLoading(false);
    }
  };

  const handleSalesSubmit = async (data: z.infer<typeof SalesReportSchema>) => {
    try {
      setLoading(true);
      const payload = {
        report_type: data.report_type,
        from_date: data.from_date,
        to_date: data.to_date,
      };

      const response = await ReportsApi.createCustomSales(payload);
      setReportData(response.data || []);
      toast.success("Sales Report Generated Successfully");
    } catch (error) {
      console.error(error);
      toast.error(getErrorMessage(error, "Failed to generate sales report"));
    } finally {
      setLoading(false);
    }
  };

  const handleQuotationSubmit = async (data: z.infer<typeof QuotationReportSchema>) => {
    try {
      setLoading(true);
      const payload = {
        reportType: data.reportType,
        filters: {
          fromDate: new Date(data.fromDate),
          toDate: new Date(data.toDate),
        },
      };

      const response = await ReportsApi.createAdvanced(payload);
      setReportData(response.data || []);
      toast.success("Quotation Report Generated Successfully");
    } catch (error) {
      console.error(error);
      toast.error(getErrorMessage(error, "Failed to generate quotation report"));
    } finally {
      setLoading(false);
    }
  };

  const clearResultsAndReset = (tab: string) => {
    setActiveTab(tab);
    setReportData([]);
    setSelectedSalesCustomerId("");
    setSelectedSalespersonName("");
    generalForm.reset();
    inventoryForm.reset();
    salesForm.reset();
    quotationForm.reset();
  };

  // Watch values for dynamic field rendering
  const watchedGeneralType = generalForm.watch("reportType");
  const isGeneralAdvanced = Object.keys(REPORT_TYPES).includes(watchedGeneralType);

  const watchedInventoryType = inventoryForm.watch("report_type");
  const inventoryRequiresDates = watchedInventoryType && !["STOCK_VALUE", "MATERIAL_CONSUMPTION_SUMMARY"].includes(watchedInventoryType);

  // Compute filtered data for rendering
  const filteredReportData = React.useMemo(() => {
    if (!reportData || reportData.length === 0) return [];
    let data = [...reportData];

    if (activeTab === "sales") {
      if (watchedSalesType === "SALES_BY_CUSTOMER" && selectedSalesCustomerId) {
        data = data.filter((row: any) => String(row.customer_id) === String(selectedSalesCustomerId));
      } else if (watchedSalesType === "SALES_BY_SALESPERSON" && selectedSalespersonName) {
        data = data.filter((row: any) => String(row.salesperson).toLowerCase() === selectedSalespersonName.toLowerCase());
      }
    }

    return data;
  }, [reportData, activeTab, watchedSalesType, selectedSalesCustomerId, selectedSalespersonName]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-[24px] pt-0 mt-3 w-full min-w-0 overflow-hidden">
      <PageTitleWithBreadcrumb
        title="Reports Management"
        breadcrumbs={[{ title: "Dashboard", href: "/dashboard" }]}
      />

      <Tabs value={activeTab} onValueChange={clearResultsAndReset} className="w-full mt-4">
        <TabsList className="grid w-full max-w-[650px] grid-cols-4 bg-muted">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="quotation">Quotations</TabsTrigger>
        </TabsList>

        {/* General Reports Tab */}
        <TabsContent value="general" className="mt-4 border p-4 rounded-lg bg-card">
          <Form {...generalForm}>
            <form onSubmit={generalForm.handleSubmit(handleGeneralSubmit)} className="flex flex-wrap gap-4 items-end">
              <FormField
                control={generalForm.control}
                name="reportType"
                render={({ field }) => (
                  <FormItem className="w-[250px]">
                    <FormLabel>Report Type</FormLabel>
                    <Combobox
                      groups={[
                        {
                          label: "General Reports",
                          items: [
                            { value: "customers", label: "CUSTOMERS" },
                            { value: "main_inventory", label: "MAIN INVENTORY" },
                            { value: "dispatch", label: "DISPATCH" },
                            { value: "jobs", label: "JOBS" },
                            { value: "purchase_orders", label: "PURCHASE ORDERS" },
                            { value: "quotations", label: "QUOTATIONS" },
                          ],
                        },
                        {
                          label: "Advanced Report Types",
                          items: Object.entries(REPORT_TYPES).map(([key, label]) => ({
                            value: key,
                            label: label as string,
                          })),
                        },
                      ]}
                      value={field.value ?? ""}
                      onValueChange={field.onChange}
                      placeholder="Select Report Type"
                    />
                  </FormItem>
                )}
              />

              {isGeneralAdvanced && (
                <FormField
                  control={generalForm.control}
                  name="customer_id"
                  render={({ field }) => (
                    <FormItem className="w-[200px]">
                      <FormLabel>Customer</FormLabel>
                      <Combobox
                        items={customer.map((c) => ({
                          value: String(c.customer_id),
                          label: c.company_name,
                        }))}
                        value={field.value ? String(field.value) : ""}
                        onValueChange={(val) => field.onChange(val ? Number(val) : undefined)}
                        placeholder="Select Customer"
                      />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={generalForm.control}
                name="fromDate"
                render={({ field }) => (
                  <FormItem className="w-[200px]">
                    <FormLabel>From Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant="outline" className="w-full h-10 pl-3 text-left font-normal">
                            {field.value ? format(new Date(field.value), "PPP") : "Select date"}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                          captionLayout="dropdown"
                        />
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                )}
              />

              <FormField
                control={generalForm.control}
                name="toDate"
                render={({ field }) => (
                  <FormItem className="w-[200px]">
                    <FormLabel>To Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant="outline" className="w-full h-10 pl-3 text-left font-normal">
                            {field.value ? format(new Date(field.value), "PPP") : "Select date"}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                          captionLayout="dropdown"
                        />
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                )}
              />

              {isGeneralAdvanced && (
                <FormField
                  control={generalForm.control}
                  name="product_type"
                  render={({ field }) => (
                    <FormItem className="w-[200px]">
                      <FormLabel>Product Type</FormLabel>
                      <Combobox
                        items={Object.entries(PRODUCT_TYPES).map(([key, val]) => ({
                          value: key,
                          label: val as string,
                        }))}
                        value={field.value ?? ""}
                        onValueChange={field.onChange}
                        placeholder="Select Product Type"
                      />
                    </FormItem>
                  )}
                />
              )}

              <Button variant="outline" type="button" className="h-10" onClick={() => generalForm.reset()}>
                Reset
              </Button>
              <Button type="submit" className="bg-primary text-white h-10">
                Generate Report
              </Button>
            </form>
          </Form>
        </TabsContent>

        {/* Inventory Reports Tab */}
        <TabsContent value="inventory" className="mt-4 border p-4 rounded-lg bg-card">
          <Form {...inventoryForm}>
            <form onSubmit={inventoryForm.handleSubmit(handleInventorySubmit)} className="flex flex-wrap gap-4 items-end">
              <FormField
                control={inventoryForm.control}
                name="report_type"
                render={({ field }) => (
                  <FormItem className="w-[250px]">
                    <FormLabel>Inventory Report Type</FormLabel>
                    <Combobox
                      items={INVENTORY_REPORT_TYPES}
                      value={field.value ?? ""}
                      onValueChange={field.onChange}
                      placeholder="Select Report Type"
                    />
                  </FormItem>
                )}
              />

              {inventoryRequiresDates && (
                <>
                  <FormField
                    control={inventoryForm.control}
                    name="from_date"
                    render={({ field }) => (
                      <FormItem className="w-[200px]">
                        <FormLabel>From Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button variant="outline" className="w-full h-10 pl-3 text-left font-normal">
                                {field.value ? format(new Date(field.value), "PPP") : "Select date"}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value ? new Date(field.value) : undefined}
                              onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                              captionLayout="dropdown"
                            />
                          </PopoverContent>
                        </Popover>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={inventoryForm.control}
                    name="to_date"
                    render={({ field }) => (
                      <FormItem className="w-[200px]">
                        <FormLabel>To Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button variant="outline" className="w-full h-10 pl-3 text-left font-normal">
                                {field.value ? format(new Date(field.value), "PPP") : "Select date"}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value ? new Date(field.value) : undefined}
                              onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                              captionLayout="dropdown"
                            />
                          </PopoverContent>
                        </Popover>
                      </FormItem>
                    )}
                  />
                </>
              )}

              <Button variant="outline" type="button" className="h-10" onClick={() => inventoryForm.reset()}>
                Reset
              </Button>
              <Button type="submit" className="bg-primary text-white h-10">
                Generate Report
              </Button>
            </form>
          </Form>
        </TabsContent>

        {/* Sales Reports Tab */}
        <TabsContent value="sales" className="mt-4 border p-4 rounded-lg bg-card">
          <Form {...salesForm}>
            <form onSubmit={salesForm.handleSubmit(handleSalesSubmit)} className="flex flex-wrap gap-4 items-end">
              <FormField
                control={salesForm.control}
                name="report_type"
                render={({ field }) => (
                  <FormItem className="w-[250px]">
                    <FormLabel>Sales Report Type</FormLabel>
                    <Combobox
                      items={SALES_REPORT_TYPES}
                      value={field.value ?? ""}
                      onValueChange={field.onChange}
                      placeholder="Select Report Type"
                    />
                  </FormItem>
                )}
              />

              <FormField
                control={salesForm.control}
                name="from_date"
                render={({ field }) => (
                  <FormItem className="w-[200px]">
                    <FormLabel>From Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant="outline" className="w-full h-10 pl-3 text-left font-normal">
                            {field.value ? format(new Date(field.value), "PPP") : "Select date"}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                          captionLayout="dropdown"
                        />
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                )}
              />

              <FormField
                control={salesForm.control}
                name="to_date"
                render={({ field }) => (
                  <FormItem className="w-[200px]">
                    <FormLabel>To Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant="outline" className="w-full h-10 pl-3 text-left font-normal">
                            {field.value ? format(new Date(field.value), "PPP") : "Select date"}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                          captionLayout="dropdown"
                        />
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                )}
              />

              {/* Dynamic Filtering Dropdowns inside Sales Tab */}
              {watchedSalesType === "SALES_BY_CUSTOMER" && (
                <div className="flex flex-col gap-1 w-[200px]">
                  <FormLabel>Filter by Customer</FormLabel>
                  <Combobox
                    items={[
                      { value: "", label: "All Customers" },
                      ...customer.map((c) => ({
                        value: String(c.customer_id),
                        label: c.company_name,
                      })),
                    ]}
                    value={selectedSalesCustomerId}
                    onValueChange={setSelectedSalesCustomerId}
                    placeholder="All Customers"
                  />
                </div>
              )}

              {watchedSalesType === "SALES_BY_SALESPERSON" && (
                <div className="flex flex-col gap-1 w-[200px]">
                  <FormLabel>Filter by Salesperson</FormLabel>
                  <Combobox
                    items={[
                      { value: "", label: "All Salespersons" },
                      ...userList.map((u) => ({
                        value: u.name,
                        label: u.name,
                      })),
                    ]}
                    value={selectedSalespersonName}
                    onValueChange={setSelectedSalespersonName}
                    placeholder="All Salespersons"
                  />
                </div>
              )}

              <Button variant="outline" type="button" className="h-10" onClick={() => salesForm.reset()}>
                Reset
              </Button>
              <Button type="submit" className="bg-primary text-white h-10">
                Generate Report
              </Button>
            </form>
          </Form>
        </TabsContent>

        {/* Quotation Reports Tab */}
        <TabsContent value="quotation" className="mt-4 border p-4 rounded-lg bg-card">
          <Form {...quotationForm}>
            <form onSubmit={quotationForm.handleSubmit(handleQuotationSubmit)} className="flex flex-wrap gap-4 items-end">
              <FormField
                control={quotationForm.control}
                name="reportType"
                render={({ field }) => (
                  <FormItem className="w-[250px]">
                    <FormLabel>Quotation Report Type</FormLabel>
                    <Combobox
                      items={QUOTATION_REPORT_TYPES}
                      value={field.value ?? ""}
                      onValueChange={field.onChange}
                      placeholder="Select Report Type"
                    />
                  </FormItem>
                )}
              />

              <FormField
                control={quotationForm.control}
                name="fromDate"
                render={({ field }) => (
                  <FormItem className="w-[200px]">
                    <FormLabel>From Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant="outline" className="w-full h-10 pl-3 text-left font-normal">
                            {field.value ? format(new Date(field.value), "PPP") : "Select date"}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                          captionLayout="dropdown"
                        />
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                )}
              />

              <FormField
                control={quotationForm.control}
                name="toDate"
                render={({ field }) => (
                  <FormItem className="w-[200px]">
                    <FormLabel>To Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant="outline" className="w-full h-10 pl-3 text-left font-normal">
                            {field.value ? format(new Date(field.value), "PPP") : "Select date"}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                          captionLayout="dropdown"
                        />
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                )}
              />

              <Button variant="outline" type="button" className="h-10" onClick={() => quotationForm.reset()}>
                Reset
              </Button>
              <Button type="submit" className="bg-primary text-white h-10">
                Generate Report
              </Button>
            </form>
          </Form>
        </TabsContent>
      </Tabs>

      {loading ? (
        <PageLoader />
      ) : (
        filteredReportData.length > 0 && (
          <div className="mt-8">
            <ReportsTable data={filteredReportData} />
          </div>
        )
      )}
    </div>
  );
}

export default ReportsPage;
