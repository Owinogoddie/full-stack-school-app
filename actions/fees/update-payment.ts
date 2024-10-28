// app/actions/payments/payment-actions.ts
"use server";

export interface PaymentUpdateInput {
  paymentId: string;
  amount?: number;
  paymentDate?: Date;
  paymentType?: string;
  description?: string;
  status?: string;
  reference?: string;
}

export interface PaymentUpdateResult {
  success: boolean;
  message?: string;
  updatedPayment?: {
    id: string;
    amount: number;
    paymentDate: Date;
    status: string;
    feeStatus: {
      id: string;
      paidAmount: number;
      status: string;
    };
  };
}

export type ResponseState = {
  success: boolean;
  error: boolean;
  message?: string;
  messages?: string[];
};

import prisma from "@/lib/prisma";

export async function updatePayment(
  input: PaymentUpdateInput
): Promise<PaymentUpdateResult> {
  return await prisma.$transaction(async (tx) => {
    try {
      // 1. Get the existing payment with related fee status
      const existingPayment = await tx.payment.findUnique({
        where: { id: input.paymentId },
        include: {
          feeStatus: {
            include: {
              feeStructure: true, // Include fee structure to get the total due amount
            },
          },
        },
      });

      if (!existingPayment) {
        return {
          success: false,
          message: "Payment not found",
        };
      }

      // 2. Handle payment amount update
      if (
        input.amount !== undefined &&
        input.amount !== existingPayment.amount
      ) {
        // Get all payments for this fee status except the current one
        const allPayments = await tx.payment.findMany({
          where: {
            feeStatusId: existingPayment.feeStatusId,
            NOT: {
              id: existingPayment.id,
            },
          },
        });

        // Calculate new total paid amount
        const totalFromOtherPayments = allPayments.reduce(
          (sum, payment) => sum + payment.amount,
          0
        );
        const newTotalPaid = totalFromOtherPayments + input.amount;
        const dueAmount = existingPayment.feeStatus.feeStructure.amount;

        // Determine new status
        let newStatus = "PENDING";
        if (newTotalPaid >= dueAmount) {
          newStatus = "COMPLETED";
        } else if (newTotalPaid > 0) {
          newStatus = "PARTIAL";
        }

        // Update fee status
        await tx.feeStatus.update({
          where: { id: existingPayment.feeStatusId },
          data: {
            paidAmount: newTotalPaid,
            status: newStatus,
            lastPayment: new Date(),
          },
        });

        // Handle excess only if total paid exceeds due amount
        if (newTotalPaid > dueAmount) {
          const excessAmount = newTotalPaid - dueAmount;
          await tx.excessFee.create({
            data: {
              studentId: existingPayment.studentId,
              amount: excessAmount,
              termId: existingPayment.termId,
              academicYearId: existingPayment.academicYearId,
              description: `Excess from payment update (Payment ID: ${existingPayment.id})`,
            },
          });
        }

        // Create audit log
        await tx.feeAuditLog.create({
          data: {
            entityType: "PAYMENT",
            entityId: existingPayment.id,
            action: "UPDATE",
            changes: JSON.stringify({
              amount: {
                old: existingPayment.amount,
                new: input.amount,
              },
            }),
            performedBy: "SYSTEM", // Replace with actual user ID when available
            oldValues: { ...existingPayment },
            newValues: {
              ...existingPayment,
              amount: input.amount,
            },
          },
        });
      }

      // 3. Update the payment
      const updatedPayment = await tx.payment.update({
        where: { id: input.paymentId },
        data: {
          amount: input.amount,
          paymentDate: input.paymentDate,
          paymentType: input.paymentType,
          description: input.description,
          status: input.status,
          reference: input.reference,
        },
        include: {
          feeStatus: true,
        },
      });

      return {
        success: true,
        message: "Payment updated successfully",
        updatedPayment: {
          id: updatedPayment.id,
          amount: updatedPayment.amount,
          paymentDate: updatedPayment.paymentDate,
          status: updatedPayment.status,
          feeStatus: {
            id: updatedPayment.feeStatus.id,
            paidAmount: updatedPayment.feeStatus.paidAmount,
            status: updatedPayment.feeStatus.status,
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Payment update failed",
      };
    }
  });
}

// Function to handle bulk payment updates
export async function updateBulkPayments(
  payments: PaymentUpdateInput[]
): Promise<PaymentUpdateResult[]> {
  const results: PaymentUpdateResult[] = [];

  for (const payment of payments) {
    try {
      const result = await updatePayment(payment);
      results.push(result);
    } catch (error) {
      results.push({
        success: false,
        message:
          error instanceof Error ? error.message : "Payment update failed",
      });
    }
  }

  return results;
}

export async function handlePaymentUpdate(
  paymentData: PaymentUpdateInput
): Promise<ResponseState> {
  try {
    const result = await updatePayment(paymentData);

    if (result.success) {
      return {
        success: true,
        error: false,
        message: "Payment updated successfully",
      };
    } else {
      return {
        success: false,
        error: true,
        message: result.message || "Failed to update payment",
      };
    }
  } catch (error) {
    return {
      success: false,
      error: true,
      message:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}
