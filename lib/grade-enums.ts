import {z} from 'zod'
const GradeLevelEnum = z.enum([
    "PP1",
    "PP2",
    "GRADE1",
    "GRADE2",
    "GRADE3",
    "GRADE4",
    "GRADE5",
    "GRADE6",
    "GRADE7",
    "GRADE8",
    "GRADE9",
    "GRADE10",
    "GRADE11",
    "GRADE12",
  ]);
  
  const StageEnum = z.enum([
    "PRE_PRIMARY",
    "PRIMARY",
    "JUNIOR_SECONDARY",
    "SENIOR_SECONDARY",
  ]);
  
  // Create formatted options
  export const formattedGradeLevelOptions = GradeLevelEnum.options.map((level) => ({
    value: level,
    label: level,
  }));
  
  export const formattedStageOptions = StageEnum.options.map((stage) => ({
    value: stage,
    label: stage,
  }));
  