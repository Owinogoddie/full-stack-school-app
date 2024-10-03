import { z } from "zod";

// Full Parent Schema for creation
export const parentSchema = z.object({
  id: z.string().optional(),
  nationalId: z.string().optional(),
  firstName: z.string().min(1, "First name is required!"),
  lastName: z.string().min(1, "Last name is required!"),
  email: z.string().email("Invalid email address!").optional(),
  phone: z.string().min(10, "Phone number must be at least 10 digits!"),
  address: z.string().optional(),
  students: z.array(z.string()).optional(),
  img: z.string().optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long!")
    .optional(),
  repeatPassword: z
    .string()
    .min(8, "Password confirmation must be at least 8 characters long!")
    .optional(),
});

// Partial Parent Schema for updates, requiring `id`
export const parentUpdateSchema = parentSchema.partial().extend({
  id: z.string(),
});

export type ParentSchema = z.infer<typeof parentSchema>;
export type ParentUpdateSchema = z.infer<typeof parentUpdateSchema>;
