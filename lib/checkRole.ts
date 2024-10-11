import { auth } from "@clerk/nextjs/server";

export function checkRole() {
  const { sessionClaims } = auth();
  return (sessionClaims?.metadata as { role?: string })?.role;
}