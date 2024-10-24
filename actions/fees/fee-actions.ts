'use server'

import prisma from "@/lib/prisma";
import { FeeSchema } from "@/schemas/fee-schema";
type ResponseState = {
  success: boolean;
  error: boolean;
  message?: string;
  messages?: string[];
};

export const createFee = async (data: FeeSchema): Promise<ResponseState> => {
  try {
    // Create the new fee
    await prisma.fee.create({
      data: {
        name: data.name,
        description: data.description,
        // Convert number to Prisma.Decimal
        amount: data.amount,
        termId: data.termId || null,
        academicYearId: data.academicYearId || null,
        templateId: data.feeTemplateId,
        // Optional template relation
        // feeTypeId: data.id || null,
        // Handle many-to-many relationships
        grades: data.gradeIds?.length ? {
          connect: data.gradeIds.map((gradeId:any) => ({ id: Number(gradeId) }))
        } : undefined,
        classes: data.classIds?.length ? {
          connect: data.classIds.map((classId:any) => ({ id: Number(classId) }))
        } : undefined,
        studentCategories: data.studentCategoryIds?.length ? {
          connect: data.studentCategoryIds.map((categoryId:any) => ({ id: categoryId }))
        } : undefined,
        specialPrograms: data.specialProgrammeIds?.length ? {
          connect: data.specialProgrammeIds.map((programId:any) => ({ id: programId }))
        } : undefined,
      },
      include: {
        grades: true,
        classes: true,
        studentCategories: true,
        specialPrograms: true,
        feeType: true,
        term: true,
        academicYear: true,
      },
    });

    return { 
      success: true, 
      error: false, 
      message: "Fee created successfully" 
    };
  } catch (err) {
    console.error(err);
    return { 
      success: false, 
      error: true, 
      message: "Failed to create fee" 
    };
  }
};

export const updateFee = async (data: FeeSchema): Promise<ResponseState> => {
  try {
    if (!data.id) {
      throw new Error("Fee ID is required for update");
    }

    // Update the fee
    await prisma.fee.update({
      where: { id: data.id },
      data: {
        name: data.name,
        description: data.description,
        amount: data.amount,
        termId: data.termId || null,
        academicYearId: data.academicYearId || null,
        templateId: data.feeTemplateId,
        // Handle many-to-many relationships
        grades: {
          set: [], // First disconnect all
          connect: data.gradeIds?.map((gradeId:any) => ({ id: Number(gradeId) })) || []
        },
        classes: {
          set: [],
          connect: data.classIds?.map((classId:any) => ({ id: Number(classId) })) || []
        },
        studentCategories: {
          set: [],
          connect: data.studentCategoryIds?.map((categoryId:any) => ({ id: categoryId })) || []
        },
        specialPrograms: {
          set: [],
          connect: data.specialProgrammeIds?.map((programId:any) => ({ id: programId })) || []
        },
      },
      include: {
        grades: true,
        classes: true,
        studentCategories: true,
        specialPrograms: true,
        template: true,
        term: true,
        academicYear: true,
      },
    });

    return { 
      success: true, 
      error: false, 
      message: "Fee updated successfully" 
    };
  } catch (err) {
    console.error(err);
    return { 
      success: false, 
      error: true, 
      message: "Failed to update fee" 
    };
  }
};

export const deleteFee = async (
  currentState: ResponseState,
  formData: FormData
): Promise<ResponseState> => {
  try {
    const idValue = formData.get("id");

    if (!idValue || typeof idValue !== "string") {
      return { 
        success: false, 
        error: true, 
        message: "Invalid fee ID" 
      };
    }

    // Check if the fee exists
    const fee = await prisma.fee.findUnique({
      where: { id: idValue },
      include: {
        ledgerEntries: true,
        payments: true,
        feeExceptions: true,
      },
    });

    if (!fee) {
      return { 
        success: false, 
        error: true, 
        message: "Fee not found" 
      };
    }

    // Check if fee can be deleted (no associated payments or ledger entries)
    if (fee.ledgerEntries.length > 0 || fee.payments.length > 0) {
      return {
        success: false,
        error: true,
        message: "Cannot delete fee with associated payments or ledger entries"
      };
    }

    // Delete associated fee exceptions first
    if (fee.feeExceptions.length > 0) {
      await prisma.feeException.deleteMany({
        where: { feeId: idValue },
      });
    }

    // Delete the fee
    await prisma.fee.delete({
      where: { id: idValue },
    });

    return { 
      success: true, 
      error: false, 
      message: "Fee deleted successfully" 
    };
  } catch (err) {
    console.error(err);
    return { 
      success: false, 
      error: true, 
      message: "Failed to delete fee" 
    };
  }
};

export const getFee = async (id: string): Promise<{ fee: any; error: string | null }> => {
  try {
    const fee = await prisma.fee.findUnique({
      where: { id },
      include: {
        grades: true,
        classes: true,
        studentCategories: true,
        specialPrograms: true,
        feeType: true,
        term: true,
        academicYear: true,
      },
    });

    if (!fee) {
      return { fee: null, error: "Fee not found" };
    }

    return { fee, error: null };
  } catch (err) {
    console.error(err);
    return { fee: null, error: "Failed to fetch fee" };
  }
};