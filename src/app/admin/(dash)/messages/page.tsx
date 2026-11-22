import { AdminHeader } from "@/components/admin/admin-shell";
import { prisma } from "@/lib/prisma";
import { Inbox } from "./inbox";

export default async function MessagesPage() {
  const msgs = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <>
      <AdminHeader title="Messages" description="Enquiries sent through the website contact form." />
      <Inbox messages={msgs.map((m) => ({ ...m, createdAt: m.createdAt.toISOString() }))} />
    </>
  );
}
