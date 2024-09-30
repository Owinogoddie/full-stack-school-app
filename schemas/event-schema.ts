import { z } from "zod";

export const eventSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(1, "Title is required!"),
  description: z.string().min(1, "Description is required!"),
  startTime: z.coerce.date({ message: "Start time is required!" }),
  endTime: z.coerce.date({ message: "End time is required!" }),
  classId: z.number().optional(),
});

export type EventSchema = z.infer<typeof eventSchema>;
