"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { FeeExceptionSchema } from "@/schemas/fee-exception-schema";

type ResponseState = {
  success: boolean;
  error: boolean;
  message?: string;
  data?: any;
};

async function createOrUpdateFeeStatusAndPayment(params: {
  studentId: string;
  feeStructureId: string;
  exceptionAmount: number;
  dueDate: Date;
  isUpdate?: boolean;
  previousAmount?: number;
}) {
  const { 
    studentId, 
    feeStructureId, 
    exceptionAmount, 
    dueDate,
    isUpdate,
    previousAmount 
  } = params;

  // Get feeStructure to access termId, academicYearId and original amount
  const feeStructure = await prisma.feeStructure.findUnique({
    where: { id: feeStructureId },
  });

  if (!feeStructure || !feeStructure.termId || !feeStructure.academicYearId) {
    throw new Error("Fee structure must have term and academic year");
  }

  const originalDueAmount = feeStructure.amount; // This is the actual fee structure amount
  
  const existingFeeStatus = await prisma.feeStatus.findUnique({
    where: {
      studentId_feeStructureId_termId_academicYearId: {
        studentId,
        feeStructureId,
        termId: feeStructure.termId,
        academicYearId: feeStructure.academicYearId,
      }
    },
    include: {
      payments: true
    }
  });

  // Calculate payment status based on exception amount
  const paymentStatus = exceptionAmount >= originalDueAmount ? 'COMPLETED' : 'PARTIAL';
  
  // Calculate excess amount if any
  const excessAmount = Math.max(0, exceptionAmount - originalDueAmount);

  if (isUpdate && existingFeeStatus) {
    const amountDifference = exceptionAmount - (previousAmount || 0);
    
    const updatedFeeStatus = await prisma.feeStatus.update({
      where: {
        id: existingFeeStatus.id
      },
      data: {
        dueAmount: originalDueAmount, // Always use original fee structure amount
        dueDate,
        status: paymentStatus,
        paidAmount: Math.min(originalDueAmount, exceptionAmount)
      }
    });

    if (amountDifference !== 0) {
      await prisma.payment.create({
        data: {
          studentId,
          feeStatusId: existingFeeStatus.id,
          amount: exceptionAmount,
          termId: feeStructure.termId,
          academicYearId: feeStructure.academicYearId,
          description: `Fee exception adjustment: ${amountDifference > 0 ? 'increase' : 'decrease'}`,
          paymentType: "ADJUSTMENT",
          status: "COMPLETED",
          dueDate,
          reference: `FEE_EXC_ADJ_${Date.now()}`
        }
      });
    }

    // Handle excess amount if any
    if (excessAmount > 0) {
      await prisma.excessFee.create({
        data: {
          studentId,
          amount: excessAmount,
          academicYearId: feeStructure.academicYearId,
          termId: feeStructure.termId,
          description: 'Excess from fee exception adjustment'
        }
      });
    }

    return updatedFeeStatus;
  } else {
    const newFeeStatus = await prisma.feeStatus.create({
      data: {
        studentId,
        feeStructureId,
        termId: feeStructure.termId,
        academicYearId: feeStructure.academicYearId,
        dueAmount: originalDueAmount, // Always use original fee structure amount
        dueDate,
        status: paymentStatus,
        paidAmount: Math.min(originalDueAmount, exceptionAmount),
        payments: {
          create: {
            studentId,
            amount: Math.min(originalDueAmount, exceptionAmount),
            termId: feeStructure.termId,
            academicYearId: feeStructure.academicYearId,
            description: "Fee exception payment",
            paymentType: "EXCEPTION",
            status: "COMPLETED",
            dueDate,
            reference: `FEE_EXC_${Date.now()}`
          }
        }
      }
    });

    // Handle excess amount if any
    if (excessAmount > 0) {
      await prisma.excessFee.create({
        data: {
          studentId,
          amount: excessAmount,
          academicYearId: feeStructure.academicYearId,
          termId: feeStructure.termId,
          description: 'Excess from fee exception'
        }
      });
    }

    return newFeeStatus;
  }
}

export const createFeeException = async (
  data: FeeExceptionSchema
): Promise<ResponseState> => {
  try {
    const { userId } = auth();
    if (!userId) {
      return {
        success: false,
        error: true,
        message: "Unauthorized",
      };
    }

    if (data.endDate && data.startDate > data.endDate) {
      return {
        success: false,
        error: true,
        message: "End date must be after start date",
      };
    }

    const result = await prisma.$transaction(async (tx) => {
      const feeStructure = await tx.feeStructure.findUnique({
        where: { id: data.feeStructureId },
      });

      if (!feeStructure) {
        throw new Error("Fee structure not found");
      }

      if (!feeStructure.termId || !feeStructure.academicYearId) {
        throw new Error("Fee structure must have term and academic year");
      }

      // Check for existing active exception
      const existingException = await tx.feeException.findFirst({
        where: {
          studentId: data.studentId,
          feeStructureId: data.feeStructureId,
          isActive: true,
        },
      });

      if (existingException) {
        throw new Error("An active fee exception already exists");
      }

      const exception = await tx.feeException.create({
        data: {
          studentId: data.studentId,
          feeStructureId: data.feeStructureId,
          amount: data.amount,
          reason: data.reason,
          startDate: data.startDate,
          endDate: data.endDate,
          isActive: data.isActive,
        },
      });

      await createOrUpdateFeeStatusAndPayment({
        studentId: data.studentId,
        feeStructureId: data.feeStructureId,
        exceptionAmount: data.amount,
        dueDate: feeStructure.dueDate,
      })

      return exception;
    });

    return {
      success: true,
      error: false,
      message: "Fee exception created successfully",
      data: result,
    };
  } catch (error) {
    console.error("Error creating fee exception:", error);
    return {
      success: false,
      error: true,
      message: error instanceof Error ? error.message : "Failed to create fee exception",
    };
  }
};

export const updateFeeException = async (
  data: FeeExceptionSchema & { id: string }
): Promise<ResponseState> => {
  try {
    const { userId } = auth();
    if (!userId) {
      return {
        success: false,
        error: true,
        message: "Unauthorized",
      };
    }

    if (data.endDate && data.startDate > data.endDate) {
      return {
        success: false,
        error: true,
        message: "End date must be after start date",
      };
    }

    const result = await prisma.$transaction(async (tx) => {
      const existingException = await tx.feeException.findUnique({
        where: { id: data.id },
      });

      if (!existingException) {
        throw new Error("Fee exception not found");
      }

      const feeStructure = await tx.feeStructure.findUnique({
        where: { id: data.feeStructureId },
      });

      if (!feeStructure) {
        throw new Error("Fee structure not found");
      }

      if (!feeStructure.termId || !feeStructure.academicYearId) {
        throw new Error("Fee structure must have term and academic year");
      }

      if (data.isActive) {
        const otherActiveException = await tx.feeException.findFirst({
          where: {
            id: { not: data.id },
            studentId: data.studentId,
            feeStructureId: data.feeStructureId,
            isActive: true,
          },
        });

        if (otherActiveException) {
          throw new Error("Another active fee exception exists");
        }
      }

      const updatedException = await tx.feeException.update({
        where: { id: data.id },
        data: {
          studentId: data.studentId,
          feeStructureId: data.feeStructureId,
          amount: data.amount,
          reason: data.reason,
          startDate: data.startDate,
          endDate: data.endDate,
          isActive: data.isActive,
        },
      });

      if (data.isActive) {
        await createOrUpdateFeeStatusAndPayment({
          studentId: data.studentId,
          feeStructureId: data.feeStructureId,
          exceptionAmount: data.amount,
          dueDate: feeStructure.dueDate,
          isUpdate: true,
          previousAmount: existingException.amount
        });
      }

      return updatedException;
    });

    return {
      success: true,
      error: false,
      message: "Fee exception updated successfully",
      data: result,
    };
  } catch (error) {
    console.error("Error updating fee exception:", error);
    return {
      success: false,
      error: true,
      message: error instanceof Error ? error.message : "Failed to update fee exception",
    };
  }
};