import { AdminHeader } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AccountForms } from "./account-forms";

export default async function AccountPage() {
  const me = await requireAdmin();
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" }, select: { id: true, name: true, email: true, createdAt: true } });
  return (
    <>
      <AdminHeader title="Account & users" description="Change your password and manage who can sign in to the admin." />
      <AccountForms meId={me.id} users={users.map((u) => ({ ...u, createdAt: u.createdAt.toISOString() }))} />
    </>
  );
}
