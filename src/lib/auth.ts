import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

/** Returns the signed-in admin (fresh from the DB) or null. */
export async function getCurrentUser() {
  const store = await cookies();
  const session = await verifySession(store.get(SESSION_COOKIE)?.value);
  if (!session) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { id: true, name: true, email: true, role: true },
  });
  return user;
}

/** Use at the top of every admin page and server action. */
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  return user;
}
