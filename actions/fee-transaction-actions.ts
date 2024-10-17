// Import necessary dependencies
import prisma from "@/lib/prisma";
import { FeeTransactionSchema } from "@/schemas/fee-transaction-schema";

// Define the type for response state
type ResponseState = {
  success: boolean;
  error: boolean;
  message?: string;
  messages?: string[];
};

// Function to create a fee transaction
export const createFeeTransaction = async (
  data: FeeTransactionSchema
): Promise<ResponseState> => {
  try {
    await prisma.feeTransaction.create({
      data: {
        amount: data.amount,
        paymentDate: data.paymentDate,
        method: data.method,
        studentId: data.studentId,
        feeTemplateId: data.feeTemplateId, // Correct field name based on your model
        termId: data.termId, // Add termId as per your model
        academicYearId: data.academicYearId, // Add academicYearId as per your model
        receiptNumber: data.receiptNumber,
        status: data.status,
        balance: data.balance,
        isPartialPayment: data.isPartialPayment,
        notes: data.notes,
      },
    });

    return {
      success: true,
      error: false,
      message: "Fee transaction created successfully",
    };
  } catch (err) {
    console.error(err);
    return {
      success: false,
      error: true,
      message: "Failed to create fee transaction",
    };
  }
};

// Function to update a fee transaction
export const updateFeeTransaction = async (
  data: FeeTransactionSchema
): Promise<ResponseState> => {
  try {
    if (!data.id) {
      throw new Error("Fee Transaction ID is required for update");
    }

    await prisma.feeTransaction.update({
      where: { id: data.id },
      data: {
        amount: data.amount,
        paymentDate: data.paymentDate,
        method: data.method,
        studentId: data.studentId,
        feeTemplateId: data.feeTemplateId,
        termId: data.termId,
        academicYearId: data.academicYearId,
        receiptNumber: data.receiptNumber,
        status: data.status,
        balance: data.balance,
        isPartialPayment: data.isPartialPayment,
        notes: data.notes,
      },
    });

    return {
      success: true,
      error: false,
      message: "Fee transaction updated successfully",
    };
  } catch (err) {
    console.error(err);
    return {
      success: false,
      error: true,
      message: "Failed to update fee transaction",
    };
  }
};

// type ResponseState = {
//   success: boolean;
//   error: boolean;
//   message?: string;
// };

// Modify the deleteFeeTransaction function to match useFormState requirements
export const deleteFeeTransaction = async (
  currentState: ResponseState,
  formData: FormData
): Promise<ResponseState> => {
  try {
    const id = formData.get("id") as string;
    await prisma.feeTransaction.delete({
      where: { id }
    });
    
    return {
      success: true,
      error: false,
      message: "Fee transaction deleted successfully"
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: true,
      message: "Failed to delete fee transaction"
    };
  }
};