"use client";
import { dispatchInvoiceScheme } from "@/modules/dispatch-invoice/validation";
import { useRouter } from "next/navigation";
import { getErrorMessage } from "@/lib/error-utils";
import React, { useEffect, useState } from "react";
import { FieldPath, useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { dispatchInventoryApi } from "@/modules/dispatch-invoice/api";
import { CREATE_DISPATCH } from "@/modules/dispatch-invoice/types";
import { toast } from "sonner";
import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { jobTicketsApi } from "@/modules/job-tickets/api";
import { ALL_TICKETS } from "@/modules/job-tickets/types";
import { formatPhone } from "@/hooks/format-phone-no";
import { CustomerApi } from "@/modules/customer/api";
import { toMySQLDateTime } from "@/hooks/sql-date-time";
import { Combobox } from "@/components/shared/combobox";
import { getUser } from "@/lib/auth";
import { FullPageLoader } from "@/components/shared/loader";

type DispatchFormValues = z.infer<typeof dispatchInvoiceScheme>;

function CreateDispatchandInvoice() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isJobLoading, setIsJobLoading] = useState(false);
  const [JobData, setJobData] = useState<ALL_TICKETS[]>([]);
  const [user, setUser] = useState<{
    name: string;
    email: string;
    avatar: string;
  } | null>(null);
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
    const userData = getUser();
    if (userData) {
      setUser({
        name: userData.name || "User",
        email: userData.email,
        avatar: "",
      });
    }
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await jobTicketsApi.getAll();

      if (response.status === 200) {
        const completedJobs = response.data.filter(
          (x) => x.status === "PRINTING COMPLETED"
        );

        setJobData(completedJobs);
      }
    } catch (error) {
      console.error("Failed to fetch jobs", error);
      toast(getErrorMessage(error, "Failed to fetch jobs"));
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit: SubmitHandler<DispatchFormValues> = async (data) => {
    try {
      setIsLoading(true);
      const payload: CREATE_DISPATCH = {
        customer_id: data.customer_id ?? "",
        job_id: data.job_id,
        dispatch_note: data.dispatch_note ?? "",
        dispatch_date: toMySQLDateTime(new Date("2025-01-05")),
        dispatch_qty: data.dispatch_quantity ?? "",
        no_of_bundles: data.dispatch_bundles_qty ?? "",
        description: data.dispatch_description ?? "",
        delivery_address: data.delivery_address ?? "",
        status: "PENDING",
        created_by: user?.name || "Admin",
        created_on: new Date(),
      };
      const response = await dispatchInventoryApi.create(payload);

      toast("Dispatch Created", {
        description: "The dispatch record has been created successfully.",
      });
      form.reset(baseDefaultValues);
      form.clearErrors();
      router.push("/dispatch-invoice");
    } catch (error) {
      console.error("Failed to create dispatch record:", error);
      toast("Failed to Create Dispatch", {
        description: getErrorMessage(error, "An error occurred while creating the dispatch record. Please try again."),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderFormField = <TName extends FieldPath<DispatchFormValues>>(
    name: TName,
    render: Parameters<
      typeof FormField<DispatchFormValues, TName>
    >["0"]["render"]
  ) => <FormField control={form.control} name={name} render={render} />;

  const findCustomer = form.watch("job_id");

  const jobId = form.watch("job_id");

  useEffect(() => {
    if (!jobId) {
      // clear customer fields if no job selected
      form.setValue("customer_name", "");
      form.setValue("customer_phone", "");
      form.setValue("customer_address", "");
      return;
    }

    const fetchCustomer = async () => {
      try {
        setIsLoading(true);
        const selectedJob = JobData.find(
          (job) => String(job.job_id) === String(jobId)
        );
        if (!selectedJob) return;
        const customerId = selectedJob.customer_id;
        const response = await CustomerApi.getById(customerId);
        if (response.status === 200) {
          const customer = response.data;
          form.setValue("customer_id", String(customer.customer_id));
          form.setValue("customer_name", customer.company_name ?? "");
          form.setValue("customer_phone", customer.phone ?? "");
          form.setValue("customer_address", customer.address ?? "");
        }
      } catch (err) {
        console.error("Failed to fetch customer:", err);
        toast(getErrorMessage(err, "Failed to fetch customer details"));
        form.setValue("customer_name", "");
        form.setValue("customer_phone", "");
        form.setValue("customer_address", "");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomer();
  }, [jobId, JobData, form]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-[24px] pt-0 mt-3">
      {isLoading && <FullPageLoader />}
      <PageTitleWithBreadcrumb
        title="Create Dispatch and Invoice Management"
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard" },
          {
            title: "Dispatch and Invoice Management",
            href: "/dispatch-invoice",
          },
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
              onClick={() => router.push("/dispatch-invoice")}
            >
              Cancel
            </Button>
            <Button size="lg" type="submit" className="bg-primary text-white">
              Save
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
            <Card
              className={cn(
                "w-full   shadow-sm hover:shadow-md transition-shadow flex flex-col"
              )}
            >
              <CardHeader className="flex flex-col gap-[0.5px]">
                <h3 className="text-md font-medium mb-2">Purchase Order</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Edit your purchase order details here
                </p>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {renderFormField("job_id", ({ field }) => (
                  <FormItem>
                    <FormLabel>Job ID</FormLabel>
                    <Combobox
                      items={JobData.map((job) => ({
                        value: String(job.job_id),
                        label: `Job-${job.job_id} (${job.job_name})`,
                      }))}
                      value={field.value ? String(field.value) : ""}
                      onValueChange={field.onChange}
                      placeholder="Select a Job Ticket"
                      searchPlaceholder="Search job..."
                    />
                    <FormMessage />
                  </FormItem>
                ))}
                <div className="flex flex-row gap-4">
                  {renderFormField("customer_name", ({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>
                        Customer Name<span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter Company Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  ))}
                  {renderFormField("customer_phone", ({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Customer Phone</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="Enter Customer Phone"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const digitsOnly = e.target.value.replace(
                              /\D/g,
                              ""
                            );
                            field.onChange(digitsOnly);
                          }}
                          onBlur={() => {
                            if (!field.value) return;
                            const formatted = formatPhone(
                              field.value as string
                            );
                            field.onChange(formatted);
                          }}
                          onFocus={() => {
                            if (!field.value) return;
                            field.onChange(
                              (field.value as string).replace(/\D/g, "")
                            );
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  ))}
                </div>
                {renderFormField("customer_address", ({ field }) => (
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
                {renderFormField("delivery_address", ({ field }) => (
                  <FormItem>
                    <FormLabel>Delivery Address</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter Deliver Address"
                        className="resize-none"
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
                <h3 className="text-md font-medium mb-2">Dispatch Note</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Add your dispatch note details here
                </p>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {renderFormField("dispatch_note", ({ field }) => (
                  <FormItem>
                    <FormLabel>Dispatch Note</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter dispatch note" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                ))}
                {renderFormField("dispatch_date", ({ field }) => (
                  <FormItem>
                    <FormLabel>Dispatch Date</FormLabel>
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
                <div className="flex flex-rows gap-4">
                  {renderFormField("dispatch_quantity", ({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Dispatch Quantity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter dispatch quantity"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  ))}
                  {renderFormField("dispatch_bundles_qty", ({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>No.of Bundles</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter no.of bundles"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  ))}
                </div>

                {renderFormField("dispatch_description", ({ field }) => (
                  <FormItem>
                    <FormLabel>Dispatch Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Type your message here."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                ))}
              </CardContent>
            </Card>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default CreateDispatchandInvoice;
