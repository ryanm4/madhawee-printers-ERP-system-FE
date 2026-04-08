"use client";
import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb";
import { getErrorMessage } from "@/lib/error-utils";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { issueNoteSchema } from "@/modules/inventory/issue-notes/validation";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Loader2, PlusIcon, Trash2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { issueNotesApi } from "@/modules/inventory/issue-notes/api";
import { jobTicketsApi } from "@/modules/job-tickets/api";
import { inventoryApi } from "@/modules/inventory/api";
import { toast } from "sonner";
import { getUser } from "@/lib/auth";
import { Combobox } from "@/components/shared/combobox";
import { FullPageLoader } from "@/components/shared/loader";
import { JobTicketStatus } from "@/config/enum";

type IssueNoteFormValues = z.infer<typeof issueNoteSchema>;

function CreateIssueNote() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<{ name: string } | null>(null);

  const [jobs, setJobs] = useState<{ value: string; label: string }[]>([]);
  const [inventoryItems, setInventoryItems] = useState<
    { value: string; label: string }[]
  >([]);

  useEffect(() => {
    const userData = getUser();
    if (userData) {
      setUser({ name: userData.name || "User" });
    }

    const fetchJobs = async () => {
      try {
        setIsLoading(true);
        const response = await jobTicketsApi.getAll();
        if (response.status === 200) {
          setJobs(
            response.data.map((job: any) => ({
              value: job.job_id.toString(),
              label: job.job_number || `Job #${job.job_id}`,
            }))
          );
        }
      } catch (err) {
        console.error("Failed to fetch jobs", err);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchInventory = async () => {
      try {
        const response = await inventoryApi.getAll();
        if (response.status === 200) {
          const uniqueItems = Array.from(
            new Map(
              response.data.map((item: any) => [item.item_name, item])
            ).values()
          );

          setInventoryItems(
            (uniqueItems as any[]).map((item: any) => ({
              value: item.item_name,
              label: item.item_name,
            }))
          );
        }
      } catch (error) {
        console.error("Failed to fetch inventory items", error);
      }
    };

    fetchJobs();
    fetchInventory();
  }, []);

  const defaultValues: IssueNoteFormValues = {
    date: new Date(),
    collector_name: "",
    remarks: "",
    job_id: 0,
    items: [
      { item_name: "", quantity: 0 },
    ],
  };

  const form = useForm<IssueNoteFormValues>({
    resolver: zodResolver(issueNoteSchema) as any,
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  async function onSubmit(values: IssueNoteFormValues) {
    try {
      setIsSubmitting(true);
      
      const payload = {
        ...values,
        date: format(values.date, "yyyy-MM-dd HH:mm:ss"),
        created_by: user?.name || "User",
      };

      const response = await issueNotesApi.create(payload);

      if (response.status === 201 || response.status === 200) {
        // Update Job Ticket status to IN_PRODUCTION
        if (values.job_id) {
          try {
            await jobTicketsApi.patch(values.job_id, {
              status: JobTicketStatus.IN_PRODUCTION,
              updated_by: user?.name || "User",
            });
          } catch (err) {
            console.error("Failed to update Job Ticket status:", err);
          }
        }
        toast.success("Issue Note Created successfully");
        router.push("/inventory/issue-notes");
      }
    } catch (error) {
      console.error("Failed to create Issue Note:", error);
      toast.error(getErrorMessage(error, "Failed to create Issue Note"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-[24px] pt-0 mt-3">
      {(isLoading || isSubmitting) && <FullPageLoader />}
      <PageTitleWithBreadcrumb
        title="Create Issue Note"
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard" },
          { title: "Inventory", href: "/inventory" },
          { title: "Issue Notes", href: "/inventory/issue-notes" },
        ]}
      />

      <Form {...(form as any)}>
        <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
          <div className="flex items-center justify-end gap-3 w-full mt-6">
            <Button
              variant="outline"
              type="button"
              onClick={() => router.push("/inventory/issue-notes")}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Issue Note"
              )}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium">Issue Note Details</h3>
                <p className="text-sm text-muted-foreground">General information about this issue note</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date <span className="text-red-500">*</span></FormLabel>
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
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="collector_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Collector Name <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Enter Collector Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="job_id"
                  render={({ field }) => (
                    <FormItem className="flex flex-col mt-2">
                      <FormLabel>Related Job <span className="text-red-500">*</span></FormLabel>
                      <Combobox
                        items={jobs}
                        value={field.value ? field.value.toString() : ""}
                        onValueChange={(val) => field.onChange(val ? Number(val) : 0)}
                        placeholder="Select Job"
                        searchPlaceholder="Search job..."
                      />
                      <FormMessage />
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
                        <Textarea placeholder="Purpose of this issue" className="resize-none" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <h3 className="text-lg font-medium">Items List</h3>
                  <p className="text-sm text-muted-foreground">Specify items to be issued</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ item_name: "", quantity: 0 })}
                >
                  <PlusIcon className="mr-2 h-4 w-4" /> Add Item
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {fields.map((item, index) => (
                  <div key={item.id} className="flex gap-4 items-start p-4 border rounded-lg bg-muted/20 relative">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                      <FormField
                        control={form.control}
                        name={`items.${index}.item_name`}
                        render={({ field }) => (
                          <FormItem className="flex flex-col mt-2">
                            <FormLabel>Item Name</FormLabel>
                            <Combobox
                              items={inventoryItems}
                              value={field.value}
                              onValueChange={field.onChange}
                              placeholder="Select Item"
                              searchPlaceholder="Search item..."
                            />
                            <FormMessage />
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
                              <Input type="number" placeholder="0" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive mt-8"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default CreateIssueNote;
