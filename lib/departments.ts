// '@/lib/departments.ts'

export const departmentOptions = [
    { id: "1", label: "Mathematics Department" },
    { id: "2", label: "Science Department" },
    { id: "3", label: "Languages Department" },
    { id: "4", label: "Humanities Department" },
    { id: "5", label: "Technical and Applied Studies Department" },
    { id: "6", label: "Physical Education Department" },
    { id: "7", label: "Creative Arts Department" },
    { id: "8", label: "ICT and Innovation Department" },
    { id: "9", label: "Special Needs Education Department" },
    { id: "10", label: "Early Childhood Development Education (ECDE) Department" },
    { id: "11", label: "Guidance and Counselling Department" },
  ];

  // Transforming to the required format
export const formattedDepartmentOptions = departmentOptions.map(department => ({
    value: department.id,  // Assign id to value
    label: department.label,
  }));
  