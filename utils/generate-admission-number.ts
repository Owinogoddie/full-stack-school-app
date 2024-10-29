type AdmissionPattern = {
    prefix: string;
    yearFormat: any
    digitCount: number;
    separator?: string;
    lastNumber: number;
    schoolId?: string;
  };
  
  // utils/generate-admission-number.ts
  export const generateAdmissionNumber = (pattern: AdmissionPattern): string => {
    const {
      prefix,
      yearFormat,
      digitCount,
      separator = "",
      lastNumber
    } = pattern;
  
    // Get current year
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    
    // Format year based on yearFormat
    const formattedYear = yearFormat === "YY" 
      ? year.toString().slice(-2) 
      : year.toString();
  
    // Format number with leading zeros
    const formattedNumber = (lastNumber + 1)
      .toString()
      .padStart(digitCount, "0");
  
    // Combine all parts with optional separator
    return `${prefix}${formattedYear}${separator}${formattedNumber}`;
  };
  
  // Example usage:
  // const pattern = {
  //   prefix: "ADM",
  //   yearFormat: "YY" as const,
  //   digitCount: 4,
  //   separator: "/",
  //   lastNumber: 0,
  //   schoolId: "school-uuid-here"
  // };
  // 
  // console.log(generateAdmissionNumber(pattern));
  // Output: "ADM24/0001"

  interface AdmissionPatternn {
    prefix: string;
    yearFormat: string;
    digitCount: number;
    separator?: string;
    lastNumber: number;
  }
  
  interface GenerateAdmissionNumberResult {
    admissionNumber: string;
    newLastNumber: number;
  }
  
  export const generateNewAdmNumber: (pattern: AdmissionPatternn) => GenerateAdmissionNumberResult = (pattern) => {
    const {
      prefix,
      yearFormat,
      digitCount,
      separator = "",
      lastNumber
    } = pattern;
  
    // Get current year
    const currentDate = new Date();
    const year = currentDate.getFullYear();
  
    // Format year based on yearFormat
    const formattedYear = yearFormat === "YY"
      ? year.toString().slice(-2)
      : year.toString();
  
    const newLastNumber = lastNumber + 1;
  
    // Format number with leading zeros
    const formattedNumber = newLastNumber.toString().padStart(digitCount, "0");
  
    // Combine all parts with optional separator
    const admissionNumber = `${prefix}${formattedYear}${separator}${formattedNumber}`;
  
    return {
      admissionNumber,
      newLastNumber
    };
  };
  