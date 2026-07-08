import { z } from "zod";

export const issueNoteItemSchema = z.object({
  item_id: z.coerce.number().min(1, "Item is required"),
  quantity: z.coerce.number(),
});

export const issueNoteSchema = z.object({
  date: z.date().min(new Date(0), "Date is required"),
  remarks: z.string().optional(),
  collector_name: z.string().min(1, "Collector name is required"),
  job_id: z.coerce.number().min(1, "Job is required"),
  items: z.array(issueNoteItemSchema).min(1, "At least one item is required"),
});
