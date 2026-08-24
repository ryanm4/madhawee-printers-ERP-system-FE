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
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any[]>([]);
  const [grandTotal, setGrandTotal] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("general");

  // Client-side filtering states for Sales Tab
  const [selectedSalesCustomerId, setSelectedSalesCustomerId] = useState<string>("");
  const [selectedSalespersonName, setSelectedSalespersonName] = useState<string>("");
  const [jobList, setJobList] = useState<{ value: string; label: string; fullJob?: any }[]>([]);
  const [quotationList, setQuotationList] = useState<any[]>([]);
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
        if (response.status === 200) {
          const uniqueItems = Array.from(
            new Map(
              response.data.map((item: GET_ALL_INVENTORY) => [
                `${item.item_sub_category}${item.item_name}-${item.size || ""}`,
                item,
              ])
            ).values()
          );

          setInventoryItems(
            (uniqueItems as GET_ALL_INVENTORY[]).map((item) => {
              const label = item.size
                ? `${item.item_sub_category} ${item.item_name} (${item.size})`
                : `${item.item_sub_category} ${item.item_name}`;

              return {
                value: item.item_id.toString(),
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
        setJobList(
          response.data.map((job: any) => ({
            value: job.job_id.toString(),
            label: `[#${job.job_number}] ${job.job_name}`,
            fullJob: job,
          }))
        );
      } catch (error) {
        console.error("Failed to fetch jobs", error);
      }
    };

    fetchCustomer();
    fetchInventory();
    fetchJobs();
    getUserList();
    getMarketingPersons();
  }, []);

  const getUserList = async () => {
    try {
      const response = await userApi.getAll();
      setUserList(response.data.users || []);
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
  const watchedSalesType = salesForm.watch("report_type");
  useEffect(() => {
    setSelectedSalesCustomerId("");
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

  const formatNum = (num: any) => { const n = parseFloat(num); return isNaN(n) ? num : new Intl.NumberFormat("en-US").format(n); };

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
      
      data = data.map((row: any, index: number) => {
        if (watchedSalesType === "SALES_DAILY") {
            return {
                "#": index + 1,
                "Sales Date": row.sales_date ? format(new Date(row.sales_date), "yyyy-MM-dd") : "-",
                "Total Orders": row.total_orders,
                "Total Sales": formatNum(row.total_sales)
            };
        }
        if (watchedSalesType === "SALES_MONTHLY") {
            return {
                "#": index + 1,
                "Sales Month": row.sales_month || "-",
                "Total Orders": row.total_orders,
                "Total Sales": formatNum(row.total_sales)
            };
        }
        if (watchedSalesType === "SALES_WEEKLY") {
            return {
                "#": index + 1,
                "Sales Week": row.sales_week || "-",
                "Week Start Date": row.week_start_date ? format(new Date(row.week_start_date), "yyyy-MM-dd") : "-",
                "Week End Date": row.week_end_date ? format(new Date(row.week_end_date), "yyyy-MM-dd") : "-",
                "Total Orders": row.total_orders,
                "Total Sales": formatNum(row.total_sales)
            };
        }
        if (watchedSalesType === "SALES_BY_CUSTOMER") {
            return {
                "#": index + 1,
                "Customer ID": row.customer_id || "-",
                "Company Name": row.company_name || "-",
                "Total Orders": row.total_orders,
                "Total Sales": formatNum(row.total_sales)
            };
        }
        if (watchedSalesType === "SALES_BY_PRODUCT") {
            return {
                "#": index + 1,
                "Item Code": row.item_code || "-",
                "Description": row.description || "-",
                "Total Quantity": row.total_qty,
                "Total Sales": formatNum(row.total_sales)
            };
        }
        if (watchedSalesType === "SALES_BY_SALESPERSON") {
            return {
                "#": index + 1,
                "Salesperson": row.salesperson || "-",
                "Total Orders": row.total_orders,
                "Total Sales": formatNum(row.total_sales)
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
          "Quantity": quantity,
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
      data = data.map((row: any, index: number) => {
        const qty = parseFloat(row.quantity || 0);
        return {
          "#": index + 1,
          "Item ID": row.item_id || row.id || "-",
          "Item Category": row.item_category || "-",
          "Item Sub Category": row.item_sub_category || "-",
          "Item Name": row.item_name || "-",
          "Unit Price": formatNum(row.unit_price || row.item_unit_price || row.price || 0),
          "Size": (!row.size || String(row.size).trim().toLowerCase() === "x") ? "-" : row.size,
          "Quantity": qty.toFixed(2),
          "UOM": row.uom || "-",
          "Width": row.width || "-",
          "Height": row.height || "-",
          "Rate": formatNum(row.rate || 0),
          "Status": row.status || "-",
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
          "Order Qty": orderQty,
          "Dispatch Qty": dispatchQty,
          "Balance Qty": balanceQty,
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
            type: row.item_type || row.item_code || "-",
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
        const itemQtys = po.items.length > 0 ? po.items.map((i: any) => i.qty).join("\n") : "-";
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
    } else if (activeTab === "inventory") {
      if (watchedInventoryType === "GRN_REPORT") {
        data = data.map((row: any, index: number) => {
          if (row.grn_id === "TOTAL") {
            return {
              "Grn Id": "TOTAL",
              "Supplier Name": "",
              "Received Date": "",
              "Item Category": "",
              "Item Sub Category": "",
              "Item Name": "",
              "Size": "",
              "Quantity": "",
              "Rate": "",
              "Amount": formatNum(row.amount),
            };
          }
          return {
            "Grn Id": row.grn_id || "-",
            "Supplier Name": row.supplier_name || "-",
            "Received Date": row.received_date ? format(new Date(row.received_date), "yyyy-MM-dd") : "-",
            "Item Category": row.item_category || "-",
            "Item Sub Category": row.item_sub_category || "-",
            "Item Name": row.item_name || "-",
            "Size": row.size || "-",
            "Quantity": formatNum(row.quantity),
            "Rate": formatNum(row.rate),
            "Amount": formatNum(row.amount),
          };
        });
      }
    }

    return data;
  }, [reportData, activeTab, watchedSalesType, selectedSalesCustomerId, selectedSalespersonName, watchedGeneralType, jobList, quotationList, customer, selectedDispatchStatus]);

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

              {inventoryForm.watch("report_type") === "STOCK_VALUE" && (
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
                      ...marketingPersons.map((name) => ({
                        value: name,
                        label: name,
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
            <ReportsTable data={filteredReportData} />
          </div>
        )
      )}
    </div>
  );
}

export default ReportsPage;
