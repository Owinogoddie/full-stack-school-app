import { z } from "zod";

// Full Parent Schema for creation
export const parentSchema = z.object({
  id: z.string().optional(),
  username: z.string().min(3, "Username must be at least 3 characters long!"),
  name: z.string().min(1, "First name is required!"),
  surname: z.string().min(1, "Last name is required!"),
  email: z.string().email("Invalid email address!").optional(),
  phone: z.string().min(10, "Phone number is required!"),
  address: z.string().min(1, "Address is required!"),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .optional()
    .or(z.literal("")),
  img: z.string().optional(),
  students: z.array(z.string()).optional()
});

// Partial Parent Schema for updates, requiring `id`
export const parentUpdateSchema = parentSchema.partial().extend({
  id: z.string(),
});

export type ParentSchema = z.infer<typeof parentSchema>;
export type ParentUpdateSchema = z.infer<typeof parentUpdateSchema>;
