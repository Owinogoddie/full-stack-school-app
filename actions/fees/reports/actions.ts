'use server'
import prisma from "@/lib/prisma";

export interface CollectionFilters {
  startDate?: string;
  endDate?: string;
  gradeId?: string;
  classId?: string;
  academicYearId?: number;
  termId?: string;
}

interface MonthlyCollection {
  month: string;
  collected: number;
  pending: number;
}

interface FeeTypeCollection {
  feeType: string;
  amount: number;
}

interface ClassCollection {
  className: string;
  collected: number;
  pending: number;
}

interface GradeCollection {
  gradeName: string;
  collected: number;
  pending: number;
}

export interface CollectionSummary {
    totalCollected: number;
    totalPending: number;
    totalOverdue: number;
    collectionRate: number;
    collectedChange: number;
    pendingChange: number;
    overdueChange: number;
    collectionByMonth: MonthlyCollection[];
    collectionByFeeType: FeeTypeCollection[];
    collectionByClass: ClassCollection[];
    collectionByGrade: GradeCollection[];
}  
export async function getCollectionSummary(
    filters: CollectionFilters
  ): Promise<CollectionSummary> {
    // Get current period data
    const currentData = await getPeriodData(filters);
    
    // Calculate previous period dates
    const previousPeriodFilters = {
      ...filters,
      startDate: getPreviousPeriodDate(filters.startDate),
      endDate: getPreviousPeriodDate(filters.endDate),
    };
    
    // Get previous period data
    const previousData = await getPeriodData(previousPeriodFilters);
  
    // Calculate percentage changes
    const collectedChange = calculatePercentageChange(
      currentData.totalCollected, 
      previousData.totalCollected
    );
    
    const pendingChange = calculatePercentageChange(
      currentData.totalPending, 
      previousData.totalPending
    );
    
    const overdueChange = calculatePercentageChange(
      currentData.totalOverdue, 
      previousData.totalOverdue
    );
  
    return {
      ...currentData,
      collectedChange,
      pendingChange,
      overdueChange,
    };
  }
  
  async function getPeriodData(filters: CollectionFilters) {
    const {
      startDate,
      endDate,
      academicYearId,
      termId,
    } = filters;
  
    // Get fee statuses for the period
    const feeStatuses = await prisma.feeStatus.findMany({
      where: {
        ...(academicYearId && { academicYearId }),
        ...(termId && { termId }),
        ...(startDate && {
          createdAt: { gte: new Date(startDate) }
        }),
        ...(endDate && {
          createdAt: { lte: new Date(endDate) }
        }),
      },
      include: {
        payments: {
          where: {
            status: "COMPLETED",
          },
        },
        student: {
          include: {
            class: true,
            grade: true,
          },
        },
        feeStructure: {
          include: {
            feeType: true,
          },
        },
      },
    });
  
    // Calculate totals
    const totalCollected = feeStatuses.reduce((sum, status) => 
      sum + status.paidAmount, 
      0
    );
  
    const totalPending = feeStatuses.reduce((sum, status) => {
      const pending = status.dueAmount - status.paidAmount;
      return status.status !== "COMPLETED" ? sum + pending : sum;
    }, 0);
  
    const totalOverdue = feeStatuses.reduce((sum, status) => {
      const pending = status.dueAmount - status.paidAmount;
      return status.status === "OVERDUE" ? sum + pending : sum;
    }, 0);
  
    const collectionRate = totalCollected / (totalCollected + totalPending) * 100;
  
    // Calculate breakdowns
    const collectionByMonth = calculateMonthlyCollections(feeStatuses);
    const collectionByFeeType = calculateFeeTypeCollections(feeStatuses);
    const collectionByClass = calculateClassCollections(feeStatuses);
    const collectionByGrade = calculateGradeCollections(feeStatuses);
  
    return {
      totalCollected,
      totalPending,
      totalOverdue,
      collectionRate,
      collectionByMonth,
      collectionByFeeType,
      collectionByClass,
      collectionByGrade,
    };
  }
  
  // Helper functions
  
  function getPreviousPeriodDate(dateStr?: string): string | undefined {
    if (!dateStr) return undefined;
    const date = new Date(dateStr);
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  }
  
  function calculatePercentageChange(current: number, previous: number): number {
    if (!previous) return 0;
    return Number(((current - previous) / previous * 100).toFixed(1));
  }
  
  // Updated calculation functions to work with FeeStatus records
  
  function calculateMonthlyCollections(feeStatuses: any[]): MonthlyCollection[] {
    const monthlyData: { [key: string]: { collected: number; pending: number } } = {};
  
    feeStatuses.forEach((status) => {
      const month = new Date(status.createdAt).toLocaleString('default', { month: 'long' });
      if (!monthlyData[month]) {
        monthlyData[month] = { collected: 0, pending: 0 };
      }
      monthlyData[month].collected += status.paidAmount;
      monthlyData[month].pending += status.dueAmount - status.paidAmount;
    });
  
    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      ...data,
    }));
  }
  
  function calculateFeeTypeCollections(feeStatuses: any[]): FeeTypeCollection[] {
    const feeTypeData: { [key: string]: number } = {};
  
    feeStatuses.forEach((status) => {
      const feeType = status.feeStructure.feeType.name;
      feeTypeData[feeType] = (feeTypeData[feeType] || 0) + status.paidAmount;
    });
  
    return Object.entries(feeTypeData).map(([feeType, amount]) => ({
      feeType,
      amount,
    }));
  }
  
  function calculateClassCollections(feeStatuses: any[]): ClassCollection[] {
    const classData: { [key: string]: { collected: number; pending: number } } = {};
  
    feeStatuses.forEach((status) => {
      const className = status.student.class?.name || 'Unassigned';
      if (!classData[className]) {
        classData[className] = { collected: 0, pending: 0 };
      }
      classData[className].collected += status.paidAmount;
      classData[className].pending += status.dueAmount - status.paidAmount;
    });
  
    return Object.entries(classData).map(([className, data]) => ({
      className,
      ...data,
    }));
  }
  
  function calculateGradeCollections(feeStatuses: any[]): GradeCollection[] {
    const gradeData: { [key: string]: { collected: number; pending: number } } = {};
  
    feeStatuses.forEach((status) => {
      const gradeName = status.student.grade?.name || 'Unassigned';
      if (!gradeData[gradeName]) {
        gradeData[gradeName] = { collected: 0, pending: 0 };
      }
      gradeData[gradeName].collected += status.paidAmount;
      gradeData[gradeName].pending += status.dueAmount - status.paidAmount;
    });
  
    return Object.entries(gradeData).map(([gradeName, data]) => ({
      gradeName,
      ...data,
    }));
  }