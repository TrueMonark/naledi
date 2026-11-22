import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/admin/admin-shell";
import { getContent } from "@/lib/content";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin", robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  const [unread, site] = await Promise.all([prisma.contactMessage.count({ where: { read: false } }), getContent("site")]);
  return <AdminShell unread={unread} user={user} logo={site.logo}>{children}</AdminShell>;
}
