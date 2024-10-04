import {z} from  'zod'
const ExamTypeEnum = z.enum(['MIDTERM', 'END_TERM', 'MOCK', 'FINAL', 'ASSIGNMENT', 'QUIZ', 'NATIONAL']);

export const examSchema = z.object({
  id: z.number().optional(),
  title: z.string(),
  description: z.string().nullable().optional(),
  examType: ExamTypeEnum,
  startDate:z.coerce.date({ message: "End date is required!" }),
  endDate: z.coerce.date({ message: "Start date is required!" }),
  lessonId: z.number().nullable().optional(),
  examId: z.number().nullable().optional(),
  subjectId: z.number(),
  gradeId: z.number(),
  academicYearId: z.number(),
  schoolId: z.string().nullable().optional(),
});

export type ExamSchema = z.infer<typeof examSchema>;