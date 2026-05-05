"use client";
import { dispatchInvoiceScheme } from "@/modules/dispatch-invoice/validation";
import { useParams, useRouter } from "next/navigation";
import { getErrorMessage } from "@/lib/error-utils";
import React, { useEffect, useState } from "react";
import { FieldPath, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { dispatchInventoryApi } from "@/modules/dispatch-invoice/api";
import { toast } from "sonner";
import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Edit2 } from "lucide-react";
import { format } from "date-fns";
import { jobTicketsApi } from "@/modules/job-tickets/api";
import { ALL_TICKETS } from "@/modules/job-tickets/types";
import { CustomerApi } from "@/modules/customer/api";
import { FullPageLoader } from "@/components/shared/loader";

type DispatchFormValues = z.infer<typeof dispatchInvoiceScheme>;

function ViewDispatchAndInvoice() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [JobData, setJobData] = useState<ALL_TICKETS[]>([]);
  const params = useParams();
  const id = params.id as string;

  const baseDefaultValues: DispatchFormValues = {
    job_id: "",
    customer_address: "",
    customer_name: "",
    customer_phone: "",
    delivery_address: "",
    dispatch_note: "",
    dispatch_date: new Date(),
    dispatch_quantity: "",
    dispatch_bundles_qty: "",
    dispatch_description: "",
    customer_id: "",
  };

  const form = useForm<DispatchFormValues>({
    resolver: zodResolver(dispatchInvoiceScheme),
    defaultValues: baseDefaultValues,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await jobTicketsApi.getAll();
      if (response.status === 200) {
        setJobData(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch jobs", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchDispatch = async () => {
      try {
        setIsLoading(true);
        const response = await dispatchInventoryApi.getById(id);
        if (response.status === 200) {
          const d = response.data;
          console.log("Dispatch View Data:", d);
          form.setValue("job_id", String(d.job_id || ""));
          form.setValue("customer_id", String(d.customer_id || ""));
          form.setValue("customer_name", d.customer_name || "");
          form.setValue("customer_phone", d.customer_phone || "");
          form.setValue("customer_address", d.customer_address || "");
          form.setValue("delivery_address", d.delivery_address || "");
          form.setValue("dispatch_note", d.dispatch_note || "");
          form.setValue("dispatch_date", d.dispatch_date ? new Date(d.dispatch_date) : new Date());
          form.setValue("dispatch_quantity", String(d.dispatch_qty || ""));
          form.setValue("dispatch_bundles_qty", String(d.no_of_bundles || ""));
          form.setValue("dispatch_description", d.description || "");
        }
      } catch (err) {
        console.error("Failed to fetch dispatch:", err);
        toast(getErrorMessage(err, "Failed to load dispatch record"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchDispatch();
  }, [id, form]);

  useEffect(() => {
    const jobId = form.watch("job_id");
    if (!jobId || JobData.length === 0) return;

    const fetchCustomerData = async () => {
      try {
        setIsLoading(true);
        const selectedJob = JobData.find((job) => String(job.job_id) === String(jobId));
        if (!selectedJob) return;

        const response = await CustomerApi.getById(selectedJob.customer_id);
        if (response.status === 200) {
          const customer = response.data;
          form.setValue("customer_name", customer.company_name ?? "");
          form.setValue("customer_phone", customer.phone ?? "");
          form.setValue("customer_address", customer.address ?? "");
        }
      } catch (err) {
        console.error("Failed to fetch customer data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomerData();
  }, [JobData, form]);

  const renderFormField = <TName extends FieldPath<DispatchFormValues>>(
    name: TName,
    render: Parameters<
      typeof FormField<DispatchFormValues, TName>
    >["0"]["render"]
  ) => <FormField control={form.control} name={name} render={render} />;

  return (
    <div className="flex flex-1 flex-col gap-4 p-[24px] pt-0 mt-3">
      {isLoading && <FullPageLoader />}
      <PageTitleWithBreadcrumb
        title="View Dispatch and Invoice Management"
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard" },
          {
            title: "Dispatch and Invoice Management",
            href: "/dispatch-invoice",
          },
        ]}
      />

      <Form {...form}>
        <div className="space-y-6 pb-0">
          <div className="flex items-center justify-end gap-[16px] sm:justify-end w-full mt-6">
            <Button
              size="lg"
              variant="outline"
              type="button"
              onClick={() => router.push("/dispatch-invoice")}
            >
              Back to List
            </Button>
            <Button 
                size="lg" 
                className="bg-primary text-white"
                onClick={() => router.push(`/dispatch-invoice/${id}/edit`)}
            >
              <Edit2 className="mr-2 h-4 w-4" /> Edit Dispatch
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
            <Card className="w-full shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <CardHeader className="flex flex-col gap-[0.5px]">
                <h3 className="text-md font-medium mb-2">Customer & Job Details</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  View details of the selected job and customer
                </p>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormItem>
                    <FormLabel>Job ID</FormLabel>
                    <FormControl>
                        <Input 
                            readOnly 
                            disabled 
                            className="bg-slate-50 resize-none disabled:opacity-100 disabled:text-black disabled:cursor-default"
                            value={JobData.find(j => String(j.job_id) === String(form.watch("job_id")))?.job_name || `Job-${form.watch("job_id")}`} 
                        />
                    </FormControl>
                  </FormItem>
                  <FormItem>
                    <FormLabel>Job Quantity</FormLabel>
                    <FormControl>
                      <Input
                        readOnly
                        disabled
                        className="bg-gray-50 disabled:opacity-100 disabled:text-black disabled:cursor-default"
                        value={
                          JobData.find(
                            (j) => String(j.job_id) === String(form.watch("job_id"))
                          )?.quantity || ""
                        }
                      />
                    </FormControl>
                  </FormItem>
                </div>
                {renderFormField("customer_name", ({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Name</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly disabled className="bg-slate-50 resize-none disabled:opacity-100 disabled:text-black disabled:cursor-default" />
                    </FormControl>
                  </FormItem>
                ))}
                {renderFormField("customer_phone", ({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Phone</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly disabled className="bg-slate-50 resize-none disabled:opacity-100 disabled:text-black disabled:cursor-default" />
                    </FormControl>
                  </FormItem>
                ))}
                {renderFormField("customer_address", ({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Address</FormLabel>
                    <FormControl>
                      <Textarea {...field} readOnly disabled className="resize-none disabled:opacity-100 disabled:text-black disabled:cursor-default" />
                    </FormControl>
                  </FormItem>
                ))}
                {renderFormField("delivery_address", ({ field }) => (
                  <FormItem>
                    <FormLabel>Delivery Address</FormLabel>
                    <FormControl>
                      <Textarea {...field} readOnly disabled className="resize-none disabled:opacity-100 disabled:text-black disabled:cursor-default" />
                    </FormControl>
                  </FormItem>
                ))}
              </CardContent>
            </Card>

            <Card className="w-full shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <CardHeader className="flex flex-col gap-[0.5px]">
                <h3 className="text-md font-medium mb-2">Dispatch Details</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  View recorded dispatch information
                </p>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {renderFormField("dispatch_note", ({ field }) => (
                  <FormItem>
                    <FormLabel>Dispatch Note</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly disabled className="bg-slate-50 resize-none disabled:opacity-100 disabled:text-black disabled:cursor-default" />
                    </FormControl>
                  </FormItem>
                ))}
                {renderFormField("dispatch_date", ({ field }) => (
                  <FormItem>
                    <FormLabel>Dispatch Date</FormLabel>
                    <FormControl>
                      <Input 
                        value={field.value ? format(field.value, "PPP") : ""} 
                        readOnly 
                        disabled 
                        className="bg-slate-50 resize-none disabled:opacity-100 disabled:text-black disabled:cursor-default" 
                      />
                    </FormControl>
                  </FormItem>
                ))}
                <div className="grid grid-cols-2 gap-4">
                  {renderFormField("dispatch_quantity", ({ field }) => (
                    <FormItem>
                      <FormLabel>Dispatch Quantity</FormLabel>
                      <FormControl>
                        <Input {...field} readOnly disabled className="bg-slate-50 resize-none disabled:opacity-100 disabled:text-black disabled:cursor-default" />
                      </FormControl>
                    </FormItem>
                  ))}
                  {renderFormField("dispatch_bundles_qty", ({ field }) => (
                    <FormItem>
                      <FormLabel>No. of Bundles</FormLabel>
                      <FormControl>
                        <Input {...field} readOnly disabled className="bg-slate-50 resize-none disabled:opacity-100 disabled:text-black disabled:cursor-default" />
                      </FormControl>
                    </FormItem>
                  ))}
                </div>
                {renderFormField("dispatch_description", ({ field }) => (
                  <FormItem>
                    <FormLabel>Dispatch Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} readOnly disabled className="resize-none disabled:opacity-100 disabled:text-black disabled:cursor-default" />
                    </FormControl>
                  </FormItem>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </Form>
    </div>
  );
}

export default ViewDispatchAndInvoice;
