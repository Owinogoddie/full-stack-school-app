import { z } from "zod";

export const teacherSchema = z.object({
  id: z.string().optional(),
  tscNumber: z.string().min(1, { message: "TSC number is required!" }),
  firstName: z.string().min(1, { message: "First name is required!" }),
  lastName: z.string().min(1, { message: "Last name is required!" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .optional()
    .nullable(),
    repeatPassword: z.string(),
  dateOfBirth: z.coerce.date({ message: "Date of birth is required!" }),
  gender: z.enum(["MALE", "FEMALE", "OTHER"], { message: "Gender is required!" }),
  nationalId: z.string().min(1, { message: "National ID is required!" }),
  email: z.string().email({ message: "Invalid email address!" }),
  phone: z.string().min(1, { message: "Phone number is required!" }),
  address: z.string().min(1, { message: "Address is required!" }),
  qualifications: z.array(z.string()).optional(),
  specializations: z.array(z.string()).optional(),
  employmentStatus: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT"]),
  hireDate: z.coerce.date({ message: "Hire date is required!" }),
  subjects: z.array(z.string()).optional(), // Array of subject IDs
  classes: z.array(z.string()).optional(),  // Array of class IDs
  departmentId: z.coerce.number().optional(),
  schoolId: z.coerce.number().optional(),
  img: z.string().optional(),
})

export type TeacherSchema = z.infer<typeof teacherSchema>;


const partialTeacherSchema = teacherSchema.partial();
export const teacherUpdateSchema = partialTeacherSchema.extend({
  id: z.string(),  // ensure id is required
});