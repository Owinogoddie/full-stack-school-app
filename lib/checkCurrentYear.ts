import prisma from "@/lib/prisma";

export async function checkCurrentYear() {
  const currentYear = await prisma.academicYear.findFirst({
    where: {
      currentAcademicYear: true,
      endDate: {
        gt: new Date()
      }
    }
  });

  return currentYear !== null;
}