import { z } from "zod";

// Enum for PaymentStatus (You should adjust this based on your actual enum values)
const paymentStatusEnum = z.enum(["PENDING", "COMPLETED", "FAILED", "REFUNDED"]); // Modify as needed

// FeeTransaction schema
export const feeTransactionSchema = z.object({
  id: z.string().uuid().optional(), // UUID for id
  amount: z.number().positive("Amount must be a positive number"),
  paymentDate: z.coerce.date({ required_error: "Payment date is required" }),
  method: z.string().min(1, "Payment method is required"), // You may add specific method validation if needed
  studentId: z.string().uuid({ message: "Invalid student ID" }), // Assuming UUID for studentId
  feeTemplateId: z.string().uuid({ message: "Invalid fee template ID" }), // Assuming UUID for feeTemplateId
  termId: z.string().uuid({ message: "Invalid term ID" }), // Assuming UUID for termId
  academicYearId: z.number().positive("Academic Year ID must be a positive number"),
  receiptNumber: z.string().min(1, "Receipt number is required"),
  status: paymentStatusEnum,
  balance: z.number().min(0, "Balance cannot be negative"), // Assuming balance should be non-negative
  isPartialPayment: z.boolean().default(false),
  notes: z.string().optional(), // Optional notes field
  createdAt: z.coerce.date().optional(), // Optional if you're handling this on the backend
  updatedAt: z.coerce.date().optional()  // Optional if you're handling this on the backend
});

// Infer the FeeTransactionSchema type
export type FeeTransactionSchema = z.infer<typeof feeTransactionSchema>;
