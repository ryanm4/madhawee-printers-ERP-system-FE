"use client";
import { Combobox } from "@/components/shared/combobox";
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
import { PRODUCT_TYPES, REPORT_TYPES } from "@/config/enum";
import { cn } from "@/lib/utils";
import { CustomerApi } from "@/modules/customer/api";
import { CUSTOMER } from "@/modules/customer/types";
import { ReportsApi } from "@/modules/reports/api";
import { CREATE_REPORT } from "@/modules/reports/types";
import { ReportSchema } from "@/modules/reports/validations";
import { ReportsTable } from "./_components/reports-table";
import { Card, CardContent } from "@/components/ui/card";
import { PageLoader } from "@/components/shared/loader";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { FieldPath, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

type ReportsFormValues = z.infer<typeof ReportSchema>;
function ReportsPage() {
  const [customer, setCustomer] = useState<CUSTOMER[]>([]);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState([]);

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
      toast(getErrorMessage(error, "Failed to fetch customers"));
    } finally {
      setLoading(false);
    }
  };

  const baseDefaultValues: ReportsFormValues = {
    reportType: "",
    filters: {
      fromDate: new Date().toISOString().split("T")[0],
      toDate: new Date().toISOString().split("T")[0],
      customer_id: undefined,
      status: "",
      product_type: "",
    },
  };

  const form = useForm<ReportsFormValues>({
    resolver: zodResolver(ReportSchema),
    defaultValues: baseDefaultValues,
  });

  const renderFormField = <TName extends FieldPath<ReportsFormValues>>(
    name: TName,
    render: Parameters<
      typeof FormField<ReportsFormValues, TName>
    >["0"]["render"]
  ) => <FormField control={form.control} name={name} render={render} />;

  async function onSubmit(data: ReportsFormValues) {
    try {
      setLoading(true);
      const isAdvancedReport = Object.keys(REPORT_TYPES).includes(
        data.reportType
      );

      const payload: CREATE_REPORT = {
        reportType: data?.reportType,
        filters: {
          fromDate: data.filters.fromDate
            ? new Date(data.filters.fromDate)
            : new Date(),
          toDate: data.filters.toDate
            ? new Date(data.filters.toDate)
            : new Date(),
          ...(isAdvancedReport && {
            customer_id: data.filters.customer_id,
            status: data.filters.status,
            product_type: data.filters.product_type,
          }),
        },
      };

      const response = isAdvancedReport
        ? await ReportsApi.createAdvanced(payload)
        : await ReportsApi.createSummary(payload);

      if (response.data) {
        console.log(response.data);
        setReportData(response.data as any);
      }

      toast("Report Generated", {
        description: `Report has been generated successfully.`,
      });
      form.clearErrors();
    } catch (error) {
      console.error("Failed to generate report", error);
      toast("Failed to Create Report", {
        description: getErrorMessage(error, "An error occurred while creating the report. Please try again."),
      });
    } finally {
      setLoading(false);
    }
  }

  const handleReset = () => {
    form.reset({
      reportType: "",
      filters: {
        fromDate: new Date().toISOString().split("T")[0],
        toDate: new Date().toISOString().split("T")[0],
        customer_id: undefined,
        status: "",
        product_type: "",
      },
    });
  };

  const selectedReportType = form.watch("reportType");
  const isAdvancedReport =
    Object.keys(REPORT_TYPES).includes(selectedReportType);
  return (
    <div className="flex flex-1 flex-col gap-4 p-[24px] pt-0 mt-3 w-full min-w-0 overflow-hidden">
      <PageTitleWithBreadcrumb
        title="Reports Management"
        breadcrumbs={[{ title: "Dashboard", href: "/dashboard" }]}
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="flex flex-wrap gap-4 mt-5 items-end">
            {renderFormField("reportType", ({ field }) => (
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
                      items: Object.entries(REPORT_TYPES).map(
                        ([key, reportType]) => ({
                          value: key,
                          label: reportType,
                        })
                      ),
                    },
                  ]}
                  value={field.value ?? ""}
                  onValueChange={(value) => field.onChange(value)}
                  placeholder="Select Report Type"
                  searchPlaceholder="Search report type..."
                />
              </FormItem>
            ))}

            {isAdvancedReport && (
              <>
                {renderFormField("filters.customer_id", ({ field }) => (
                  <FormItem className="w-[200px]">
                    <FormLabel>Customer</FormLabel>
                    <FormControl>
                      <Combobox
                        items={customer.map((c) => ({
                          value: String(c.customer_id),
                          label: c.company_name,
                        }))}
                        value={field.value ? String(field.value) : ""}
                        onValueChange={(value) => {
                          field.onChange(Number(value));
                        }}
                        placeholder="Select Customer"
                        searchPlaceholder="Search customer..."
                        className="h-10"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                ))}
              </>
            )}

            {renderFormField("filters.fromDate", ({ field }) => (
              <FormItem className="w-[200px]">
                <FormLabel>From Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full h-10 pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value
                          ? format(new Date(field.value), "PPP")
                          : "Select date"}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => {
                        field.onChange(
                          date ? format(date, "yyyy-MM-dd") : undefined
                        );
                      }}
                      captionLayout="dropdown"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            ))}

            {renderFormField("filters.toDate", ({ field }) => (
              <FormItem className="w-[200px]">
                <FormLabel>To Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full h-10 pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value
                          ? format(new Date(field.value), "PPP")
                          : "Select date"}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => {
                        field.onChange(
                          date ? format(date, "yyyy-MM-dd") : undefined
                        );
                      }}
                      captionLayout="dropdown"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            ))}

            {isAdvancedReport &&
              renderFormField("filters.product_type", ({ field }) => (
                <FormItem className="w-[200px]">
                  <FormLabel>Product Type</FormLabel>

                  <Combobox
                    items={Object.entries(PRODUCT_TYPES).map(
                      ([key, productType]) => ({
                        value: key, // string ✔
                        label: productType,
                      })
                    )}
                    value={field.value ?? ""}
                    onValueChange={(value) => field.onChange(value)}
                    placeholder="Select Product Type"
                    searchPlaceholder="Search product type..."
                  />

                  <FormMessage />
                </FormItem>
              ))}

            <Button
              variant="outline"
              type="button"
              className="h-10"
              onClick={handleReset}
            >
              Reset
            </Button>
            <Button type="submit" className="bg-primary text-white h-10">
              Generate Report
            </Button>
          </div>
        </form>
      </Form>

      {loading ? (
        <PageLoader />
      ) : (
        reportData.length > 0 && (
          <div className="mt-8">
            <ReportsTable data={reportData} />
          </div>
        )
      )}
    </div>
  );
}

export default ReportsPage;
