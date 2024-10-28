import { FeeException } from "@prisma/client";

export interface StudentFeeData {
    student: {
      id: string;
      upi: string;
      admissionNumber: string;
      firstName: string;
      lastName: string;
      grade: string;
      class: string|""; // Make this required
      gender: string;
      status: string;
      categories: string[];
      specialProgrammes: string[];
    };
    feeSummary: {
      totalOriginalAmount: number;
      totalApplicableAmount: number;
      totalPaidAmount: number;
      totalRemainingAmount: number;
      availableExcessFees: number;
      finalRemainingAmount: number;
    };
    unpaidFees: {
      feeStructureId: string;
      feeType: string;
      originalAmount: number;
      applicableAmount: number;
      paidAmount: number;
      remainingAmount: number;
      dueDate: string;
      isOverdue: boolean;
      hasException: boolean;
      exception: FeeException | null;
      status: string;
    }[];
  }

//   interface Student {
//     id: string;
//     upi: string;
//     admissionNumber: string;
//     firstName: string;
//     lastName: string;
//     grade: string;
//     class: string;
//     gender: string;
//     status: string;
//     categories: string[];
//     specialProgrammes: string[];
//   }
  
//   interface FeeException {
//     id: string;
//     amount: number;
//     reason: string;
//   }
  
  