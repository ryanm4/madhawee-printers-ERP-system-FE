"use client";
import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb";
import { getErrorMessage } from "@/lib/error-utils";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { issueNoteSchema } from "@/modules/issue-notes/validation";
import { cn } from "@/lib/utils";
import { useRouter, useParams } from "next/navigation";
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
import { CalendarIcon, Edit } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format, parseISO } from "date-fns";
import { useEffect, useState } from "react";
import { issueNotesApi } from "@/modules/issue-notes/api";
import { jobTicketsApi } from "@/modules/job-tickets/api";
import { inventoryApi } from "@/modules/inventory/api";
import { toast } from "sonner";
import { FullPageLoader } from "@/components/shared/loader";
import { Combobox } from "@/components/shared/combobox";
import { ALL_TICKETS } from "@/modules/job-tickets/types";
import { useCallback } from "react";
import { GET_ALL_INVENTORY } from "@/modules/inventory/types";

type IssueNoteFormValues = z.infer<typeof issueNoteSchema>;

function ViewIssueNote() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<{ value: string; label: string }[]>([]);
  const [inventoryItems, setInventoryItems] = useState<GET_ALL_INVENTORY[]>([]);
  const [jobMaterials, setJobMaterials] = useState<
    { value: number; label: string; quantity: number }[]
  >([]);

  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [isFetchingJob, setIsFetchingJob] = useState(false);

  const form = useForm<IssueNoteFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(issueNoteSchema) as any,
    defaultValues: {
      date: new Date(),
      collector_name: "",
      remarks: "",
      job_id: 0,
      items: [{ item_id: 0, quantity: 0 }],
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const fetchIssueNote = useCallback(async () => {
    try {
      setLoading(true);
      const [response, inventoryResponse] = await Promise.all([
        issueNotesApi.getById(id as string),
        inventoryApi.getAll(),
      ]);
      if (response.status === 200 && inventoryResponse.status === 200) {
        setInventoryItems(inventoryResponse.data);
        const data = response.data;
        form.reset({
          date: parseISO(data.date),
          collector_name: data.collector_name,
          job_id: data.job_id || 0,
          remarks: data.remarks || "",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          items: data.items.map((item: any) => {
            const invItem = inventoryResponse.data.find(
              (i: GET_ALL_INVENTORY) =>
                i.item_name === item.item_name ||
                `${i.item_sub_category} ${i.item_name}` === item.item_name ||
                `${i.item_sub_category} ${i.item_name} ${
                  i.size || ""
                }`.trim() === item.item_name ||
                `${i.item_name} ${i.size || ""}`.trim() === item.item_name
            );

            return {
              item_id: invItem ? invItem.item_id : 0,
              quantity: Number(item.quantity),
            };
          }),
        });

        if (data.job_id) {
          setSelectedJobId(data.job_id);
          await fetchJobById(data.job_id);
        }
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to fetch Issue Note details"));
      router.push("/issue-notes");
    } finally {
      setLoading(false);
    }
  }, [id, form, router]);

  const fetchJobById = async (jobId: number) => {
    try {
      setIsFetchingJob(true);

      const response = await jobTicketsApi.getById(jobId);

      if (response.status === 200 && response.data) {
        const jobData = response.data;

        const materials: {
          value: number;
          label: string;
          quantity: number;
        }[] = [];

        const pcList =
          jobData.paperCoating ||
          jobData.paper_coating ||
          jobData.paperCoatingData ||
          [];

        if (Array.isArray(pcList)) {
          pcList.forEach((pc: any) => {
            const matList = pc.materials || pc.raw_materials;

            if (Array.isArray(matList)) {
              matList.forEach((material: any) => {
                materials.push({
                  value: material.item_id,
                  label:
                    `${material.material_type} ${material.material_name} ${material.size}`.trim(),
                  quantity: material.quantity || 0,
                });
              });
            }
          });
        }

        if (jobData.inks && Array.isArray(jobData.inks)) {
          jobData.inks.forEach((ink: any) => {
            if (ink.ink) {
              materials.push({
                value: ink.id,
                label: ink.ink.trim(),
                quantity: Number(ink.quantity || 0),
              });
            }
          });
        }

        setJobMaterials(materials);
      }
    } catch (error) {
      console.error("Failed to fetch job details:", error);
      setJobMaterials([]);
    } finally {
      setIsFetchingJob(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchIssueNote();
    }

    const fetchJobs = async () => {
      try {
        const response = await jobTicketsApi.getAll();
        if (response.status === 200) {
          setJobs(
            response.data.map((job: ALL_TICKETS) => ({
              value: job.job_id.toString(),
              label: job.job_number || `Job #${job.job_id}`,
            }))
          );
        }
      } catch (err) {
        console.error("Failed to fetch jobs", err);
      }
    };
    fetchJobs();
  }, [id, fetchIssueNote]);

  const readonlyClass =
    "disabled:opacity-100 disabled:text-black disabled:cursor-default bg-muted/50";

  if (loading) return <FullPageLoader />;

  return (
    <div className="flex flex-1 flex-col gap-4 p-[24px] pt-0 mt-3">
      <PageTitleWithBreadcrumb
        title="View Issue Material"
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard" },
          { title: "View", href: "#" },
        ]}
      />

      <Form {...form}>
        <form className="space-y-6">
          <div className="flex items-center justify-end gap-3 w-full mt-6">
            <Button
              variant="outline"
              type="button"
              onClick={() => router.push("/issue-notes")}
            >
              Back to List
            </Button>
            <Button
              type="button"
              onClick={() => router.push(`/issue-notes/${id}/edit`)}
              className="bg-primary hover:bg-primary/90"
            >
              <Edit className="mr-2 h-4 w-4" /> Edit Note
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium">Issue Note Details</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                readonlyClass
                              )}
                              disabled
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            initialFocus
                            disabled
                          />
                        </PopoverContent>
                      </Popover>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="collector_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Collector Name</FormLabel>
                      <FormControl>
                        <Input {...field} disabled className={readonlyClass} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="job_id"
                  render={({ field }) => (
                    <FormItem className="flex flex-col mt-2">
                      <FormLabel>Related Job</FormLabel>
                      <Combobox
                        items={jobs}
                        value={field.value ? field.value.toString() : ""}
                        onValueChange={() => {}}
                        placeholder="Select Job"
                        searchPlaceholder="Search job..."
                        disabled
                        className={readonlyClass}
                      />
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
                        <Textarea
                          className={cn("resize-none", readonlyClass)}
                          {...field}
                          disabled
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <h3 className="text-lg font-medium">Items List</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                {fields.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex gap-4 items-start p-4 border rounded-lg bg-muted/10 relative"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                      <FormField
                        control={form.control}
                        name={`items.${index}.item_id`}
                        render={({ field }) => {
                          const currentItems = jobMaterials.map((m) => ({
                            value: m.value.toString(),
                            label: m.label,
                          }));
                          // If current item is not in jobMaterials, find it in inventoryItems and add it to the list
                          if (
                            field.value &&
                            !currentItems.find(
                              (m) => m.value === field.value.toString()
                            )
                          ) {
                            const invItem = inventoryItems.find(
                              (i: GET_ALL_INVENTORY) =>
                                i.item_id === field.value
                            );
                            if (invItem) {
                              currentItems.push({
                                value: invItem.item_id.toString(),
                                label: invItem.size
                                  ? `${invItem.item_name} (${invItem.size})`
                                  : invItem.item_name,
                              });
                            }
                          }
                          return (
                            <FormItem className="flex flex-col mt-2">
                              <FormLabel>Item Name</FormLabel>
                              <Combobox
                                items={currentItems}
                                value={
                                  field.value ? field.value.toString() : ""
                                }
                                onValueChange={() => {}}
                                placeholder={
                                  isFetchingJob ? "Loading..." : "Select Item"
                                }
                                searchPlaceholder="Search item..."
                                disabled
                                className={readonlyClass}
                              />
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />
                      <FormField
                        control={form.control}
                        name={`items.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantity</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                disabled
                                className={readonlyClass}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
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

export default ViewIssueNote;
