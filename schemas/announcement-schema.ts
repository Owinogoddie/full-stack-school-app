import { z } from "zod";

export const announcementSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(1, "Title is required!"),
  description: z.string().min(1, "Description is required!"),
  date: z.coerce.date({ message: "Date is required!" }),
  classId: z.number().optional(),
});

export type AnnouncementSchema = z.infer<typeof announcementSchema>;
