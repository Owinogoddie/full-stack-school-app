import { z } from "zod";


// Define the GradeLevel and Stage enums or schemas if they are not already defined

const GradeLevelEnum = z.enum([
  "PLAYGROUP",
  "PP1",
  "PP2",
  "GRADE1",
  "GRADE2",
  "GRADE3",
  "GRADE4",
  "GRADE5",
  "GRADE6",
  "GRADE7",
  "GRADE8",
  "GRADE9",
  "GRADE10",
  "GRADE11",
  "GRADE12",
]);

const StageEnum = z.enum([
  "PRE_PRIMARY",
  "PRIMARY",
  "JUNIOR_SECONDARY",
  "SENIOR_SECONDARY",
]);
export const gradeSchema = z.object({
  id: z.coerce.number().optional(),
  levelName: GradeLevelEnum, // Use the defined GradeLevel enum
  stage: StageEnum, // Use the defined Stage enum
  description: z.string().optional(), // Optional description
  // Relationships (assuming they are handled as arrays in your application)
  // learningAreas: z.array(z.object({})), // Placeholder for LearningArea schema
  // students: z.array(z.object({})), // Placeholder for Student schema
});

export type GradeSchema = z.infer<typeof gradeSchema>;

