import { z } from "zod";

export const studentSchema = z.object({
  upi: z.string(),
  admissionNumber: z.string().optional(),
  firstName: z.string().min(1, { message: "First name is required!" }),
  userName: z.string().min(1, { message: "User name is required for auth!" }),
  lastName: z.string().min(1, { message: "Last name is required!" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .optional()
    .nullable(),
  repeatPassword: z.string().optional().nullable(),
  dateOfBirth: z.coerce.date(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  address: z.string(),
  classId: z.coerce.number().optional(),
  gradeId: z.coerce.number(),
  schoolId: z.string().optional(),
  parentId: z.string().optional(),
  enrollmentDate: z.coerce.date(),
  medicalInfo: z.string().optional(),
  specialNeeds: z.string().optional(),
  img: z.string().optional(),
  studentCategories: z.array(z.string()).optional(),
});

export const updateStudentSchema = studentSchema.extend({
  id: z.string().optional(),
  img: z.string().nullable().optional(),
  schoolId: z.string().nullable().optional(),
}).partial();

export type StudentSchema = z.infer<typeof studentSchema>;
export type UpdateStudentSchema = z.infer<typeof updateStudentSchema>;