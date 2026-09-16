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
import { PRODUCT_TYPES, REPORT_TYPES, ITEM_CATEGORY, ITEM_SUB_CATEGORY } from "@/config/enum";
import { cn } from "@/lib/utils";
import { CustomerApi } from "@/modules/customer/api";
import { CUSTOMER } from "@/modules/customer/types";
import { inventoryApi } from "@/modules/inventory/api";
import { GET_ALL_INVENTORY } from "@/modules/inventory/types";
import { ReportsApi } from "@/modules/reports/api";
import { userApi } from "@/modules/users/api";
import { GET_ALL_USER } from "@/modules/users/types";
import { quotationApi } from "@/modules/quotations/api";
import { jobTicketsApi } from "@/modules/job-tickets/api";
import { issueNotesApi } from "@/modules/issue-notes/api";
import { grnApi } from "@/modules/grn/api";
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
  customer_id: z.union([z.number(), z.string()]).optional(),
  product_type: z.string().optional(),
});

const InventoryReportSchema = z.object({
  report_type: z.string().min(1, "Report Type is required"),
  from_date: z.string().optional(),
  to_date: z.string().optional(),
  item_category: z.string().optional(),
  item_sub_category: z.string().optional(),
  supplier_name: z.string().optional(),
  item_id: z.string().optional(),
  job_id: z.string().optional(),
}).superRefine((data, ctx) => {
  const requiresDates = !["STOCK_VALUE", "STOCK_AGING", "LOW_STOCK"].includes(data.report_type);
  if (requiresDates && !data.from_date) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "From date is required",
      path: ["from_date"]
    });
  }
  if (requiresDates && !data.to_date) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "To date is required",
      path: ["to_date"]
    });
  }
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
  customer_id: z.union([z.string(), z.number()]).optional(),
  salesperson: z.string().optional(),
});

// Report Type Dropdown Items
const INVENTORY_REPORT_TYPES = [
  { value: "CURRENT_STOCK", label: "Current Stock Levels" },
  { value: "STOCK_VALUE", label: "Total Stock Value" },
  { value: "STOCK_AGING", label: "Stock Aging Report" },
  { value: "LOW_STOCK", label: "Low Stock Report" },
  { value: "GRN_REPORT", label: "GRN Report" },
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
  const [inventoryItems, setInventoryItems] = useState<{ value: string; label: string }[]>([]);
  const [userList, setUserList] = useState<GET_ALL_USER[]>([]);
  const [marketingPersons, setMarketingPersons] = useState<string[]>([]);
  const [rawInventoryList, setRawInventoryList] = useState<GET_ALL_INVENTORY[]>([]);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any[]>([]);
  const [grandTotal, setGrandTotal] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("general");

  // Client-side filtering states for Sales Tab
  const [selectedSalesCustomerId, setSelectedSalesCustomerId] = useState<string>("");
  const [selectedSalesCurrency, setSelectedSalesCurrency] = useState<string>("");
  const [selectedSalespersonName, setSelectedSalespersonName] = useState<string>("");
  const [jobList, setJobList] = useState<{ value: string; label: string; fullJob?: any }[]>([]);
  const [quotationList, setQuotationList] = useState<any[]>([]);
  const [issueNotesList, setIssueNotesList] = useState<any[]>([]);
  const [grnList, setGrnList] = useState<any[]>([]);
  const [selectedDispatchStatus, setSelectedDispatchStatus] = useState<string>("all");

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const response = await CustomerApi.getAll();
        setCustomer(response.data);
      } catch (error) {
        console.error("Failed to fetch customers", error);
      }
    };

    const fetchInventory = async () => {
      try {
        const response = await inventoryApi.getAll();
        const resData = (response as any)?.data;
        const rawData = Array.isArray(resData) ? resData : (resData?.data || []);
        if (rawData) {
          setRawInventoryList(rawData);
          const uniqueItems = Array.from(
            new Map(
              rawData.map((item: any) => [
                `${item.item_sub_category}${item.item_name}-${item.size || ""}`,
                item,
              ])
            ).values()
          );

          setInventoryItems(
            (uniqueItems as any[]).map((item) => {
              const label = item.size
                ? `${item.item_sub_category} ${item.item_name} (${item.size})`
                : `${item.item_sub_category} ${item.item_name}`;

              return {
                value: (item.item_id || item.id || "").toString(),
                label: label,
              };
            })
          );
        }
      } catch (error) {
        console.error("Failed to fetch inventory", error);
      }
    };

    const fetchJobs = async () => {
      try {
        const response = await jobTicketsApi.getAll();
        const resData = (response as any)?.data;
        const rawJobs = Array.isArray(resData) ? resData : (resData?.data || []);
        setJobList(
          rawJobs.map((job: any) => ({
            value: (job.job_id || job.id || "").toString(),
            label: `[#${job.job_number || job.job_id || job.id}] ${job.job_name || job.name || ""}`,
            fullJob: job,
          }))
        );
      } catch (error) {
        console.error("Failed to fetch jobs", error);
      }
    };

    const fetchIssueNotes = async () => {
      try {
        const response = await issueNotesApi.getAll();
        const resData = (response as any)?.data;
        const rawNotes = Array.isArray(resData) ? resData : (resData?.data || []);
        setIssueNotesList(rawNotes);
      } catch (error) {
        console.error("Failed to fetch issue notes", error);
      }
    };

    const fetchGrn = async () => {
      try {
        const response = await grnApi.getAll();
        const resData = (response as any)?.data;
        const rawGrns = Array.isArray(resData) ? resData : (resData?.data || []);
        setGrnList(rawGrns);
      } catch (error) {
        console.error("Failed to fetch GRNs", error);
      }
    };

    fetchCustomer();
    fetchInventory();
    fetchJobs();
    fetchIssueNotes();
    fetchGrn();
    getUserList();
    getMarketingPersons();
  }, []);

  const getUserList = async () => {
    try {
      const response = await userApi.getAll();
      const resData = (response as any)?.data;
      const usersArray = Array.isArray(resData) ? resData : (resData?.users || resData?.data || []);
      setUserList(usersArray);
    } catch (error) {
      console.error("Failed to fetch users", error);
    }
  };

  const getMarketingPersons = async () => {
    try {
      const response = await quotationApi.getAll();
      const names = response.data
        .map((q: any) => q.marketing_person)
        .filter((name: any): name is string => typeof name === "string" && name.trim() !== "");
      const uniqueNames = Array.from(new Set(names)).sort();
      setMarketingPersons(uniqueNames);
      setQuotationList(response.data);
    } catch (error) {
      console.error("Failed to fetch marketing persons from quotations", error);
    }
  };

  // Forms Setup
  const defaultFromDate = format(new Date(new Date().getFullYear(), 0, 1), "yyyy-MM-dd");
  const defaultToDate = format(new Date(), "yyyy-MM-dd");

  const generalForm = useForm<z.infer<typeof GeneralReportSchema>>({
    resolver: zodResolver(GeneralReportSchema) as any,
    defaultValues: {
      reportType: "",
      fromDate: defaultFromDate,
      toDate: defaultToDate,
      customer_id: undefined,
      product_type: "",
    },
  });

  const inventoryForm = useForm<z.infer<typeof InventoryReportSchema>>({
    resolver: zodResolver(InventoryReportSchema) as any,
    defaultValues: {
      report_type: "",
      from_date: defaultFromDate,
      to_date: defaultToDate,
      item_category: "ALL",
      item_sub_category: "ALL",
      job_id: "ALL",
    },
  });

  const salesForm = useForm<z.infer<typeof SalesReportSchema>>({
    resolver: zodResolver(SalesReportSchema) as any,
    defaultValues: {
      report_type: "",
      from_date: defaultFromDate,
      to_date: defaultToDate,
    },
  });

  const quotationForm = useForm<z.infer<typeof QuotationReportSchema>>({
    resolver: zodResolver(QuotationReportSchema) as any,
    defaultValues: {
      reportType: "",
      fromDate: defaultFromDate,
      toDate: defaultToDate,
    },
  });

  // Reset filters when Sales Report Type changes
  const watchedQuotationType = quotationForm.watch("reportType");
  const watchedSalesType = salesForm.watch("report_type");
  useEffect(() => {
    setSelectedSalesCustomerId("");
    setSelectedSalesCurrency("");
    setSelectedSalesCurrency("");
    setSelectedSalespersonName("");
    
    if (watchedSalesType === "SALES_DAILY") {
      const today = format(new Date(), "yyyy-MM-dd");
      salesForm.setValue("from_date", today);
      salesForm.setValue("to_date", today);
    }
  }, [watchedSalesType, salesForm]);

  // Submit Handlers
  const handleGeneralSubmit = async (data: z.infer<typeof GeneralReportSchema>) => {
    try {
      setLoading(true);
      const isAdvanced = Object.keys(REPORT_TYPES).includes(data.reportType);
      const payload: any = {
        reportType: data.reportType,
        filters: {
          fromDate: new Date(data.fromDate),
          toDate: new Date(data.toDate),
          ...(isAdvanced && {
            customer_id: (data.customer_id && data.customer_id !== "ALL" ? Number(data.customer_id) : undefined) as number | undefined,
            product_type: data.product_type && data.product_type !== "ALL" ? data.product_type : undefined,
          }),
        },
      };

      const response = isAdvanced
        ? await ReportsApi.createAdvanced(payload)
        : await ReportsApi.createSummary(payload);

      setReportData(response.data?.data || response.data || []);
      setGrandTotal(response.data?.grand_total || null);
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
      const requiresDates = !["STOCK_VALUE", "STOCK_AGING", "LOW_STOCK"].includes(data.report_type);

      const payload = {
        report_type: data.report_type,
        ...(requiresDates && {
          from_date: data.from_date,
          to_date: data.to_date,
        }),
        ...(data.report_type === "STOCK_VALUE" && {
          item_category: data.item_category,
          item_sub_category: data.item_sub_category,
        }),
        ...(data.report_type === "MATERIAL_CONSUMPTION_SUMMARY" && {
          item_id: data.item_id,
        }),
        ...(data.report_type === "MATERIAL_CONSUMPTION_BY_JOB" && {
          job_id: data.job_id,
        }),
        ...(data.report_type === "GRN_REPORT" && {
          supplier_name: data.supplier_name,
        }),
      };

      const response = await ReportsApi.createCustomInventory(payload);
      setReportData(response.data?.data || response.data || []);
      setGrandTotal(response.data?.grand_total || null);
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
      setReportData(response.data?.data || response.data || []);
      setGrandTotal(response.data?.grand_total || null);
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
          customer_id: (data.customer_id && data.customer_id !== "ALL" ? Number(data.customer_id) : undefined) as number | undefined,
          salesperson: data.salesperson && data.salesperson !== "ALL" ? data.salesperson : undefined,
        },
      };

      const response = await ReportsApi.createAdvanced(payload);
      setReportData(response.data?.data || response.data || []);
      setGrandTotal(response.data?.grand_total || null);
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
    setSelectedSalesCurrency("");
    setSelectedSalespersonName("");
    generalForm.reset();
    inventoryForm.reset();
    salesForm.reset();
    quotationForm.reset();
  };

  // Watch values for dynamic field rendering
  const watchedGeneralType = generalForm.watch("reportType");
  const isGeneralAdvanced = Object.keys(REPORT_TYPES).includes(watchedGeneralType);

  const salesRequiresDates = watchedSalesType && !["SALES_BY_CUSTOMER", "SALES_BY_PRODUCT", "SALES_BY_SALESPERSON"].includes(watchedSalesType);

  const watchedInventoryType = inventoryForm.watch("report_type");
  const isInventoryAdvanced = ["CURRENT_STOCK", "STOCK_VALUE", "STOCK_AGING", "LOW_STOCK", "GRN_REPORT", "MATERIAL_CONSUMPTION_SUMMARY", "MATERIAL_CONSUMPTION_BY_JOB"].includes(watchedInventoryType);
  const inventoryRequiresDates = watchedInventoryType && !["STOCK_VALUE", "STOCK_AGING", "LOW_STOCK"].includes(watchedInventoryType);

  const suppliers = customer.filter((c) => c.customer_type?.toLowerCase() === "supplier" || c.customer_type?.toLowerCase() === "both");

  const formatNum = (num: any) => { const n = parseFloat(num); return isNaN(n) ? num : new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 }).format(n); };
  const formatCurrency = (num: any) => { const n = parseFloat(num); return isNaN(n) ? (num ?? "0.00") : new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n); };

  const extractConsumedQty = (row: any) => {
    if (!row || typeof row !== "object") return 0;
    const possibleKeys = [
      "consumed_qty", "consumed_quantity", "total_consumed", "qty_consumed",
      "issued_qty", "issued_quantity", "qty_issued", "used_qty", "used_quantity",
      "total_qty", "total_quantity", "material_qty", "material_quantity",
      "quantity", "qty", "item_qty", "item_quantity"
    ];

    for (const key of possibleKeys) {
      if (row[key] !== undefined && row[key] !== null && row[key] !== "") {
        const parsed = parseFloat(row[key]);
        if (!isNaN(parsed)) return parsed;
      }
    }

    for (const [k, v] of Object.entries(row)) {
      const lowerKey = k.toLowerCase();
      if (
        (lowerKey.includes("qty") || lowerKey.includes("quantity") || lowerKey.includes("consumed") || lowerKey.includes("issued")) &&
        v !== null && v !== undefined && v !== ""
      ) {
        const parsed = parseFloat(v as any);
        if (!isNaN(parsed)) return parsed;
      }
    }

    return 0;
  };

  const extractUnitPrice = (row: any, inv: any) => {
    if (!row) row = {};
    const priceCandidates = [
      row.unit_price, row.unitPrice, row.rate, row.price, row.item_unit_price, row.itemUnitPrice,
      row.unit_cost, row.unitCost, row.cost_price, row.costPrice, row.cost, row.purchase_price,
      row.purchasePrice, row.price_per_unit, row.rate_per_unit, row.avg_cost, row.avgCost,
      inv?.unit_price, inv?.unitPrice, inv?.rate, inv?.price, inv?.unit_cost, inv?.unitCost,
      inv?.cost_price, inv?.costPrice, inv?.cost, inv?.purchase_price, inv?.purchasePrice,
      inv?.price_per_unit, inv?.rate_per_unit, inv?.avg_cost, inv?.avgCost, inv?.item_unit_price, inv?.unit_rate
    ];
    for (const val of priceCandidates) {
      if (val !== undefined && val !== null && val !== "") {
        const p = parseFloat(String(val));
        if (!isNaN(p) && p > 0) return p;
      }
    }
    return 0;
  };

  const findInventoryItem = (row: any) => {
    if (!rawInventoryList || rawInventoryList.length === 0) return null;

    if (row.item_id) {
      const foundById = rawInventoryList.find(i => String(i.item_id) === String(row.item_id));
      if (foundById) return foundById;
    }

    const targetName = String(row.item_name || row.description || row.item_code || "").trim().toLowerCase();
    if (targetName) {
      const foundByName = rawInventoryList.find(i => {
        const invName = String(i.item_name || "").trim().toLowerCase();
        const fullLabel = `${i.item_sub_category || ""} ${i.item_name || ""} (${i.size || ""})`.trim().toLowerCase();
        const altLabel = `${i.item_sub_category || ""} ${i.item_name || ""}`.trim().toLowerCase();
        return invName === targetName || fullLabel === targetName || altLabel === targetName;
      });
      if (foundByName) return foundByName;

      const foundByPartial = rawInventoryList.find(i => {
        const invName = String(i.item_name || "").trim().toLowerCase();
        return invName.length > 3 && (targetName.includes(invName) || invName.includes(targetName));
      });
      if (foundByPartial) return foundByPartial;
    }

    return null;
  };

  const sortInventoryItemsByCategory = (items: any[]) => {
    if (!Array.isArray(items) || items.length === 0) return items;

    const normalRows: any[] = [];
    const totalRows: any[] = [];

    items.forEach((item) => {
      const isTotal =
        String(item.grn_id).toUpperCase() === "TOTAL" ||
        String(item.item_category).toUpperCase() === "TOTAL" ||
        String(item.stock_value).toUpperCase() === "TOTAL" ||
        Object.values(item).some((v) => String(v).toUpperCase() === "TOTAL");

      if (isTotal) {
        totalRows.push(item);
      } else {
        normalRows.push(item);
      }
    });

    normalRows.sort((a, b) => {
      const invA = findInventoryItem(a);
      const invB = findInventoryItem(b);

      const catA = String(a.item_category || a.itemCategory || a.category || invA?.item_category || "").toLowerCase();
      const catB = String(b.item_category || b.itemCategory || b.category || invB?.item_category || "").toLowerCase();
      const catCompare = catA.localeCompare(catB);
      if (catCompare !== 0) return catCompare;

      const subCatA = String(a.item_sub_category || a.itemSubCategory || a.subCategory || invA?.item_sub_category || "").toLowerCase();
      const subCatB = String(b.item_sub_category || b.itemSubCategory || b.subCategory || invB?.item_sub_category || "").toLowerCase();
      const subCatCompare = subCatA.localeCompare(subCatB);
      if (subCatCompare !== 0) return subCatCompare;

      const nameA = String(a.item_name || a.itemName || a.name || invA?.item_name || "").toLowerCase();
      const nameB = String(b.item_name || b.itemName || b.name || invB?.item_name || "").toLowerCase();
      return nameA.localeCompare(nameB, undefined, { numeric: true, sensitivity: "base" });
    });

    return [...normalRows, ...totalRows];
  };

  // Compute filtered data for rendering
  const filteredReportData = React.useMemo(() => {
    if (!reportData || reportData.length === 0) return [];
    let data = [...reportData];

    if (activeTab === "sales") {
      if (watchedSalesType === "SALES_BY_CUSTOMER") {
        if (selectedSalesCustomerId && selectedSalesCustomerId !== "ALL") {
          data = data.filter((row: any) => String(row.customer_id) === String(selectedSalesCustomerId));
        }
        if (selectedSalesCurrency && selectedSalesCurrency !== "ALL") {
          data = data.filter((row: any) => String(row.currency || "").toLowerCase() === selectedSalesCurrency.toLowerCase());
        }
      } else if (watchedSalesType === "SALES_BY_SALESPERSON" && selectedSalespersonName && selectedSalespersonName !== "ALL") {
        data = data.filter((row: any) => String(row.salesperson || "").trim().toLowerCase() === String(selectedSalespersonName).trim().toLowerCase());
      } else if (watchedSalesType === "SALES_BY_PRODUCT") {
        data = sortInventoryItemsByCategory(data);
      }
      
      data = data.map((row: any, index: number) => {
        if (watchedSalesType === "SALES_DAILY") {
            return {
                "#": index + 1,
                "Sales Date": row.sales_date ? format(new Date(row.sales_date), "yyyy-MM-dd") : "-",
                "Currency": row.currency || "-",
                "Total Orders": formatNum(row.total_orders),
                "Total Sales": formatCurrency(row.total_sales)
            };
        }
        if (watchedSalesType === "SALES_MONTHLY") {
            return {
                "#": index + 1,
                "Sales Month": row.sales_month || "-",
                "Currency": row.currency || "-",
                "Total Orders": formatNum(row.total_orders),
                "Total Sales": formatCurrency(row.total_sales)
            };
        }
        if (watchedSalesType === "SALES_WEEKLY") {
            return {
                "#": index + 1,
                "Sales Week": row.sales_week || "-",
                "Week Start Date": row.week_start_date ? format(new Date(row.week_start_date), "yyyy-MM-dd") : "-",
                "Week End Date": row.week_end_date ? format(new Date(row.week_end_date), "yyyy-MM-dd") : "-",
                "Currency": row.currency || "-",
                "Total Orders": formatNum(row.total_orders),
                "Total Sales": formatCurrency(row.total_sales)
            };
        }
        if (watchedSalesType === "SALES_BY_CUSTOMER") {
            return {
                "#": index + 1,
                "Customer ID": row.customer_id || "-",
                "Company Name": row.company_name || "-",
                "Currency": row.currency || "-",
                "Total Orders": formatNum(row.total_orders),
                "Total Sales": formatCurrency(row.total_sales)
            };
        }
        if (watchedSalesType === "SALES_BY_PRODUCT") {
            return {
                "#": index + 1,
                "Item Category": row.item_category || row.category || "-",
                "Item Sub Category": row.item_sub_category || row.sub_category || "-",
                "Item Code": row.item_code || "-",
                "Description": row.description || row.item_name || "-",
                "Currency": row.currency || "-",
                "Total Quantity": formatNum(row.total_qty || row.quantity),
                "Total Sales": formatCurrency(row.total_sales)
            };
        }
        if (watchedSalesType === "SALES_BY_SALESPERSON") {
            return {
                "#": index + 1,
                "Salesperson": row.salesperson || "-",
                "Currency": row.currency || "-",
                "Total Orders": formatNum(row.total_orders),
                "Total Sales": formatCurrency(row.total_sales)
            };
        }
        return row;
      });
    } else if (activeTab === "general" && watchedGeneralType === "jobs") {
      data = data.map((row: any, index: number) => {
        // Try to find the full job ticket info if missing
        const jobInfo = jobList.find(j => String(j.value) === String(row.job_id))?.fullJob || {};

        // Try to find the associated quotation to get unit price
        const poId = row.po_id || jobInfo.po_id;
        const quotation = quotationList.find(q => String(q.quote_id) === String(poId));

        // Match item within quotation if possible, or fallback to first item
        const quoteItem = quotation?.items?.find((i: any) => i.item_category === row.product_type || i.item_description === row.job_name) || quotation?.items?.[0];

        const unitPrice = parseFloat(row.unit_price || row.item_unit_price || row.price || quoteItem?.item_unit_price) || 0;
        const quantity = parseFloat(row.quantity || jobInfo.quantity) || 0;

        const customerObj = customer.find((c) => String(c.customer_id) === String(row.customer_id));
        const customerName = customerObj?.company_name || row.customer_name || row.company_name || row.customer_id || "-";

        const poNumber = row.po_number || row.customer_po || row.po_no || jobInfo.customer_po || poId || "-";

        return {
          "#": index + 1,
          "Job ID (Job Number)": row.job_number || row.job_id || jobInfo.job_number || "-",
          "Customer Name": customerName,
          "Job Name": row.job_name || jobInfo.job_name || "-",
          "Product Type": row.product_type || jobInfo.product_type || "-",
          "Quantity": formatNum(quantity),
          "Job Open Date": row.job_open_date || jobInfo.job_open_date ? format(new Date(row.job_open_date || jobInfo.job_open_date), "yyyy-MM-dd") : "-",
          "PO Number": poNumber,
          "Currency": row.currency || jobInfo.currency || "-",
          "Unit Price": formatNum(unitPrice),
          "Revenue": formatNum(unitPrice * quantity),
          "Created On": row.created_on ? format(new Date(row.created_on), "yyyy-MM-dd") : "-",
          "Created By": row.created_by || "-",
          "Update On": row.updated_on ? format(new Date(row.updated_on), "yyyy-MM-dd") : "-",
          "Updated By": row.updated_by || "-",
        };
      });
    } else if (activeTab === "general" && watchedGeneralType === "main_inventory") {
      data = sortInventoryItemsByCategory(data);
      data = data.map((row: any, index: number) => {
        const qty = parseFloat(row.quantity || 0);
        return {
          "#": index + 1,
          "Item ID": row.item_id || row.id || "-",
          "Item Category": row.item_category || "-",
          "Item Sub Category": row.item_sub_category || "-",
          "Item Name": row.item_name || "-",
          "Unit Price": formatCurrency(row.unit_price || row.item_unit_price || row.price || 0),
          "Size": (!row.size || String(row.size).trim().toLowerCase() === "x") ? "-" : row.size,
          "Quantity": formatNum(qty),
          "UOM": row.uom || "-",
          "Width": row.width || "-",
          "Height": row.height || "-",
          "Rate": formatCurrency(row.rate || 0),
          "Status": row.status || "-",
          "Created By": row.created_by || "-",
          "Created On": row.created_on ? format(new Date(row.created_on), "yyyy-MM-dd") : "-",
          "Updated By": row.updated_by || "-",
          "Updated On": row.updated_on ? format(new Date(row.updated_on), "yyyy-MM-dd") : "-",
        };
      });
    } else if (activeTab === "general" && watchedGeneralType === "dispatch") {
      data = data.map((row: any, index: number) => {
        const jobInfo = jobList.find(j => String(j.value) === String(row.job_id))?.fullJob || {};
        const customerObj = customer.find((c) => String(c.customer_id) === String(row.customer_id));
        const customerName = customerObj?.company_name || row.customer_name || row.company_name || row.customer_id || "-";
        
        const dispatchQty = parseFloat(row.dispatch_qty || row.quantity) || 0;

        return {
          "#": index + 1,
          "Dispatch ID": row.dispatch_id || row.id || "-",
          "Customer Name": customerName,
          "Delivery Address": row.delivery_address || customerObj?.address || "-",
          "Job ID": row.job_number ? <><span className="font-bold">{row.job_number}</span> {row.job_name || ""}</> : (jobInfo.job_number ? <><span className="font-bold">{jobInfo.job_number}</span> {jobInfo.job_name || ""}</> : row.job_id || "-"),
          "Dispatch Note": row.dispatch_note || "-",
          "Dispatch Date": row.dispatch_date ? format(new Date(row.dispatch_date), "yyyy-MM-dd") : "-",
          "Dispatch Qty": formatNum(dispatchQty),
          "Note": row.note || "-",
          "Created By": row.created_by || "-",
          "Created On": row.created_on ? format(new Date(row.created_on), "yyyy-MM-dd") : "-",
          "Updated By": row.updated_by || "-",
          "Updated On": row.updated_on ? format(new Date(row.updated_on), "yyyy-MM-dd") : "-",
        };
      });
    } else if (activeTab === "general" && watchedGeneralType === "DISPATCH_INSIGHTS") {
      if (selectedDispatchStatus && selectedDispatchStatus !== "all") {
        data = data.filter((row: any) => row.status === selectedDispatchStatus);
      }
      data = data.map((row: any, index: number) => {
        const orderQty = parseFloat(row.order_qty || row.quantity) || 0;
        const dispatchQty = parseFloat(row.dispatch_qty) || 0;
        const balanceQty = orderQty - dispatchQty;

        let daysPending = "-";
        const rowStatus = row.status?.toUpperCase() || "";
        if (rowStatus === "PARTIALLY DISPATCH" || rowStatus === "PARTIALLY DISPATCHED" || rowStatus === "PARTIALLY DISPATHCED") {
          const openDate = new Date(row.job_open_date);
          const currentDate = new Date();
          const diffTime = currentDate.getTime() - openDate.getTime();
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          daysPending = diffDays >= 0 ? `${diffDays} Days` : "0 Days";
        }

        return {
          "#": index + 1,
          "Dispatch ID": row.dispatch_id || "-",
          "Customer Name": row.customer_name || row.company_name || "-",
          "Job ID": row.job_number ? <><span className="font-bold">{row.job_number}</span> {row.job_name || ""}</> : row.job_id || "-",
          "Dispatch note": row.dispatch_note || "-",
          "Dispatch Date": row.dispatch_date ? format(new Date(row.dispatch_date), "yyyy-MM-dd") : "-",
          "Order Qty": formatNum(orderQty),
          "Dispatch Qty": formatNum(dispatchQty),
          "Balance Qty": formatNum(balanceQty),
          "Status": row.status || "-",
          "Days Aging": daysPending,
          "Created On": row.created_on ? format(new Date(row.created_on), "yyyy-MM-dd") : "-",
          "Created By": row.created_by || "-",
          "Update On": row.updated_on ? format(new Date(row.updated_on), "yyyy-MM-dd") : "-",
          "Updated By": row.updated_by || "-",
        };
      });
    } else if (activeTab === "general" && watchedGeneralType === "purchase_orders") {
      const groupedPOs = data.reduce((acc: any, row: any) => {
        const poId = row.po_id;
        if (!acc[poId]) {
          acc[poId] = { ...row, items: [] };
        }
        if (row.item_type || row.item_code || row.item_name || row.description) {
          acc[poId].items.push({
            type: (row.item_type && row.item_type !== "undefined" && row.item_type !== "null" && row.item_type !== "") ? row.item_type : (row.item_uom && !isNaN(Number(row.item_uom))) ? (Object.values(PRODUCT_TYPES)[Number(row.item_uom) - 1] || "-") : "-",
            name: row.item_name || row.description || "-",
            qty: parseFloat(row.item_qty || row.quantity) || 0,
            price: parseFloat(row.item_price || row.price) || 0,
          });
        }
        return acc;
      }, {});

      data = Object.values(groupedPOs).map((po: any, index: number) => {
        const poTypeName = po.po_type_id === 1 ? "TIEP" : po.po_type_id === 2 ? "NON-TIEP" : po.po_type_id === 3 ? "MP" : String(po.po_type_id || "-");

        const itemTypes = po.items.length > 0 ? po.items.map((i: any) => i.type).join("\n") : "-";
        const itemNames = po.items.length > 0 ? po.items.map((i: any) => i.name).join("\n") : "-";
        const itemQtys = po.items.length > 0 ? po.items.map((i: any) => formatNum(i.qty)).join("\n") : "-";
        const itemPrices = po.items.length > 0 ? po.items.map((i: any) => formatNum(i.price)).join("\n") : "-";
        const itemTotals = po.items.length > 0 ? po.items.map((i: any) => formatNum(i.qty * i.price)).join("\n") : "-";
        const grandTotal = po.items.reduce((sum: number, i: any) => sum + (i.qty * i.price), 0);

        return {
          "#": index + 1,
          "PO Type": poTypeName,
          "Quotation ID": po.quote_id || "-",
          "PO NO": po.customer_po || po.po_no || "-",
          "Customer Name": po.customer_name || po.company_name || "-",
          "Item Types": itemTypes,
          "Item Names": itemNames,
          "Item Qtys": itemQtys,
          "Currency": po.currency || "-",
          "Item Prices": itemPrices,
          "Item Totals": itemTotals,
          "PO Grand Total": formatNum(grandTotal),
          "Created On": po.created_on ? format(new Date(po.created_on), "yyyy-MM-dd") : "-",
          "Created By": po.created_by || "-",
          "Update On": po.updated_on ? format(new Date(po.updated_on), "yyyy-MM-dd") : "-",
          "Updated By": po.updated_by || "-",
        };
      });
    } else if (activeTab === "general" && watchedGeneralType === "quotations") {
      data = data.map((row: any, index: number) => {
        const quotationType = row.type_id === 1 ? "NORMAL" : row.type_id === 2 ? "OPTIONAL" : String(row.type_id || "-");
        const taxType = row.tax_type_id === 0 ? "VAT" : row.tax_type_id === 1 ? "TIEP" : "NONE";
        
        const matchedCustomer = customer.find((c) => String(c.customer_id) === String(row.customer_id));
        const customerName = matchedCustomer ? matchedCustomer.company_name : row.customer_id || "-";

        return {
          "#": index + 1,
          "Quote Id": row.quote_id || "-",
          "Customer Name": customerName,
          "Quotation Type": quotationType,
          "Delivery Days": row.delivery_days || "-",
          "Tax Type": taxType,
          "Currency": row.currency || "-",
          "Sub Total": row.sub_total !== null ? formatNum(row.sub_total) : "-",
          "No Of Items": row.no_of_items || "-",
          "Total Without Tax": row.total_without_tax !== null ? formatNum(row.total_without_tax) : "-",
          "Net Total": row.net_total !== null ? formatNum(row.net_total) : "-",
          "Contact Person": row.contact_person || "-",
          "Marketing Person": row.marketing_person || "-",
          "Notes": row.notes || "-",
          "Status": row.status || "-",
          "Validity Period": row.validity_period || "-",
          "Created On": row.created_on ? format(new Date(row.created_on), "yyyy-MM-dd") : "-",
          "Created By": row.created_by || "-",
          "Updated On": row.updated_on ? format(new Date(row.updated_on), "yyyy-MM-dd") : "-",
          "Updated By": row.updated_by || "-",
        };
      });
    } else if (activeTab === "inventory") {
      const selectedCat = inventoryForm.watch("item_category");
      const selectedSubCat = inventoryForm.watch("item_sub_category");

      if (selectedCat && selectedCat !== "ALL") {
        data = data.filter((row: any) => String(row.item_category || row.category || "").toLowerCase() === selectedCat.toLowerCase());
      }
      if (selectedSubCat && selectedSubCat !== "ALL") {
        data = data.filter((row: any) => String(row.item_sub_category || row.subCategory || "").toLowerCase() === selectedSubCat.toLowerCase());
      }

      data = sortInventoryItemsByCategory(data);

      if (watchedInventoryType === "GRN_REPORT") {
        const mapped = data.map((row: any, index: number) => {
          const inv = findInventoryItem(row);
          const isTotal = String(row.grn_id).toUpperCase() === "TOTAL" || String(row.item_category).toUpperCase() === "TOTAL";
          if (isTotal) {
            return {
              "#": "",
              "Grn Id": "TOTAL",
              "Supplier Name": "",
              "Received Date": "",
              "Item Category": "",
              "Item Sub Category": "",
              "Item Name": "",
              "Size": "",
              "Quantity": "",
              "Rate": "",
              "Amount": formatCurrency(row.amount),
              "Created By": "",
              "Updated By": "",
            };
          }

          const grnObj = grnList.find(g => 
            String(g.id) === String(row.grn_id) || 
            String(g.grn_id) === String(row.grn_id) ||
            (g.supplier_name && String(g.supplier_name).toLowerCase() === String(row.supplier_name || "").toLowerCase())
          );

          const createdByRaw = row.created_by || row.createdBy || row.created_by_user || row.creator || row.created_user || row.created_by_name || grnObj?.created_by || grnObj?.createdBy;
          const updatedByRaw = row.updated_by || row.updatedBy || row.updated_by_user || row.updater || row.updated_user || row.updated_by_name || grnObj?.updated_by || grnObj?.updatedBy;

          const resolveUserName = (val: any) => {
            if (val === undefined || val === null || val === "" || val === "-") return "-";
            const strVal = String(val).trim();
            if (!strVal || strVal === "-") return "-";

            if (userList && userList.length > 0) {
              const matched = userList.find((u: any) => 
                String(u.user_id || u.id) === strVal || 
                String(u.id) === strVal || 
                String(u.name || "").toLowerCase() === strVal.toLowerCase() || 
                String(u.email || "").toLowerCase() === strVal.toLowerCase() ||
                String(u.username || "").toLowerCase() === strVal.toLowerCase()
              );
              if (matched) {
                return (matched as any).name || (matched as any).full_name || (matched as any).username || strVal;
              }
            }

            return strVal;
          };

          return {
            "#": (index + 1) as any,
            "Grn Id": row.grn_id || "-",
            "Supplier Name": row.supplier_name || "-",
            "Received Date": row.received_date ? format(new Date(row.received_date), "yyyy-MM-dd") : "-",
            "Item Category": row.item_category || inv?.item_category || "-",
            "Item Sub Category": row.item_sub_category || inv?.item_sub_category || "-",
            "Item Name": row.item_name || inv?.item_name || "-",
            "Size": row.size || inv?.size || "-",
            "Quantity": formatNum(row.quantity),
            "Rate": formatCurrency(row.rate || inv?.unit_price || 0),
            "Amount": formatCurrency(row.amount),
            "Created By": resolveUserName(createdByRaw),
            "Updated By": resolveUserName(updatedByRaw),
          };
        });

        const hasTotal = mapped.some((r: any) => String(r["Grn Id"]).toUpperCase() === "TOTAL");
        if (!hasTotal && mapped.length > 0) {
          const totalQty = mapped.reduce((sum: number, r: any) => sum + (parseFloat(String(r["Quantity"]).replace(/,/g, "")) || 0), 0);
          const totalAmt = mapped.reduce((sum: number, r: any) => sum + (parseFloat(String(r["Amount"]).replace(/,/g, "")) || 0), 0);
          mapped.push({
            "#": "",
            "Grn Id": "TOTAL",
            "Supplier Name": "",
            "Received Date": "",
            "Item Category": "",
            "Item Sub Category": "",
            "Item Name": `Total Items: ${mapped.length}`,
            "Size": "",
            "Quantity": formatNum(totalQty),
            "Rate": "",
            "Amount": formatCurrency(totalAmt),
            "Created By": "",
            "Updated By": "",
          });
        }
        data = mapped;
      } else if (watchedInventoryType === "STOCK_VALUE") {
        const mapped = data.map((row: any, index: number) => {
          const inv = findInventoryItem(row);
          const isTotal = String(row.stock_value).toUpperCase() === "TOTAL" || String(row.item_category).toUpperCase() === "TOTAL";
          if (isTotal) {
            return {
              "#": "",
              "Item Category": "TOTAL",
              "Item Sub Category": "",
              "Item Name": "",
              "Size": "",
              "Quantity": formatNum(row.quantity),
              "Unit Rate": "",
              "Stock Value": formatCurrency(row.stock_value)
            };
          }
          return {
            "#": (index + 1) as any,
            "Item Category": row.item_category || inv?.item_category || "-",
            "Item Sub Category": row.item_sub_category || inv?.item_sub_category || "-",
            "Item Name": row.item_name || inv?.item_name || "-",
            "Size": row.size || inv?.size || "-",
            "Quantity": formatNum(row.quantity),
            "Unit Rate": formatCurrency(row.unit_rate || row.rate || inv?.unit_price || 0),
            "Stock Value": formatCurrency(row.stock_value)
          };
        });

        const hasTotal = mapped.some((r: any) => String(r["Item Category"]).toUpperCase() === "TOTAL");
        if (!hasTotal && mapped.length > 0) {
          const totalQty = mapped.reduce((sum: number, r: any) => sum + (parseFloat(String(r["Quantity"]).replace(/,/g, "")) || 0), 0);
          const totalVal = mapped.reduce((sum: number, r: any) => sum + (parseFloat(String(r["Stock Value"]).replace(/,/g, "")) || 0), 0);
          mapped.push({
            "#": "",
            "Item Category": "TOTAL",
            "Item Sub Category": "",
            "Item Name": `Total Items: ${mapped.length}`,
            "Size": "",
            "Quantity": formatNum(totalQty),
            "Unit Rate": "",
            "Stock Value": formatCurrency(totalVal)
          });
        }
        data = mapped;
      } else if (watchedInventoryType === "CURRENT_STOCK") {
        const mapped = data.map((row: any, index: number) => {
          const inv = findInventoryItem(row);
          return {
            "#": (index + 1) as any,
            "Item Category": row.item_category || inv?.item_category || "-",
            "Item Sub Category": row.item_sub_category || inv?.item_sub_category || "-",
            "Item Name": row.item_name || inv?.item_name || "-",
            "Size": row.size || inv?.size || "-",
            "Item ID": row.item_id || inv?.item_id || "-",
            "UOM": row.unit_of_measure || row.uom || inv?.unit_of_measure || "-",
            "Available Qty": formatNum(row.available_qty || row.quantity)
          };
        });

        const hasTotal = mapped.some((r: any) => String(r["Item Category"]).toUpperCase() === "TOTAL");
        if (!hasTotal && mapped.length > 0) {
          const totalQty = mapped.reduce((sum: number, r: any) => sum + (parseFloat(String(r["Available Qty"]).replace(/,/g, "")) || 0), 0);
          mapped.push({
            "#": "",
            "Item Category": "TOTAL",
            "Item Sub Category": "",
            "Item Name": `Total Items: ${mapped.length}`,
            "Size": "",
            "Item ID": "",
            "UOM": "",
            "Available Qty": formatNum(totalQty)
          });
        }
        data = mapped;
      } else if (watchedInventoryType === "STOCK_AGING") {
        const getAgingDays = (row: any, inv: any) => {
          const possibleDays = [
            row.aging_days, row.agingDays, row.days, row.Days, row.aging, row.Aging,
            row.age_in_days, row.ageInDays, row.stock_aging_days, row.stockAgingDays,
            row.age, row.Age, row.days_old, row.daysOld, row.item_age, row.itemAge,
            row.aging_in_days, row.agingInDays, inv?.aging_days, inv?.agingDays, inv?.days
          ];
          for (const val of possibleDays) {
            if (val !== undefined && val !== null && val !== "") {
              const numVal = Number(val);
              if (!isNaN(numVal)) {
                return `${Math.floor(numVal)} Days`;
              }
              if (typeof val === "string" && val.trim() !== "") {
                const cleaned = val.trim();
                const extractedNum = parseFloat(cleaned.replace(/[^0-9.-]/g, ""));
                if (!isNaN(extractedNum)) {
                  return `${Math.floor(extractedNum)} Days`;
                }
                return cleaned;
              }
            }
          }

          const dateVal = row.last_movement || row.last_movement_date || row.received_date || row.grn_date || row.created_on || row.created_at || inv?.created_on || inv?.created_at;
          if (dateVal) {
            const d = new Date(dateVal);
            if (!isNaN(d.getTime())) {
              const diffTime = new Date().getTime() - d.getTime();
              const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
              return diffDays >= 0 ? `${diffDays} Days` : "0 Days";
            }
          }

          return "-";
        };

        const mapped = data.map((row: any, index: number) => {
          const inv = findInventoryItem(row);
          const daysDisplay = getAgingDays(row, inv);
          const dateVal = row.last_movement || row.received_date || row.created_on || inv?.created_on;
          let formattedDate = "-";
          if (dateVal) {
            try {
              formattedDate = format(new Date(dateVal), "yyyy-MM-dd");
            } catch (_e) {
              formattedDate = String(dateVal);
            }
          }

          return {
            "#": (index + 1) as any,
            "Item Category": row.item_category || inv?.item_category || "-",
            "Item Sub Category": row.item_sub_category || inv?.item_sub_category || "-",
            "Item Name": row.item_name || inv?.item_name || "-",
            "Size": row.size || inv?.size || "-",
            "Quantity": formatNum(row.quantity || row.qty || inv?.quantity || 0),
            "Aging (Days)": daysDisplay,
            "Last Movement": formattedDate
          };
        });

        const hasTotal = mapped.some((r: any) => String(r["Item Category"]).toUpperCase() === "TOTAL");
        if (!hasTotal && mapped.length > 0) {
          const totalQty = mapped.reduce((sum: number, r: any) => sum + (parseFloat(String(r["Quantity"]).replace(/,/g, "")) || 0), 0);
          mapped.push({
            "#": "",
            "Item Category": "TOTAL",
            "Item Sub Category": "",
            "Item Name": `Total Items: ${mapped.length}`,
            "Size": "",
            "Quantity": formatNum(totalQty),
            "Aging (Days)": "",
            "Last Movement": ""
          });
        }
        data = mapped;
      } else if (watchedInventoryType === "LOW_STOCK") {
        data = data.map((row: any, index: number) => {
          const inv = findInventoryItem(row);
          return {
            "#": (index + 1) as any,
            "Item Category": row.item_category || inv?.item_category || "-",
            "Item Sub Category": row.item_sub_category || inv?.item_sub_category || "-",
            "Item Name": row.item_name || inv?.item_name || "-",
            "Size": row.size || inv?.size || "-",
            "Available Qty": formatNum(row.available_qty || row.quantity),
            "Reorder Level": formatNum(row.reorder_level || row.reorder_qty || inv?.reorder_level || 0),
            "Status": row.status || inv?.status || "LOW STOCK"
          };
        });
      } else if (watchedInventoryType === "MATERIAL_CONSUMPTION_SUMMARY") {
        const mapped = data.map((row: any, index: number) => {
          const inv = findInventoryItem(row);
          const category = row.item_category || row.category || inv?.item_category || "-";
          const subCategory = row.item_sub_category || row.sub_category || inv?.item_sub_category || "-";
          const name = row.item_name || row.description || inv?.item_name || "-";
          const size = row.size || inv?.size || (inv?.width && inv?.height ? `${inv.width} x ${inv.height}` : "-");
          const uom = row.uom || row.unit_of_measure || inv?.unit_of_measure || "-";
          const consumedQty = extractConsumedQty(row);
          let unitPrice = extractUnitPrice(row, inv);
          let rawTotal = parseFloat(String(row.total_amount || row.total_cost || row.amount || 0));
          if (rawTotal > 0 && unitPrice === 0 && consumedQty > 0) {
            unitPrice = rawTotal / consumedQty;
          }
          const totalAmount = rawTotal > 0 ? rawTotal : (consumedQty * unitPrice);

          return {
            "#": (index + 1) as any,
            "Item Category": category,
            "Item Sub Category": subCategory,
            "Item Name": name,
            "Size": size,
            "UOM": uom,
            "Consumed Qty": formatNum(consumedQty),
            "Unit Price": formatCurrency(unitPrice),
            "Total Amount": formatCurrency(totalAmount)
          };
        });

        const hasTotal = mapped.some((r: any) => String(r["Item Category"]).toUpperCase() === "TOTAL");
        if (!hasTotal && mapped.length > 0) {
          const totalQty = mapped.reduce((sum: number, r: any) => sum + (parseFloat(String(r["Consumed Qty"]).replace(/,/g, "")) || 0), 0);
          const totalAmt = mapped.reduce((sum: number, r: any) => sum + (parseFloat(String(r["Total Amount"]).replace(/,/g, "")) || 0), 0);
          mapped.push({
            "#": "",
            "Item Category": "TOTAL",
            "Item Sub Category": "",
            "Item Name": `Total Items: ${mapped.length}`,
            "Size": "",
            "UOM": "",
            "Consumed Qty": formatNum(totalQty),
            "Unit Price": "",
            "Total Amount": formatCurrency(totalAmt)
          });
        }
        data = mapped;
      } else if (watchedInventoryType === "MATERIAL_CONSUMPTION_BY_JOB") {
        const mapped = data.map((row: any, index: number) => {
          const inv = findInventoryItem(row);

          let jobKey = row.job_id || row.jobId || row.job_number || row.jobNumber || row.job_no || row.jobNo || row.job_ticket_id || row.job_ticket_no || row.ticket_id || row.ticket_no;
          if (!jobKey) {
            const foundKey = Object.keys(row).find(k => k.toLowerCase().includes("job"));
            if (foundKey) jobKey = row[foundKey];
          }

          let matchedJob = jobList.find(j => {
            const fj = j.fullJob || {};
            return (
              String(j.value) === String(jobKey) || 
              String(fj.job_id) === String(jobKey) || 
              String(fj.id) === String(jobKey) || 
              String(fj.job_number) === String(jobKey) ||
              String(fj.job_number) === String(row.job_number || row.job_id) ||
              (row.job_name && String(fj.job_name || "").toLowerCase() === String(row.job_name || "").toLowerCase())
            );
          })?.fullJob;

          if (!matchedJob && issueNotesList.length > 0) {
            const targetItemId = row.item_id || inv?.item_id;
            const targetItemName = String(row.item_name || inv?.item_name || "").trim().toLowerCase();

            const foundNote = issueNotesList.find((note: any) => {
              if (!note.items || !Array.isArray(note.items)) return false;
              return note.items.some((it: any) => {
                if (targetItemId && String(it.item_id) === String(targetItemId)) return true;
                const name = String(it.item_name || "").trim().toLowerCase();
                return name && targetItemName && (name.includes(targetItemName) || targetItemName.includes(name));
              });
            });

            if (foundNote && (foundNote.job_id || foundNote.job_number)) {
              const noteJobKey = foundNote.job_id || foundNote.job_number;
              matchedJob = jobList.find(j => {
                const fj = j.fullJob || {};
                return (
                  String(j.value) === String(noteJobKey) || 
                  String(fj.job_id) === String(noteJobKey) ||
                  String(fj.id) === String(noteJobKey) ||
                  String(fj.job_number) === String(noteJobKey)
                );
              })?.fullJob;
            }
          }

          const selectedJobIdInForm = inventoryForm.watch("job_id");
          const selectedJobInForm = (selectedJobIdInForm && selectedJobIdInForm !== "ALL") 
            ? jobList.find(j => String(j.value) === String(selectedJobIdInForm) || String(j.fullJob?.job_id) === String(selectedJobIdInForm))?.fullJob
            : null;

          const finalJob = matchedJob || selectedJobInForm || {};

          let rawJobId = row.job_number || row.job_id || row.jobId || row.job_no || finalJob.job_number || (finalJob.job_id ? `MPL/${String(finalJob.job_id).padStart(4, "0")}/26/TIEP` : (finalJob.id ? `MPL/${String(finalJob.id).padStart(4, "0")}/26/TIEP` : "-"));
          let jobIdDisplay = "-";
          if (rawJobId && rawJobId !== "-") {
            const strVal = String(rawJobId).trim();
            if (strVal.startsWith("MPL/")) {
              jobIdDisplay = strVal;
            } else if (!isNaN(Number(strVal))) {
              jobIdDisplay = `MPL/${strVal.padStart(4, "0")}/26/TIEP`;
            } else {
              jobIdDisplay = strVal;
            }
          }

          const jobNameDisplay = row.job_name || row.jobName || finalJob.job_name || finalJob.name || "-";

          const category = row.item_category || row.category || inv?.item_category || "-";
          const subCategory = row.item_sub_category || row.sub_category || inv?.item_sub_category || "-";
          const name = row.item_name || row.description || inv?.item_name || "-";
          const size = row.size || inv?.size || (inv?.width && inv?.height ? `${inv.width} x ${inv.height}` : "-");
          const consumedQty = extractConsumedQty(row);
          let unitPrice = extractUnitPrice(row, inv);
          let rawTotal = parseFloat(String(row.total_cost || row.total_amount || row.amount || 0));
          if (rawTotal > 0 && unitPrice === 0 && consumedQty > 0) {
            unitPrice = rawTotal / consumedQty;
          }
          const totalCost = rawTotal > 0 ? rawTotal : (consumedQty * unitPrice);

          return {
            "#": (index + 1) as any,
            "Job ID": jobIdDisplay,
            "Job Name": jobNameDisplay,
            "Item Category": category,
            "Item Sub Category": subCategory,
            "Item Name": name,
            "Size": size,
            "Consumed Qty": formatNum(consumedQty),
            "Unit Price": formatCurrency(unitPrice),
            "Total Cost": formatCurrency(totalCost)
          };
        });

        const hasTotal = mapped.some((r: any) => String(r["Job ID"]).toUpperCase() === "TOTAL" || String(r["Item Category"]).toUpperCase() === "TOTAL");
        if (!hasTotal && mapped.length > 0) {
          const totalQty = mapped.reduce((sum: number, r: any) => sum + (parseFloat(String(r["Consumed Qty"]).replace(/,/g, "")) || 0), 0);
          const totalCost = mapped.reduce((sum: number, r: any) => sum + (parseFloat(String(r["Total Cost"]).replace(/,/g, "")) || 0), 0);
          mapped.push({
            "#": "",
            "Job ID": "TOTAL",
            "Job Name": `Total Items: ${mapped.length}`,
            "Item Category": "",
            "Item Sub Category": "",
            "Item Name": "",
            "Size": "",
            "Consumed Qty": formatNum(totalQty),
            "Unit Price": "",
            "Total Cost": formatCurrency(totalCost)
          });
        }
        data = mapped;
      }
    }

    return data.map((row: any, index: number) => {
      // If row already has a '#' property, it was mapped manually above
      if ("#" in row) return row;
      
      // Check if this is a totals row
      const isTotalRow = Object.values(row).some(v => String(v).toUpperCase() === "TOTAL");
      
      const formattedRow: any = { "#": isTotalRow ? "" : index + 1, ...row };
      const keysToFormat = ["quantity", "qty", "amount", "price", "rate", "total", "revenue", "value", "consumed", "stock_value", "level"];
      const excludeKeys = ["id", "date", "name", "category", "status", "type", "person", "notes", "period", "currency", "no_of"];

      Object.keys(formattedRow).forEach(k => {
        const lowerKey = k.toLowerCase();
        if (
          keysToFormat.some(nKey => lowerKey.includes(nKey)) && 
          !excludeKeys.some(eKey => lowerKey.includes(eKey)) && 
          formattedRow[k] !== null && 
          formattedRow[k] !== undefined && 
          formattedRow[k] !== "" && 
          !isNaN(Number(formattedRow[k]))
        ) {
          let val = formatNum(formattedRow[k]);
          if (activeTab === "quotation" && (lowerKey.includes("value") || lowerKey.includes("amount") || lowerKey.includes("total_sales"))) {
             // Keep it two decimal places for currency if it's not already
             if (!String(val).includes(".")) {
                 val = formatNum(Number(formattedRow[k]).toFixed(2));
             }
             val = `LKR ${val}`;
          }
          formattedRow[k] = val;
        }
      });

      return formattedRow;
    });
  }, [reportData, activeTab, watchedSalesType, selectedSalesCustomerId, selectedSalesCurrency, selectedSalespersonName, watchedGeneralType, jobList, quotationList, customer, selectedDispatchStatus]);

  const reportFilename = React.useMemo(() => {
    let name = "Report";
    if (activeTab === "general") {
      const type = watchedGeneralType;
      const generalLabels: Record<string, string> = {
        customers: "Customers Report",
        main_inventory: "Main Inventory Report",
        dispatch: "Dispatch Report",
        jobs: "Jobs Report",
        purchase_orders: "Purchase Orders Report",
        quotations: "Quotations Report",
      };
      name = generalLabels[type] || REPORT_TYPES[type as keyof typeof REPORT_TYPES] || type || "General Report";
    } else if (activeTab === "inventory") {
      const type = watchedInventoryType;
      const found = INVENTORY_REPORT_TYPES.find((r) => r.value === type);
      name = found ? found.label : "Inventory Report";
    } else if (activeTab === "sales") {
      const type = watchedSalesType;
      const found = SALES_REPORT_TYPES.find((r) => r.value === type);
      name = found ? found.label : "Sales Report";
    } else if (activeTab === "quotation") {
      const type = watchedQuotationType;
      const found = QUOTATION_REPORT_TYPES.find((r) => r.value === type);
      name = found ? found.label : "Quotation Report";
    }

    const cleanName = String(name || "Report")
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9_-]/g, "");

    const dateStr = format(new Date(), "yyyy-MM-dd");
    return `${cleanName}_${dateStr}`;
  }, [activeTab, watchedGeneralType, watchedInventoryType, watchedSalesType, watchedQuotationType]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-[24px] pt-0 mt-3 w-full min-w-0 overflow-hidden">
      <PageTitleWithBreadcrumb
        title="Reports Management"
        breadcrumbs={[{ title: "Dashboard", href: "/dashboard" }]}
      />

      <Tabs value={activeTab} onValueChange={clearResultsAndReset} className="w-full mt-4">
        <TabsList className="grid w-full max-w-[650px] grid-cols-4 bg-muted">
          <TabsTrigger value="general" onClick={() => { setReportData([]); setGrandTotal(null); }}>
            General Reports
          </TabsTrigger>
          <TabsTrigger value="inventory" onClick={() => { setReportData([]); setGrandTotal(null); }}>
            Inventory Reports
          </TabsTrigger>
          <TabsTrigger value="sales" onClick={() => { setReportData([]); setGrandTotal(null); }}>
            Sales Reports
          </TabsTrigger>
          <TabsTrigger value="quotation" onClick={() => { setReportData([]); setGrandTotal(null); }}>
            Quotations
          </TabsTrigger>
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

              {isGeneralAdvanced && watchedGeneralType !== "INVENTORY_HEALTH" && (
                <FormField
                  control={generalForm.control}
                  name="customer_id"
                  render={({ field }) => (
                    <FormItem className="w-[200px]">
                      <FormLabel>Customer</FormLabel>
                      <Combobox
                        items={[
                          { value: "ALL", label: "ALL" },
                          ...customer.map((c) => ({
                            value: String(c.customer_id),
                            label: c.company_name,
                          }))
                        ]}
                        value={field.value ? String(field.value) : ""}
                        onValueChange={(val) => field.onChange(val === "ALL" ? "ALL" : val ? Number(val) : undefined)}
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
                        <Calendar mode="single" disabled={(date) => date > new Date()}
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
                        <Calendar mode="single" disabled={(date) => date > new Date()}
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
                        items={[
                          { value: "ALL", label: "ALL" },
                          ...Object.entries(PRODUCT_TYPES).map(([key, val]) => ({
                            value: key,
                            label: val as string,
                          }))
                        ]}
                        value={field.value ?? ""}
                        onValueChange={field.onChange}
                        placeholder="Select Product Type"
                      />
                    </FormItem>
                  )}
                />
              )}

              {watchedGeneralType === "DISPATCH_INSIGHTS" && (
                <div className="w-[200px]">
                  <label className="mb-2 block text-sm font-medium">Status</label>
                  <Combobox
                    items={[
                      { value: "all", label: "All" },
                      { value: "Pending", label: "Pending" },
                      { value: "Partially Dispatch", label: "Partially Dispatch" },
                      { value: "Completed", label: "Completed" },
                    ]}
                    value={selectedDispatchStatus}
                    onValueChange={setSelectedDispatchStatus}
                    placeholder="Select Status"
                  />
                </div>
              )}

              <Button variant="outline" type="button" className="h-10" onClick={() => clearResultsAndReset('general')}>
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
                            <Calendar mode="single" disabled={(date) => date > new Date()}
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
                            <Calendar mode="single" disabled={(date) => date > new Date()}
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

              {["STOCK_VALUE", "GRN_REPORT", "CURRENT_STOCK", "STOCK_AGING", "LOW_STOCK", "MATERIAL_CONSUMPTION_SUMMARY"].includes(inventoryForm.watch("report_type")) && (
                <>
                  <FormField
                    control={inventoryForm.control}
                    name="item_category"
                    render={({ field }) => (
                      <FormItem className="w-[200px]">
                        <FormLabel>Item Category</FormLabel>
                        <Combobox
                          items={[
                            { value: "ALL", label: "All Categories" },
                            ...Object.values(ITEM_CATEGORY).map((v) => ({ value: v, label: v }))
                          ]}
                          value={field.value ?? "ALL"}
                          onValueChange={field.onChange}
                          placeholder="Select Category"
                        />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={inventoryForm.control}
                    name="item_sub_category"
                    render={({ field }) => (
                      <FormItem className="w-[200px]">
                        <FormLabel>Item Sub Category</FormLabel>
                        <Combobox
                          items={[
                            { value: "ALL", label: "All Sub Categories" },
                            ...Object.values(ITEM_SUB_CATEGORY).map((v) => ({ value: v, label: v }))
                          ]}
                          value={field.value ?? "ALL"}
                          onValueChange={field.onChange}
                          placeholder="Select Sub Category"
                        />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {inventoryForm.watch("report_type") === "GRN_REPORT" && (
                <FormField
                  control={inventoryForm.control}
                  name="supplier_name"
                  render={({ field }) => (
                    <FormItem className="w-[200px]">
                      <FormLabel>Supplier</FormLabel>
                      <Combobox
                        items={[
                          { value: "ALL", label: "All Suppliers" },
                          ...suppliers.map((s) => ({ value: s.company_name, label: s.company_name }))
                        ]}
                        value={field.value ?? "ALL"}
                        onValueChange={field.onChange}
                        placeholder="Select Supplier"
                      />
                    </FormItem>
                  )}
                />
              )}

              {inventoryForm.watch("report_type") === "MATERIAL_CONSUMPTION_SUMMARY" && (
                <FormField
                  control={inventoryForm.control}
                  name="item_id"
                  render={({ field }) => (
                    <FormItem className="w-[300px]">
                      <FormLabel>Item Name</FormLabel>
                      <Combobox
                        items={[
                          { value: "ALL", label: "All Items" },
                          ...inventoryItems
                        ]}
                        value={field.value ?? "ALL"}
                        onValueChange={field.onChange}
                        placeholder="Select Item"
                      />
                    </FormItem>
                  )}
                />
              )}

              {inventoryForm.watch("report_type") === "MATERIAL_CONSUMPTION_BY_JOB" && (
                <FormField
                  control={inventoryForm.control}
                  name="job_id"
                  render={({ field }) => (
                    <FormItem className="w-[300px]">
                      <FormLabel>Job Name</FormLabel>
                      <Combobox
                        items={[
                          { value: "ALL", label: "All Jobs" },
                          ...jobList
                        ]}
                        value={field.value ?? "ALL"}
                        onValueChange={field.onChange}
                        placeholder="Select Job"
                      />
                    </FormItem>
                  )}
                />
              )}

              <Button variant="outline" type="button" className="h-10" onClick={() => clearResultsAndReset('inventory')}>
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
                        <Calendar mode="single" disabled={(date) => date > new Date()}
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
                        <Calendar mode="single" disabled={(date) => date > new Date()}
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
                <>
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
                  <div className="flex flex-col gap-1 w-[150px]">
                    <FormLabel>Filter by Currency</FormLabel>
                    <Combobox
                      items={[
                        { value: "", label: "All Currencies" },
                        { value: "LKR", label: "LKR" },
                        { value: "USD", label: "USD" }
                      ]}
                      value={selectedSalesCurrency}
                      onValueChange={setSelectedSalesCurrency}
                      placeholder="All Currencies"
                    />
                  </div>
                </>
              )}

              {watchedSalesType === "SALES_BY_SALESPERSON" && (
                <div className="flex flex-col gap-1 w-[200px]">
                  <FormLabel>Filter by Salesperson</FormLabel>
                  <Combobox
                    items={[
                      { value: "", label: "All Salespersons" },
                      ...Array.from(new Set([
                        ...marketingPersons,
                        ...userList.map((u: any) => u.name || u.username)
                      ])).filter(Boolean).sort().map((name) => ({
                        value: String(name),
                        label: String(name),
                      })),
                    ]}
                    value={selectedSalespersonName}
                    onValueChange={setSelectedSalespersonName}
                    placeholder="All Salespersons"
                  />
                </div>
              )}

              <Button variant="outline" type="button" className="h-10" onClick={() => clearResultsAndReset('sales')}>
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

              {["QUOTATION_BY_CUSTOMER"].includes(watchedQuotationType || "") && (
                <FormField
                  control={quotationForm.control}
                  name="customer_id"
                  render={({ field }) => (
                    <FormItem className="w-[200px]">
                      <FormLabel>Customer</FormLabel>
                      <Combobox
                        items={[
                          { value: "ALL", label: "ALL" },
                          ...customer.map((c) => ({
                            value: String(c.customer_id),
                            label: c.company_name,
                          }))
                        ]}
                        value={field.value ? String(field.value) : ""}
                        onValueChange={(val) => field.onChange(val)}
                        placeholder="Select Customer"
                      />
                    </FormItem>
                  )}
                />
              )}
              {["QUOTATION_BY_SALESPERSON"].includes(watchedQuotationType || "") && (
                <FormField
                  control={quotationForm.control}
                  name="salesperson"
                  render={({ field }) => (
                    <FormItem className="w-[200px]">
                      <FormLabel>Salesperson</FormLabel>
                      <Combobox
                        items={[
                          { value: "ALL", label: "ALL" },
                          ...Array.from(new Set([
                            ...marketingPersons,
                            ...userList.map((u: any) => u.name || u.username)
                          ])).filter(Boolean).sort().map(person => ({
                            value: String(person),
                            label: String(person)
                          }))
                        ]}
                        value={field.value ?? ""}
                        onValueChange={field.onChange}
                        placeholder="Select Salesperson"
                      />
                    </FormItem>
                  )}
                />
              )}
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
                        <Calendar mode="single" disabled={(date) => date > new Date()}
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
                        <Calendar mode="single" disabled={(date) => date > new Date()}
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                          captionLayout="dropdown"
                        />
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                )}
              />

              <Button variant="outline" type="button" className="h-10" onClick={() => clearResultsAndReset('quotation')}>
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
            {grandTotal !== null && (
              <div className="mb-4 text-xl font-bold text-primary flex justify-end">
                Total Stock Value: {new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(grandTotal)}
              </div>
            )}
            <ReportsTable data={filteredReportData} isLoading={loading} filename={reportFilename} />
          </div>
        )
      )}
    </div>
  );
}

export default ReportsPage;
