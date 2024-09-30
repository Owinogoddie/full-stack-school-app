import { z } from "zod";

export const adminSchema = z.object({
  id: z.string().optional(),
  username: z.string().min(3, "Username must be at least 3 characters long!"),
});

export type AdminSchema = z.infer<typeof adminSchema>;
