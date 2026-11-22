import { AdminHeader } from "@/components/admin/admin-shell";
import { prisma } from "@/lib/prisma";
import { DevotionManager } from "./devotion-manager";

export default async function DevotionsAdminPage({ searchParams }: { searchParams: Promise<{ new?: string }> }) {
  const [items, { new: isNew }] = await Promise.all([prisma.devotion.findMany({ orderBy: { date: "desc" } }), searchParams]);
  return (
    <>
      <AdminHeader title="Devotions" description="Daily reflections. The newest one is featured on the home page." />
      <DevotionManager items={items.map((d) => ({ ...d, date: d.date.toISOString().slice(0, 10) }))} openNew={!!isNew} />
    </>
  );
}
