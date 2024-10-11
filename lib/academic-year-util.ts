import prisma from "@/lib/prisma";

export const getCurrentAcademicYear = async () => {
  const currentYear = await prisma.academicYear.findFirst({
    where: { currentAcademicYear: true },
  });

  if (!currentYear) {
    throw new Error("No active academic year found. Please add or set an academic year as current.");
  }

  return currentYear;
};
