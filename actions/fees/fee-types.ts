'use server'

import prisma from "@/lib/prisma";
import { FeeTypeSchema } from "@/schemas/fee-type-schema";

type ResponseState = {
  success: boolean;
  error: boolean;
  message?: string;
  messages?: string[];
};

export const createFeeType = async (data: FeeTypeSchema): Promise<ResponseState> => {
  try {
    await prisma.feeType.create({
      data: {
        name: data.name,
        description: data.description || null,
        amount: data.amount || null,
        schoolId: data.schoolId || null,
      },
    });


    return {
      success: true,
      error: false,
      message: "Fee type created successfully"
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: true,
      message: "Failed to create fee type"
    };
  }
};

export const updateFeeType = async (data: FeeTypeSchema): Promise<ResponseState> => {
  try {
    if (!data.id) {
      return {
      success: false,
      error: true,
      message: "Failed to update fee type"
    };
    }

    // First check if fee type exists
    const existingFeeType = await prisma.feeType.findUnique({
      where: { id: data.id },
      include: {
        feeStructures: true
      }
    });

    if (!existingFeeType) {
      return {
        success: false,
        error: true,
        message: "Fee type not found"
      };
    }

    await prisma.feeType.update({
      where: { id: data.id },
      data: {
        name: data.name,
        description: data.description || null,
        amount: data.amount || null,
        schoolId: data.schoolId || null,
      },
    });


    return {
      success: true,
      error: false,
      message: "Fee type updated successfully"
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: true,
      message:"Failed to update fee type"
    };
  }
};

export const deleteFeeType = async (
  currentState: ResponseState,
  formData: FormData
): Promise<ResponseState> => {
  try {
    const id = formData.get("id");

    if (!id || typeof id !== "string") {
      return {
        success: true,
        error: false,
        message: "Invalid fee type ID"
      };
    }

    // Check if the fee type exists and has any associated structures
    const feeType = await prisma.feeType.findUnique({
      where: { id },
      include: { 
        feeStructures: true 
      }
    });

    if (!feeType) {
      return {
        success: false,
        error: true,
        message: "Fee type not found"
      };
    
    }

    if (feeType.feeStructures.length > 0) {
      return {
        success: false,
        error: true,
        message: "Cannot delete fee type with existing fee structures"
      };
    }
      

    await prisma.feeType.delete({
      where: { id },
    });


    return {
      success: true,
      error: false,
      message: "Fee type deleted successfully"
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: true,
      message: "Failed to delete fee type"
    };
  }
};

// export const getFeeTypeById = async (id: string) => {
//   try {
//     const feeType = await prisma.feeType.findUnique({
//       where: { id },
//       include: {
//         school: true,
//         feeStructures: {
//           include: {
//             academicYear: true,
//             term: true,
//             student: true,
//             class: true
//           }
//         }
//       }
//     });

//     if (!feeType) {
//       throw new AppError("Fee type not found", "NOT_FOUND");
//     }

//     return feeType;
//   } catch (error) {
//     console.error(error);
//     const err = handleError(error);
//     throw err;
//   }
// };

// // Additional utility functions

// export const validateFeeType = async (id: string) => {
//   try {
//     const feeType = await prisma.feeType.findUnique({
//       where: { id },
//       include: {
//         feeStructures: true
//       }
//     });

//     if (!feeType) {
//       throw new AppError("Fee type not found", "NOT_FOUND");
//     }

//     return {
//       exists: true,
//       hasStructures: feeType.feeStructures.length > 0,
//       data: feeType
//     };
//   } catch (error) {
//     console.error(error);
//     const err = handleError(error);
//     throw err;
//   }
// };

// export const bulkDeleteFeeTypes = async (ids: string[]): Promise<ResponseState> => {
//   try {
//     // Check if any fee type has structures
//     const feeTypes = await prisma.feeType.findMany({
//       where: {
//         id: {
//           in: ids
//         }
//       },
//       include: {
//         feeStructures: true
//       }
//     });

//     const typesWithStructures = feeTypes.filter(type => type.feeStructures.length > 0);
//     if (typesWithStructures.length > 0) {
//       throw new AppError(
//         "Cannot delete fee types with existing structures", 
//         "VALIDATION_ERROR"
//       );
//     }

//     await prisma.feeType.deleteMany({
//       where: {
//         id: {
//           in: ids
//         }
//       }
//     });

//     revalidatePath('/fee-types');

//     return {
//       success: true,
//       error: false,
//       message: "Fee types deleted successfully"
//     };
//   } catch (error) {
//     console.error(error);
//     const err = handleError(error);
//     return {
//       success: false,
//       error: true,
//       message: err.message || "Failed to delete fee types"
//     };
//   }
// };

// // Function to check if a fee type name already exists
// export const checkFeeTypeName = async (name: string, schoolId: string | null, excludeId?: string) => {
//   try {
//     const existingFeeType = await prisma.feeType.findFirst({
//       where: {
//         name: {
//           equals: name,
//           mode: 'insensitive'
//         },
//         schoolId: schoolId,
//         id: {
//           not: excludeId
//         }
//       }
//     });

//     return !!existingFeeType;
//   } catch (error) {
//     console.error(error);
//     return false;
//   }
// };