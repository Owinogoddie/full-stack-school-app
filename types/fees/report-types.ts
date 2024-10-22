export interface CollectionSummary {
    totalCollected: number;
    totalPending: number;
    totalOverdue: number;
    collectionByMonth: {
      month: string;
      collected: number;
      pending: number;
    }[];
    collectionByClass: {
      className: string;
      collected: number;
      pending: number;
      studentCount: number;
    }[];
    collectionByFeeType: {
      feeType: string;
      amount: number;
      percentage: number;
    }[];
  }
  
  export interface CollectionSummaryFilters {
    academicYearId?: number;
    termId?: string;
    classIds?: number[];
    gradeIds?: number[];
    startDate?: Date;
    endDate?: Date;
  }