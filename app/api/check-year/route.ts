import { checkCurrentYear } from "@/lib/checkCurrentYear";
import { checkRole } from "@/lib/checkRole";
import { NextResponse } from "next/server";

export async function GET() {
  const hasCurrentYear = await checkCurrentYear();
  const userRole = checkRole();

  return NextResponse.json({ hasCurrentYear, userRole });
}