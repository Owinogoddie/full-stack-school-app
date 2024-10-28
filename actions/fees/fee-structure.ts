// actions/fees/fee-structure-actions.ts
'use server'

import prisma from "@/lib/prisma";
import { FeeStructureSchema } from "@/schemas/fee-structure-schema";
import { createFeeAuditLog } from "./create-auditlog";

type ResponseState = {
  success: boolean;
  error: boolean;
  message?: string;
};

export const createFeeStructure = async (data: FeeStructureSchema): Promise<ResponseState> => {
  try {
    return await prisma.$transaction(async (tx) => {
      // Validate categories
      const categories = await tx.studentCategory.findMany({
        where: { id: { in: data.categoryIds } }
      });

      if (categories.length !== data.categoryIds.length) {
        return {
          success: false,
          error: true,
          message: "One or more invalid category IDs provided",
        };
      }

      // Validate fee type
      const feeType = await tx.feeType.findUnique({
        where: { id: data.feeTypeId }
      });

      if (!feeType) {
        return {
          success: false,
          error: true,
          message: "Invalid fee type ID provided",
        };
      }

      // Validate academic year
      const academicYear = await tx.academicYear.findUnique({
        where: { id: data.academicYearId }
      });

      if (!academicYear) {
        return {
          success: false,
          error: true,
          message: "Invalid academic year ID provided",
        };
      }

      // Check for existing fee structure with same criteria
      const existingFeeStructure = await tx.feeStructure.findFirst({
        where: {
          feeTypeId: data.feeTypeId,
          categories: {
            some: {
              id: {
                in: data.categoryIds
              }
            }
          },
          academicYearId: data.academicYearId,
          termId: data.termId,
          grades: {
            some: {
              id: {
                in: data.gradeIds
              }
            }
          },
          classes: {
            some: {
              id: {
                in: data.classIds
              }
            }
          }
        },
      });

      if (existingFeeStructure) {
        return {
          success: false,
          error: true,
          message: "A fee structure with these criteria already exists",
        };
      }

      const feeStructure = await tx.feeStructure.create({
        data: {
          feeTypeId: data.feeTypeId,
          categories: {
            connect: data.categoryIds.map(id => ({ id }))
          },
          amount: data.amount,
          frequency: data.frequency,
          academicYearId: data.academicYearId,
          termId: data.termId,
          dueDate: data.dueDate,
          grades: data.gradeIds?.length ? {
            connect: data.gradeIds.map((gradeId: any) => ({ id: Number(gradeId) }))
          } : undefined,
          classes: data.classIds?.length ? {
            connect: data.classIds.map((classId: any) => ({ id: Number(classId) }))
          } : undefined,
          specialProgrammes: {
            connect: data.specialProgrammes?.map(id => ({ id })) || [],
          },
          isActive: true,
        },
        include: {
          feeType: true,
          categories: true,
          grades: true,
          classes: true,
          academicYear: true,
          term: true,
        },
      });

      // Create audit log
      await createFeeAuditLog({
        entityType: "FEE_STRUCTURE",
        entityId: feeStructure.id,
        action: "CREATE",
        changes: JSON.stringify(data),
        performedBy: "system",
        oldValues: null,
        newValues: feeStructure,
      });

      return { success: true, error: false, message: "Fee structure created successfully" };
    });
  } catch (err) {
    console.error(err);
    return { success: false, error: true, message: "Failed to create fee structure" };
  }
};

export const updateFeeStructure = async (data: FeeStructureSchema): Promise<ResponseState> => {
  try {
    if (!data.id) {
      throw new Error("Fee Structure ID is required for update");
    }

    return await prisma.$transaction(async (tx) => {
      // Get existing fee structure for audit log
      const existingFeeStructure = await tx.feeStructure.findUnique({
        where: { id: data.id },
        include: {
          feeType: true,
          categories: true,
          grades: true,
          classes: true,
          academicYear: true,
          term: true,
          specialProgrammes: true,
        },
      });

      if (!existingFeeStructure) {
        return {
          success: false,
          error: true,
          message: "Fee structure not found",
        };
      }

      // Check for duplicate fee structure
      const duplicateFeeStructure = await tx.feeStructure.findFirst({
        where: {
          id: { not: data.id },
          feeTypeId: data.feeTypeId,
          categories: {
            some: {
              id: {
                in: data.categoryIds
              }
            }
          },
          academicYearId: data.academicYearId,
          termId: data.termId,
          grades: {
            some: {
              id: {
                in: data.gradeIds
              }
            }
          },
          classes: {
            some: {
              id: {
                in: data.classIds
              }
            }
          }
        },
      });

      if (duplicateFeeStructure) {
        return {
          success: false,
          error: true,
          message: "A fee structure with these criteria already exists",
        };
      }

      const updatedFeeStructure = await tx.feeStructure.update({
        where: { id: data.id },
        data: {
          feeTypeId: data.feeTypeId,
          categories: {
            set: data.categoryIds.map(id => ({ id }))
          },
          amount: data.amount,
          frequency: data.frequency,
          academicYearId: data.academicYearId,
          termId: data.termId,
          dueDate: data.dueDate,
          grades: data.gradeIds?.length ? {
            set: data.gradeIds.map((gradeId: any) => ({ id: Number(gradeId) }))
          } : undefined,
          classes: data.classIds?.length ? {
            set: data.classIds.map((classId: any) => ({ id: Number(classId) }))
          } : undefined,
          specialProgrammes: {
            set: data.specialProgrammes?.map(id => ({ id })) || [],
          },
          isActive: data.isActive,
        },
        include: {
          feeType: true,
          categories: true,
          grades: true,
          classes: true,
          academicYear: true,
          term: true,
        },
      });

      // Create audit log
      await createFeeAuditLog({
        entityType: "FEE_STRUCTURE",
        entityId: data.id || "",
        action: "UPDATE",
        changes: JSON.stringify(data),
        performedBy: "system",
        oldValues: existingFeeStructure,
        newValues: updatedFeeStructure,
      });

      return { success: true, error: false, message: "Fee structure updated successfully" };
    });
  } catch (err) {
    console.error(err);
    return { success: false, error: true, message: "Failed to update fee structure" };
  }
};

export const deleteFeeStructure = async (
  currentState: ResponseState,
  formData: FormData
): Promise<ResponseState> => {
  try {
    const id = formData.get("id");
    if (!id || typeof id !== "string") {
      return { success: false, error: true, message: "Invalid fee structure ID" };
    }

    return await prisma.$transaction(async (tx) => {
      // Get existing fee structure for audit log
      const existingFeeStructure = await tx.feeStructure.findUnique({
        where: { id },
        include: {
          feeType: true,
          categories: true,
          grades: true,
          classes: true,
          academicYear: true,
          term: true,
          specialProgrammes: true,
        },
      });

      if (!existingFeeStructure) {
        return {
          success: false,
          error: true,
          message: "Fee structure not found",
        };
      }

      // Check if there are any fee statuses or exceptions linked to this structure
      const [feeStatusCount, feeExceptionCount] = await Promise.all([
        tx.feeStatus.count({ where: { feeStructureId: id } }),
        tx.feeException.count({ where: { feeStructureId: id } }),
      ]);

      if (feeStatusCount > 0 || feeExceptionCount > 0) {
        return {
          success: false,
          error: true,
          message: "Cannot delete fee structure with linked records",
        };
      }

      await tx.feeStructure.delete({
        where: { id },
      });

      // Create audit log
      await createFeeAuditLog({
        entityType: "FEE_STRUCTURE",
        entityId: id,
        action: "DELETE",
        changes: "Deleted fee structure",
        performedBy: "system",
        oldValues: existingFeeStructure,
        newValues: null,
      });

      return { success: true, error: false, message: "Fee structure deleted successfully" };
    });
  } catch (err) {
    console.error(err);
    return { success: false, error: true, message: "Failed to delete fee structure" };
  }
};